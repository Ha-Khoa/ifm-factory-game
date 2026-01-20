import { Component, OnInit, ElementRef, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { UI_THEME, loadTheme } from '../../services/ui/theme.manager';
import { RenderingService } from '../../services/rendering.service';
import { Gamefield } from '../../models/gamefield/gamefield';
import { GameService } from '../../services/game.service';
import { ApiService } from '../../services/api.service';
import { PlayerInterface } from '../../interfaces/ui/playerInterface';
import { InputService } from '../../services/input.service';
import { Subscription } from 'rxjs';

/**
 * Komponente für den Startbildschirm des Spiels.
 */
@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [],
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.css']
})
export class StartScreenComponent implements OnInit {
  // Referenzen auf HTML-Elemente im Template
  @ViewChild('startScreenCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('startScreenContainer') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('topSection') topSectionRef!: ElementRef<HTMLDivElement>;
  @ViewChild('bottomSection') bottomSectionRef!: ElementRef<HTMLDivElement>;
  @ViewChild('screenContainer') screenContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('phone') phoneRef!: ElementRef<HTMLDivElement>;
  @ViewChild('homeButton') homeButtonRef!: ElementRef<HTMLDivElement>;
  @ViewChild('camera') startScreenContainerRef!: ElementRef<HTMLDivElement>;

  // Events, die an die Elternkomponente gesendet werden
  @Output() startClicked = new EventEmitter<void>();
  @Output() settingsClicked = new EventEmitter<void>();

  // Canvas-Kontext und Button-Dimensionen
  private ctx!: CanvasRenderingContext2D;
  private buttonRect = { x: 0, y: 0, width: 0, height: 0 };
  private playerModeButtonRect = { x: 0, y: 0, width: 0, height: 0 };
  private settingsButtonRect = { x: 0, y: 0, width: 0, height: 0 };
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

  constructor(private gameService: GameService, private apiService: ApiService, private inputService: InputService) { }

  /**
   * Initialisiert die Komponente nach dem Laden.
   */
  ngOnInit(): void {
    loadTheme();
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.setCanvasSize();

    this.backgroundImage = new Image();
    this.backgroundImage.src = "/images/background.png";
    this.backgroundImage.onload = () => {
      this.draw(); // Draw once the image is loaded
    };
    this.backgroundImage.onerror = () => {
      console.error("Failed to load background image.");
      this.draw(); // Still draw, but background might be missing
    };

    this.loadHighScores();
    this.setupInputHandlers();
  }

  ngOnDestroy(): void {
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
    if (now - this.lastInputTime < 200) return; // 200ms debounce
    this.lastInputTime = now;

    switch (action) {
      case 'up':
        this.selectedButtonIndex = (this.selectedButtonIndex - 1 + 3) % 3;
        this.draw();
        break;
      case 'down':
        this.selectedButtonIndex = (this.selectedButtonIndex + 1) % 3;
        this.draw();
        break;
      case 'confirm':
        this.handleSelection();
        break;
    }
  }

  /**
   * Lädt die Highscores vom API-Service, sortiert sie und löst ein Neuzeichnen aus.
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
   * Setzt die Breite und Höhe des Canvas-Elements.
   */
  private setCanvasSize(): void {
    this.canvasRef.nativeElement.width = this.width;
    this.canvasRef.nativeElement.height = this.height;
  }

  /**
   * Zeichnet den gesamten Inhalt des Startbildschirms auf den Canvas.
   */
  private draw(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Hintergrund zeichnen
    if (this.backgroundImage && this.backgroundImage.complete) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    } else {
      this.ctx.fillStyle = UI_THEME.bgColor;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    // Scoreboards zeichnen
    this.drawScoreboards();

    // Titel zeichnen
    this.drawTitle();

    // Buttons zeichnen
    this.drawButtons();
  }

  /**
   * Zeichnet die beiden Highscore-Anzeigetafeln links und rechts.
   */
  private drawScoreboards(): void {
    const scoreboardWidth = 400;
    const padding = 50;

    const leftBoardX = padding;
    const rightBoardX = this.width - scoreboardWidth - padding;
    const boardY = 250; // Y-Position, um unter dem Titel zu beginnen

    this.ctx.fillStyle = UI_THEME.textColor;

    this.drawSingleScoreboard('1 Player High Scores', this.onePlayerHighScores, leftBoardX, boardY, scoreboardWidth);
    this.drawSingleScoreboard('2 Player High Scores', this.twoPlayerHighScores, rightBoardX, boardY, scoreboardWidth);
  }

  /**
   * Zeichnet eine einzelne Anzeigetafel mit Titel und einer Liste von Spielständen.
   * @param title Der Titel der Anzeigetafel.
   * @param highScores Die Liste der Highscores, die angezeigt werden sollen.
   * @param x Die X-Koordinate der linken oberen Ecke.
   * @param y Die Y-Koordinate der linken oberen Ecke.
   * @param width Die Breite der Anzeigetafel.
   */
  private drawSingleScoreboard(title: string, highScores: PlayerInterface[], x: number, y: number, width: number): void {
    if (highScores.length === 0) return;

    const lineHeight = 40;
    const titleY = y;
    const listY = y + lineHeight + 10;
    const padding = 10;
    const originalTextAlign = this.ctx.textAlign;

    // Titel zeichnen
    this.ctx.font = `bold 36px ${UI_THEME.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, x + width / 2, titleY);

    // Schriftart für die Liste zurücksetzen
    this.ctx.font = `30px ${UI_THEME.fontFamily}`;

    // Spielstände zeichnen
    highScores.forEach((player, index) => {
      const scoreY = listY + index * lineHeight;
      const rankText = `${index + 1}.`;
      const nameText = player.name;
      const scoreText = player.score.toLocaleString(); // Punktzahl mit Tausendertrennzeichen

      // Rang zeichnen (linksbündig)
      this.ctx.textAlign = 'left';
      this.ctx.fillText(rankText, x, scoreY);

      // Name zeichnen (zentriert)
      this.ctx.textAlign = 'center';
      this.ctx.fillText(nameText, x + width / 2, scoreY);

      // Punktzahl zeichnen (rechtsbündig)
      this.ctx.textAlign = 'right';
      this.ctx.fillText(scoreText, x + width - padding, scoreY);
    });

    // Textausrichtung für andere Zeichenfunktionen zurücksetzen
    this.ctx.textAlign = originalTextAlign;
  }

  /**
   * Zeichnet den Spieltitel.
   */
  private drawTitle(): void {
    const title = 'IFM GAME';
    this.ctx.fillStyle = UI_THEME.textColor;
    this.ctx.font = `80px ${UI_THEME.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(title, this.ctx.canvas.width / 2, this.ctx.canvas.height / 3);
  }

  /**
   * Berechnet die Positionen und zeichnet alle Buttons.
   */
  private drawButtons(): void {
    const buttonWidth = 300;
    const buttonHeight = 80;
    const buttonGap = 20;
    const buttonX = this.ctx.canvas.width / 2 - buttonWidth / 2;

    const totalHeight = (buttonHeight * 3) + (buttonGap * 2); // 3 Buttons, 2 Lücken
    const startY = (this.ctx.canvas.height - totalHeight) / 2 + 100;

    // Button-Rechtecke definieren
    this.buttonRect = { x: buttonX, y: startY, width: buttonWidth, height: buttonHeight };
    this.playerModeButtonRect = { x: buttonX, y: startY + buttonHeight + buttonGap, width: buttonWidth, height: buttonHeight };
    this.settingsButtonRect = { x: buttonX, y: startY + (buttonHeight + buttonGap) * 2, width: buttonWidth, height: buttonHeight };

    // Buttons zeichnen
    this.drawButton('START', this.buttonRect, this.selectedButtonIndex === 0);
    const playerModeText = this.gameService.twoPlayerMode ? '2 Players' : '1 Player';
    this.drawButton(playerModeText, this.playerModeButtonRect, this.selectedButtonIndex === 1);
    this.drawButton('SETTINGS', this.settingsButtonRect, this.selectedButtonIndex === 2);
  }

  /**
   * Hilfsfunktion zum Zeichnen eines einzelnen Buttons.
   * @param text Der Text auf dem Button.
   * @param rect Die Position und Größe des Buttons.
   * @param isSelected Gibt an, ob der Button aktuell ausgewählt ist.
   */
  private drawButton(text: string, rect: { x: number, y: number, width: number, height: number }, isSelected: boolean): void {
    // Hintergrund des Buttons
    this.ctx.fillStyle = isSelected ? UI_THEME.highlightColor : UI_THEME.primary;
    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    // Rand für ausgewählten Button
    if (isSelected) {
      this.ctx.strokeStyle = UI_THEME.textColor;
      this.ctx.lineWidth = 5;
      this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }

    // Text des Buttons
    this.ctx.fillStyle = UI_THEME.textColor;
    this.ctx.font = `40px ${UI_THEME.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, rect.x + rect.width / 2, rect.y + rect.height / 2);
  }

  /**
   * Passt die Canvas-Größe bei Fenstergrößenänderung an und zeichnet neu.
   */
  @HostListener('window:resize')
  onResize(): void {
    this.setCanvasSize();
    this.draw();
  }

  /**
   * Hilfsfunktion zur Überprüfung, ob ein Punkt innerhalb eines Rechtecks liegt.
   * @param x X-Koordinate des Punktes.
   * @param y Y-Koordinate des Punktes.
   * @param rect Das Rechteck zum Überprüfen.
   * @returns `true`, wenn der Punkt im Rechteck ist, sonst `false`.
   */
  private isPointInRect(x: number, y: number, rect: { x: number, y: number, width: number, height: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }

  /**
   * Verarbeitet Klick-Events auf dem Canvas.
   * @param event Das Maus-Event.
   */
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.isHidden) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    // Skaliert die Klick-Koordinaten auf die tatsächliche Canvas-Größe
    const scaleX = this.canvasRef.nativeElement.width / rect.width;
    const scaleY = this.canvasRef.nativeElement.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (this.isPointInRect(x, y, this.buttonRect)) {
      this.handleSelection(0);
    } else if (this.isPointInRect(x, y, this.playerModeButtonRect)) {
      this.handleSelection(1);
    } else if (this.isPointInRect(x, y, this.settingsButtonRect)) {
      this.handleSelection(2);
    }
  }

  /**
   * Führt die Aktion für den aktuell ausgewählten Button aus.
   */
  private handleSelection(index?: number): void {
    const selection = index ?? this.selectedButtonIndex;
    switch (selection) {
      case 0: // START
        this.startClicked.emit();
        break;
      case 1: // Spielermodus
        this.gameService.twoPlayerMode = !this.gameService.twoPlayerMode;
        this.draw();
        break;
      case 2: // EINSTELLUNGEN
        this.settingsClicked.emit();
        break;
    }
  }

  /**
   * Startet die "Zoom-Out"-Animation, um den Startbildschirm auszublenden.
   * Passt die CSS-Eigenschaften an, um eine Vollbildansicht zu simulieren.
   */
  public zoomOut() {
    this.isHidden = true;
    this.inputSubscriptions.forEach(sub => sub.unsubscribe());
    const style = this.containerRef.nativeElement.style;

    // Position auf Vollbild setzen
    style.setProperty('top', '0px');
    style.setProperty('left', '0px');
    style.setProperty('width', window.innerWidth + 'px');
    style.setProperty('height', window.innerHeight + 'px');
    style.setProperty('pointer-events', 'none');
    style.setProperty('background-color', 'none');
    style.setProperty('--radius', '20px')
  }

  /**
   * Aktualisiert die Position und Größe des Startbildschirm-Containers
   * während der Kamerafahrt (Zoom und Schwenk).
   * Dies erzeugt den Effekt, dass der Bildschirm ein Objekt in der 3D-Welt ist.
   */
  public updatePosition() {
    const renderingService = RenderingService.instance();
    const { angle, fov, yOffset, xOffset, rotationZ } = renderingService;

    // Nötige Style-Objekte abrufen
    const style = this.containerRef.nativeElement.style;
    const styleCanvas = this.canvasRef.nativeElement.style;
    const topSectionStyle = this.topSectionRef.nativeElement.style;
    const bottomSectionStyle = this.bottomSectionRef.nativeElement.style;
    const screenContainerStyle = this.screenContainerRef.nativeElement.style;
    const phoneStyle = this.phoneRef.nativeElement.style;
    const homeButtonStyle = this.homeButtonRef.nativeElement.style;
    const cameraStyle = this.startScreenContainerRef.nativeElement.style;

    const startingFov = 60; // Basis-FOV für Berechnungen
    const fovRatio = fov / startingFov; // Skalierungsfaktor basierend auf dem FOV
    // Neue Dimensionen basierend auf dem Zoom berechnen
    const newWidth = this.width * fovRatio;
    const newHeight = this.height * fovRatio;
    const width = `${newWidth}px`;
    const height = `${newHeight}px`;

    // Hauptcontainer und Canvas-Größe anpassenU
    style.setProperty('width', width);
    style.setProperty('height', height);
    styleCanvas.setProperty('height', height);
    styleCanvas.setProperty('width', `${this.width * fovRatio}px`);

    // Dekorative Elemente des "Handy"-Looks skalieren
    const newHeightTopBot = fovRatio * 100;
    bottomSectionStyle.setProperty('height', `${newHeightTopBot}px`);
    topSectionStyle.setProperty('height', `${newHeightTopBot}px`);

    const edgeWidth = fovRatio * 20;
    screenContainerStyle.setProperty('border-right', `${edgeWidth}px solid black`);
    screenContainerStyle.setProperty('border-left', `${edgeWidth}px solid black`);

    // Skalierung und Positionierung der Handy-Seitentasten-Imitationen
    // const phoneBeforeY = fovRatio * 50;
    // const phoneAfterY = fovRatio * 120;
    // const phoneBeforeSize = fovRatio * 30;
    // const phoneAfterSize = fovRatio * 50;
    // const widthPhone = fovRatio * 3;
    // phoneStyle.setProperty('--width', `${widthPhone}px`);
    // phoneStyle.setProperty('--before-height', `${phoneBeforeSize}px`);
    // phoneStyle.setProperty('--after-height', `${phoneAfterSize}px`);
    // phoneStyle.setProperty('--before-top', `${phoneBeforeY}px`);
    // phoneStyle.setProperty('--after-top', `${phoneAfterY}px`);

    // Home-Button und Kamera-Icon skalieren
    const homeButtonSize = fov / (window.innerHeight / 1080 * 60) * 50;
    homeButtonStyle.setProperty('width', `${homeButtonSize}px`);
    homeButtonStyle.setProperty('height', `${homeButtonSize}px`);
    const sizeIcon = fov / (window.innerHeight / 1080 * 60) * 30;
    homeButtonStyle.setProperty('--size-icon', `${sizeIcon}px`);
    const cameraSize = fov / (window.innerHeight / 1080 * 60) * 50;
    cameraStyle.setProperty('height', `${cameraSize}px`);

    // Dynamische Position des gesamten Containers in der 3D-Welt berechnen
    const gameY = fov * ((Gamefield.fieldsize * 5 + Gamefield.fieldsize / 2) + yOffset / fov) * Math.cos(angle) + rotationZ - this.height / 2 * fovRatio - 20 * fovRatio;
    const x = fov * (Gamefield.fieldsize * 10 + Gamefield.fieldsize / 2) + xOffset - fov * (this.width) / 120;

    style.setProperty('top', `${gameY}px`);
    style.setProperty('left', `${x}px`);
  }
}
