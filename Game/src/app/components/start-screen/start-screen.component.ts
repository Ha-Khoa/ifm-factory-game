import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { UI_THEME, loadTheme } from '../../services/ui/theme.manager';
import { RenderingService } from '../../services/rendering.service';
import { Gamefield } from '../../models/gamefield/gamefield';
import { GameService } from '../../services/game.service';
import { ApiService } from '../../services/api.service';
import { PlayerInterface } from '../../interfaces/ui/playerInterface';

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
export class StartScreenComponent implements OnInit, OnDestroy {
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

  // --- Interne Zustandsvariablen ---
  private ctx!: CanvasRenderingContext2D;
  private buttonRect = { x: 0, y: 0, width: 0, height: 0 };
  private playerModeButtonRect = { x: 0, y: 0, width: 0, height: 0 };
  private settingsButtonRect = { x: 0, y: 0, width: 0, height: 0 };
  private tutorialButtonRect = { x: 0, y: 0, width: 0, height: 0 };
  private highScores: PlayerInterface[] = [];
  private backgroundVideo!: HTMLVideoElement;
  private selectedButtonIndex = 0;
  public isHidden = false;
  
  // ID für den Animations-Loop (wichtig zum Beenden)
  private animationFrameId: number | null = null;

  // Canvas-Dimensionen (feste Referenzgröße)
  private height: number = 1080;
  private width: number = this.height * window.innerWidth / window.innerHeight;

  constructor(private gameService: GameService, private apiService: ApiService) { }

  /**
   * Initialisierung der Komponente.
   * Lädt das Theme, richtet Canvas und Video ein und startet den Render-Loop.
   */
  ngOnInit(): void {
    loadTheme();
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.setCanvasSize();

    // Hintergrundvideo initialisieren
    this.backgroundVideo = document.createElement('video');
    this.backgroundVideo.src = "/images/background.mp4"; 
    this.backgroundVideo.loop = true;
    this.backgroundVideo.muted = true; // Notwendig für Autoplay ohne Benutzerinteraktion
    this.backgroundVideo.play();

    this.loadHighScores();
    this.animate(); 
  }

