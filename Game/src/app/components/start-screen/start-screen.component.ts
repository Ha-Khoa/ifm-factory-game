import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { UI_THEME, loadTheme } from '../../services/ui/theme.manager';
import { RenderingService } from '../../services/rendering.service';
import { Gamefield } from '../../models/gamefield/gamefield';
import { GameService } from '../../services/game.service';
import { ApiService } from '../../services/api.service';
import { PlayerInterface } from '../../interfaces/ui/playerInterface';
import { InputService } from '../../services/input.service';
import { Subscription } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { GameOverScreen } from './game-over.screen';
import { StartScreenRenderer } from './start-screen.renderer';
import { PauseScreen } from './pause.screen';

/**
 * Die StartScreenComponent stellt den Einstiegsbildschirm des Spiels dar.
 * Sie rendert ein interaktives Arcade-Interface auf ein Canvas und behandelt
 * Benutzereingaben sowie die 3D-Positionierung im Spielraum.
 */
@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [],
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.css']
})
export class StartScreenComponent implements OnInit, OnDestroy, AfterViewInit {
  // --- Referenzen auf DOM-Elemente ---
  @ViewChild('startScreenCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('startScreenContainer') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('topSection') topSectionRef!: ElementRef<HTMLDivElement>;
  @ViewChild('bottomSection') bottomSectionRef!: ElementRef<HTMLDivElement>;
  @ViewChild('screenContainer') screenContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('phone') phoneRef!: ElementRef<HTMLDivElement>;
  @ViewChild('homeButton') homeButtonRef!: ElementRef<HTMLDivElement>;
  @ViewChild('camera') startScreenContainerRef!: ElementRef<HTMLDivElement>;

  // --- Ereignisse (Outputs) ---
  @Output() startClicked = new EventEmitter<void>();
  @Output() settingsClicked = new EventEmitter<void>();
  @Output() tutorialClicked = new EventEmitter<void>();
  @Output() resumeGame = new EventEmitter<void>();

  public screen: 'start' | 'game-over' | 'pause' = 'start';
  private gameOverScreen!: GameOverScreen;
  private pauseScreen!: PauseScreen;
  private renderer!: StartScreenRenderer;
  private styledElements: ElementRef[] = [];

  private isTransitioning = false;
  private transitionStartTime = 0;
  private readonly transitionDuration = 800; // ms


  // --- Interne Zustandsvariablen ---
  private ctx!: CanvasRenderingContext2D;
  private highScores: PlayerInterface[] = [];
  private backgroundVideo!: HTMLVideoElement;
  private gameCanvasSnapshot: HTMLImageElement | null = null;

  // ID für den Animations-Loop (wichtig zum Beenden)
  private animationFrameId: number | null = null;

  // Canvas-Dimensionen (feste Referenzgröße)
  private onePlayerHighScores: PlayerInterface[] = [];
  private twoPlayerHighScores: PlayerInterface[] = [];
  private backgroundImage!: HTMLImageElement;
  private selectedButtonIndex = 0; // 0: START, 1: Spielermodus, 2: EINSTELLUNGEN
  public isHidden = false; // Steuert die Sichtbarkeit der Komponente

  // Canvas-Dimensionen
  private height: number = 1080;
  private width: number = this.height * window.innerWidth / window.innerHeight;

  private inputSubscriptions: Subscription[] = [];
  private lastInputTime = 0;

  constructor(
    private gameService: GameService,
    private apiService: ApiService,
    private inputService: InputService,
    private playerService: PlayerService,
  ) { }

  /**
   * Initialisierung der Komponente.
   * Lädt das Theme, richtet Canvas und Video ein und startet den Render-Loop.
   */
  ngOnInit(): void {
    loadTheme();
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.setCanvasSize();
    this.renderer = new StartScreenRenderer(this.ctx, this.width, this.height, this.gameService);

    this.gameOverScreen = new GameOverScreen(this.ctx, this.width, this.height, this.playerService);
    this.gameOverScreen.setBackgroundImage('/images/ifm-gameover-background.png');
    this.pauseScreen = new PauseScreen(this.ctx, this.width, this.height);
    this.pauseScreen.setBackgroundImage('/images/ifm-gameover-background.png');

    this.gameService.gameOver$.subscribe(() => {
      this.showGameOver();
    });

    this.inputService.pause$.subscribe(() => {
      if (!this.gameService.isGameLoopRunning()) return;

      if (this.gameService.isPaused) {
        this.gameService.resumeGame();
        this.hidePauseScreenAndResume();
      } else {
        this.gameService.pauseGame();
        this.showPauseScreen();
      }
    });

    if (this.screen === 'start') {
      this.setupInputHandlers();
      // Hintergrundvideo initialisieren
      this.backgroundVideo = document.createElement('video');
      this.backgroundVideo.src = "/images/background.mp4";
      this.backgroundVideo.loop = true;
      this.backgroundVideo.muted = true; // Notwendig für Autoplay ohne Benutzerinteraktion
      this.backgroundVideo.play();

      this.loadHighScores();
      this.animate();
    }
  }

  ngAfterViewInit(): void {
    this.styledElements = [
      this.containerRef,
      this.canvasRef,
      this.topSectionRef,
      this.bottomSectionRef,
      this.screenContainerRef,
      this.homeButtonRef,
      this.startScreenContainerRef
    ];
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.inputSubscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupInputHandlers(): void {
    this.inputService.setInputState('menu');
    this.inputSubscriptions.push(
      this.inputService.menuUp$.subscribe(() => this.handleMenuNavigation('up')),
      this.inputService.menuDown$.subscribe(() => this.handleMenuNavigation('down')),
      this.inputService.menuConfirm$.subscribe(() => this.handleMenuNavigation('confirm'))
    );
  }

  private handleMenuNavigation(action: 'up' | 'down' | 'confirm'): void {
    if (this.isHidden) return;
    const now = Date.now();
    if (now - this.lastInputTime < 150) return; // 150ms debounce
    this.lastInputTime = now;

    if (this.screen === 'game-over') {
      if (action === 'confirm' && !this.isTransitioning) {
        this.startReturnToMenuTransition();
      }
      return;
    }

    if (this.screen === 'pause') {
      switch (action) {
        case 'up':
          this.selectedButtonIndex = (this.selectedButtonIndex - 1 + 2) % 2;
          break;
        case 'down':
          this.selectedButtonIndex = (this.selectedButtonIndex + 1) % 2;
          break;
        case 'confirm':
          this.handleSelection();
          break;
      }
      return;
    }

    // Default Start Screen navigation
    switch (action) {
      case 'up':
        this.selectedButtonIndex = (this.selectedButtonIndex - 1 + 4) % 4;
        this.draw();
        break;
      case 'down':
        this.selectedButtonIndex = (this.selectedButtonIndex + 1) % 4;
        this.draw();
        break;
      case 'confirm':
        this.handleSelection();
        break;
    }
  }

  private startReturnToMenuTransition(): void {
    this.isTransitioning = true;
    this.transitionStartTime = Date.now();
  }

  /**
   * Lädt die Highscores über den API-Service.
   * Sortiert die Liste absteigend und begrenzt sie auf die Top 10.
   */
  private loadHighScores(): void {
    this.apiService.getPlayers().subscribe(players => {
      this.onePlayerHighScores = players
        .filter(p => !p.twoPlayerMode)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      this.twoPlayerHighScores = players
        .filter(p => p.twoPlayerMode)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      this.draw(); // Neuzeichnen mit den Highscore-Daten
    });
  }

  /**
   * Setzt die internen Dimensionen des Canvas-Elements.
   */
  private setCanvasSize(): void {
    this.canvasRef.nativeElement.width = this.width;
    this.canvasRef.nativeElement.height = this.height;
  }

  /**
   * Der Haupt-Animations-Loop.
   * Ruft sich selbst rekursiv über requestAnimationFrame auf.
   */
  private animate(): void {
    if (this.isHidden && this.screen !== 'pause') return;

    if (this.isTransitioning) {
      const now = Date.now();
      const elapsed = now - this.transitionStartTime;
      let progress = elapsed / this.transitionDuration;

      if (progress >= 1) {
        progress = 1;
        this.isTransitioning = false;
        window.location.reload();
        return;
      }

      // Easing function (ease-in-out)
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      const yOffset = ease * this.height;

      // Draw Start Screen (Background)
      this.renderer.drawFrame(
        now,
        this.backgroundVideo,
        this.onePlayerHighScores,
        this.twoPlayerHighScores,
        this.selectedButtonIndex
      );

      // Draw Game Over Screen (Foreground, sliding down)
      this.gameOverScreen.render(yOffset, false);

    } else if (this.screen === 'start') {
      this.draw();
    } else if (this.screen === 'game-over') {
      this.gameOverScreen.render();
    } else if (this.screen === 'pause') {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.pauseScreen.render(this.selectedButtonIndex);
    }
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Zeichnet einen einzelnen Frame des Startbildschirms.
   * Delegiert das Zeichnen an den StartScreenRenderer.
   */
  private draw(): void {
    this.renderer.drawFrame(
      Date.now(),
      this.backgroundVideo,
      this.onePlayerHighScores,
      this.twoPlayerHighScores,
      this.selectedButtonIndex
    );
  }

  public showPauseScreen(): void {
    this.screen = 'pause';
    this.isHidden = false;
    this.resetAllInlineStyles();
    this.setCanvasSize();
    this.setupInputHandlers();
    this.selectedButtonIndex = 0; // Default to RESUME
    this.pauseScreen.resetAnimation();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animate();
  }

  private hidePauseScreenAndResume(): void {
    this.gameCanvasSnapshot = null;
    this.zoomOut(); // Hides the component and unsubscribes from inputs
    this.resumeGame.emit();
  }

  public showGameOver(): void {
    this.resetAllInlineStyles();
    this.screen = 'game-over';
    this.isHidden = false;
    this.setupInputHandlers();
    this.gameOverScreen.resetAnimation();
    this.setCanvasSize();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animate();
  }

  /**
   * Entfernt alle inline-Styles von den relevanten Komponenten-Elementen.
   */
  private resetAllInlineStyles(): void {
    for (const elRef of this.styledElements) {

      if (elRef) {
        elRef.nativeElement.style.cssText = '';
      }
    }
  }

  /**
   * Passt die Canvas-Größe bei Fensteränderungen an.
   */
  @HostListener('window:resize')
  onResize(): void {
    this.setCanvasSize();
  }

  /**
   * Verarbeitet Mausklicks auf dem Canvas und leitet Aktionen ein.
   */
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.isHidden) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();

    // Skalierungsfaktor berechnen (falls Canvas CSS-Größe != interne Größe)
    const scaleX = this.canvasRef.nativeElement.width / rect.width;
    const scaleY = this.canvasRef.nativeElement.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (this.screen === 'pause') {
        const clickedButtonIndex = this.pauseScreen.getClickedButtonIndex(x, y);
        if (clickedButtonIndex !== null) {
            this.handleSelection(clickedButtonIndex);
        }
        return;
    }


    const clickedButtonIndex = this.renderer.getClickedButtonIndex(x, y);
    if (clickedButtonIndex !== null) {
      this.handleSelection(clickedButtonIndex);
    }
  }

  /**
   * Führt die Aktion für den aktuell ausgewählten Button aus.
   */
  private handleSelection(index?: number): void {
    const selection = index ?? this.selectedButtonIndex;

    if (this.screen === 'pause') {
        switch(selection) {
            case 0: // RESUME
                this.gameService.resumeGame();
                this.hidePauseScreenAndResume();
                break;
            case 1: // END GAME
                this.gameService.resumeGame();
                this.hidePauseScreenAndResume();
                this.gameService.gameEnd = true;
                break;
        }
        return;
    }

    switch (selection) {
      case 0: // START
        this.startClicked.emit();
        break;
      case 1: // Spielermodus
        this.gameService.twoPlayerMode = !this.gameService.twoPlayerMode;
        this.draw();
        break;
      case 2:
        this.tutorialClicked.emit()
        break
      case 3: // EINSTELLUNGEN
        this.settingsClicked.emit();
        break
    }}


  /**
   * Startet die Zoom-Out Animation beim Spielstart.
   * Schaltet die Komponente in den Vollbildmodus und deaktiviert Interaktionen.
   */
  public zoomOut() {
    this.isHidden = true;
    if(this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.inputSubscriptions.forEach(sub => sub.unsubscribe());
    this.inputSubscriptions = [];
    const style = this.containerRef.nativeElement.style;

    style.setProperty('top', '0px');
    style.setProperty('left', '0px');
    style.setProperty('width', window.innerWidth + 'px');
    style.setProperty('height', window.innerHeight + 'px');
    style.setProperty('pointer-events', 'none');
    style.setProperty('background-color', 'none');
    style.setProperty('--radius', '20px')
  }

  /**
   * Aktualisiert die 3D-Position und Skalierung des Startbildschirms im Raum.
   * Dies wird vom RenderingService gesteuert, um Kamerabewegungen zu simulieren.
   */
  public updatePosition() {
    const renderingService = RenderingService.instance();
    const { angle, fov, yOffset, xOffset, rotationZ } = renderingService;

    // Zugriff auf Style-Objekte
    const style = this.containerRef.nativeElement.style;
    const styleCanvas = this.canvasRef.nativeElement.style;
    const topSectionStyle = this.topSectionRef.nativeElement.style;
    const bottomSectionStyle = this.bottomSectionRef.nativeElement.style;
    const screenContainerStyle = this.screenContainerRef.nativeElement.style;
    const homeButtonStyle = this.homeButtonRef.nativeElement.style;
    const cameraStyle = this.startScreenContainerRef.nativeElement.style;

    const startingFov = 60; // Referenz-FOV
    const fovRatio = fov / startingFov; // Skalierungsfaktor

    // Berechnete Dimensionen anwenden
    const newWidth = this.width * fovRatio;
    const newHeight = this.height * fovRatio;
    const width = `${newWidth}px`;
    const height = `${newHeight}px`;

    // Hauptcontainer und Canvas-Größe anpassenU
    style.setProperty('width', width);
    style.setProperty('height', height);
    styleCanvas.setProperty('height', height);
    styleCanvas.setProperty('width', `${this.width * fovRatio}px`);

    // Gehäuse-Elemente skalieren
    const newHeightTopBot = fovRatio * 100;
    bottomSectionStyle.setProperty('height', `${newHeightTopBot}px`);
    topSectionStyle.setProperty('height', `${newHeightTopBot}px`);

    const edgeWidth = fovRatio * 20;
    screenContainerStyle.setProperty('border-right', `${edgeWidth}px solid black`);
    screenContainerStyle.setProperty('border-left', `${edgeWidth}px solid black`);

    // Buttons und Icons skalieren
    const homeButtonSize = fov / (window.innerHeight / 1080 * 60) * 50;
    homeButtonStyle.setProperty('width', `${homeButtonSize}px`);
    homeButtonStyle.setProperty('height', `${homeButtonSize}px`);
    const sizeIcon = fov / (window.innerHeight / 1080 * 60) * 30;
    homeButtonStyle.setProperty('--size-icon', `${sizeIcon}px`);
    const cameraSize = fov / (window.innerHeight / 1080 * 60) * 50;
    cameraStyle.setProperty('height', `${cameraSize}px`);

    // 3D-Positionierung im Raum berechnen
    const gameY = fov * ((Gamefield.fieldsize * 5 + Gamefield.fieldsize / 2) + yOffset / fov) * Math.cos(angle) + rotationZ - this.height / 2 * fovRatio - 20 * fovRatio;
    const x = fov * (Gamefield.fieldsize * 10 + Gamefield.fieldsize / 2) + xOffset - fov * (this.width) / 120;

    style.setProperty('top', `${gameY}px`);
    style.setProperty('left', `${x}px`);
  }
}