  /**
   * Aufräumen beim Zerstören der Komponente.
   * Stoppt den Animations-Loop, um Speicherlecks zu verhindern.
   */
  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Lädt die Highscores über den API-Service.
   * Sortiert die Liste absteigend und begrenzt sie auf die Top 10.
   */
  private loadHighScores(): void {
    this.apiService.getPlayers().subscribe(players => {
      this.highScores = players
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
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
    if (this.isHidden) return;
    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Zeichnet einen einzelnen Frame des Startbildschirms.
   * Beinhaltet Hintergrund, Grid, Scoreboards, Titel und Buttons.
   */
  private draw(): void {
    const time = Date.now();
    // Berechnet einen Puls-Wert zwischen 0 und 1 basierend auf der Zeit
    const pulse = (Math.sin(time / 200) + 1) / 2;

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Video-Hintergrund zeichnen, falls bereit
    if (this.backgroundVideo.readyState >= 2) { 
      this.ctx.drawImage(this.backgroundVideo, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    } else {
      // Fallback-Hintergrundfarbe
      this.ctx.fillStyle = "#050505";
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    // Halbtransparentes Overlay zum Abdunkeln des Hintergrunds
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.drawRetroGrid(time);
    this.drawScoreboards();
    this.drawTitle(time);
    this.drawButtons(pulse);
  }

  /**
   * Zeichnet ein animiertes Retro-Gitter (Synthwave-Stil).
   */
  private drawRetroGrid(time: number): void {
    this.ctx.strokeStyle = "rgba(0, 255, 255, 0.15)";
    this.ctx.lineWidth = 2;
    // Animations-Offset für den Bewegungseffekt
    const offset = (time / 40) % 60;
    
    // Horizontale Linien zeichnen
    for(let y = 0; y < this.height; y += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + offset);
      this.ctx.lineTo(this.width, y + offset);
      this.ctx.stroke();
    }
  }

  /**
   * Koordiniert das Zeichnen der beiden Highscore-Tafeln.
   */
  private drawScoreboards(): void {
    if (this.highScores.length === 0) return;
    const scoreboardWidth = 400;
    const padding = 50;
    const leftBoardX = padding;
    const rightBoardX = this.width - scoreboardWidth - padding;
    const boardY = 280;

    // Neon-Effekt Einstellungen
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "#0ff";
    this.ctx.fillStyle = "#0ff";

    this.drawSingleScoreboard('1P HIGH SCORE', leftBoardX, boardY, scoreboardWidth);
    this.drawSingleScoreboard('2P HIGH SCORE', rightBoardX, boardY, scoreboardWidth);
    
    // Schatten zurücksetzen
    this.ctx.shadowBlur = 0;
  }

  /**
   * Zeichnet eine einzelne Highscore-Tafel an der angegebenen Position.
   */
  private drawSingleScoreboard(title: string, x: number, y: number, width: number): void {
    const lineHeight = 40;
    const listY = y + lineHeight + 15;
    const padding = 10;
    const originalTextAlign = this.ctx.textAlign;

    // Titel der Tafel
    this.ctx.font = `bold 32px "Courier New", monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, x + width / 2, y);

    // Listeneinträge
    this.ctx.font = `28px "Courier New", monospace`;
    this.ctx.fillStyle = "#eee";

    this.highScores.forEach((player, index) => {
      const scoreY = listY + index * lineHeight;
      // Goldene Farbe für den ersten Platz
      if(index === 0) this.ctx.fillStyle = "#FFFF00"; 
      else this.ctx.fillStyle = "#fff";

      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${index + 1}.`, x, scoreY);
      this.ctx.textAlign = 'center';
      this.ctx.fillText(player.name, x + width / 2, scoreY);
      this.ctx.textAlign = 'right';
      this.ctx.fillText(player.score.toLocaleString(), x + width - padding, scoreY);
    });
    this.ctx.textAlign = originalTextAlign;
  }

  /**
   * Zeichnet den Spieltitel mit Farbwechsel-Effekt.
   */
  private drawTitle(time: number): void {
    const title = 'IFM ARCADE';
    const hue = (time / 20) % 360;
    this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    this.ctx.shadowBlur = 30;

    this.ctx.font = `italic 900 100px "Courier New", monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Leichter Zoom-Effekt im Takt
    const scale = 1 + Math.sin(time / 200) * 0.05;
    this.ctx.save();
    this.ctx.translate(this.ctx.canvas.width / 2, this.ctx.canvas.height / 4);
    this.ctx.scale(scale, scale);
    this.ctx.fillText(title, 0, 0);
    this.ctx.restore();
    
    this.ctx.shadowBlur = 0;
  }

  /**
   * Zeichnet das Hauptmenü (Start, Modus, Einstellungen, tutorial).
   */
  private drawButtons(pulse: number): void {
    const buttonWidth = 350;
    const buttonHeight = 70;
    const buttonGap = 20; 
    const buttonX = this.ctx.canvas.width / 2 - buttonWidth / 2;

    const totalHeight = (buttonHeight * 4) + (buttonGap * 3);
    const startY = (this.ctx.canvas.height - totalHeight) / 2 + 150; 


    this.buttonRect = { x: buttonX, y: startY, width: buttonWidth, height: buttonHeight };
    this.playerModeButtonRect = { x: buttonX, y: startY + buttonHeight + buttonGap, width: buttonWidth, height: buttonHeight };

    this.tutorialButtonRect = { x: buttonX, y: startY + (buttonHeight + buttonGap) * 2, width: buttonWidth, height: buttonHeight };

    this.settingsButtonRect = { x: buttonX, y: startY + (buttonHeight + buttonGap) * 3, width: buttonWidth, height: buttonHeight };


    this.drawArcadeButton('START', this.buttonRect, this.selectedButtonIndex === 0);
    const playerModeText = this.gameService.twoPlayerMode ? '2 PLAYERS' : '1 PLAYER';
    this.drawArcadeButton(playerModeText, this.playerModeButtonRect, this.selectedButtonIndex === 1);
    this.drawArcadeButton('TUTORIAL', this.tutorialButtonRect, this.selectedButtonIndex === 2);
    this.drawArcadeButton('SETTINGS', this.settingsButtonRect, this.selectedButtonIndex === 3);
}

  /**
   * Hilfsfunktion zum Zeichnen eines einzelnen Menü-Buttons im Arcade-Stil.
   */
  private drawArcadeButton(text: string, rect: { x: number, y: number, width: number, height: number }, isSelected: boolean): void {
    const scale = isSelected ? 1.1 : 1.0;
    const w = rect.width * scale;
    const h = rect.height * scale;
    const x = rect.x - (w - rect.width) / 2;
    const y = rect.y - (h - rect.height) / 2;

    this.ctx.fillStyle = isSelected ? "rgba(255, 0, 255, 0.2)" : "rgba(0, 0, 0, 0.8)";
    this.ctx.strokeStyle = isSelected ? "#ff00de" : "#555";
    this.ctx.lineWidth = 4;
    
    // Leuchteffekt bei Auswahl
    if (isSelected) {
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "#ff00de";
    } else {
      this.ctx.shadowBlur = 0;
    }

    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeRect(x, y, w, h);

    this.ctx.fillStyle = isSelected ? "#fff" : "#aaa";
    this.ctx.font = `bold 35px "Courier New", monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Schnelles Blinken des Textes bei Auswahl
    if (isSelected && Math.floor(Date.now() / 100) % 2 === 0) {
      this.ctx.fillStyle = "#ff00de";
    }
    
    this.ctx.fillText(text, x + w / 2, y + h / 2);
    this.ctx.shadowBlur = 0;
  }

  /**
   * Passt die Canvas-Größe bei Fensteränderungen an.
   */
  @HostListener('window:resize')
  onResize(): void {
    this.setCanvasSize();
  }

  /**
   * Prüft, ob ein Punkt (Mausklick) innerhalb eines Rechtecks liegt.
   */
  private isPointInRect(x: number, y: number, rect: { x: number, y: number, width: number, height: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
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

    if (this.isPointInRect(x, y, this.buttonRect)) {
      this.startClicked.emit();
    } else if (this.isPointInRect(x, y, this.playerModeButtonRect)) {
      this.gameService.twoPlayerMode = !this.gameService.twoPlayerMode;
    } else if (this.isPointInRect(x, y, this.settingsButtonRect)) {
      this.settingsClicked.emit();
    } else if (this.isPointInRect(x, y, this.tutorialButtonRect)) {
      this.tutorialClicked.emit();
    }
    
  }

  /**
   * Tastatursteuerung für die Menü-Navigation (Pfeiltasten/WASD + Enter/E).
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isHidden) return;
    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        // Modulo 4 für 4 Buttons
        this.selectedButtonIndex = (this.selectedButtonIndex - 1 + 4) % 4;
        break;
      case 's':
      case 'arrowdown':
        this.selectedButtonIndex = (this.selectedButtonIndex + 1) % 4;
        break;
      case 'e':
      case 'enter':
        this.handleSelection();
        break;
  }
}

  /**
   * Führt die Aktion des aktuell ausgewählten Buttons aus.
   */
  private handleSelection(): void {
    switch (this.selectedButtonIndex) {
      case 0: this.startClicked.emit(); break;
      case 1: this.gameService.twoPlayerMode = !this.gameService.twoPlayerMode; break;
      case 2: this.tutorialClicked.emit(); break; // Neuer Case
      case 3: this.settingsClicked.emit(); break;
    }
  }

  /**
   * Startet die Zoom-Out Animation beim Spielstart.
   * Schaltet die Komponente in den Vollbildmodus und deaktiviert Interaktionen.
   */
  public zoomOut() {
    this.isHidden = true;
    if(this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

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