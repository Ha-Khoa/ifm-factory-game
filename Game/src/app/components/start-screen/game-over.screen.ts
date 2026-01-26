import { UI_THEME } from '../../services/ui/theme.manager';
import { PlayerService } from '../../services/player.service';

export class GameOverScreen {
  private backgroundImage: HTMLImageElement | null = null;
  private animationProgress: number = 0; // 0 to 1
  private startTime: number = 0;
  private animationDuration: number = 1000; // 1 second animation

  constructor(
    private ctx: CanvasRenderingContext2D,
    private canvasWidth: number,
    private canvasHeight: number,
    private playerService: PlayerService,
  ) {
    this.startTime = Date.now();
  }

  /**
   * Setzt ein Hintergrundbild für den GameOver-Bildschirm
   * @param imagePath Pfad zum Hintergrundbild
   */
  public setBackgroundImage(imagePath: string): void {
    this.backgroundImage = new Image();
    this.backgroundImage.src = imagePath;
    this.backgroundImage.onload = () => {
      // Bild erfolgreich geladen
    };
    this.backgroundImage.onerror = () => {
      console.warn(`Failed to load background image: ${imagePath}`);
      this.backgroundImage = null;
    };
  }

  /**
   * Rendert den GameOver-Bildschirm mit animiertem Fade-In
   * @param yOffset Verschiebung auf der Y-Achse (für Slide-Animation)
   * @param clearScreen Ob der Screen vorher geleert werden soll
   */
  public render(yOffset: number = 0, clearScreen: boolean = true): void {
    const score = this.playerService.getScore();
    const earnedMoney = this.playerService.getMoney();
    const playerName = this.playerService.player?.name ?? 'Player';
    const currentTime = Date.now();
    const elapsed = currentTime - this.startTime;

    // Update animation progress
    this.animationProgress = Math.min(elapsed / this.animationDuration, 1);

    // Bildschirm löschen
    if (clearScreen) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    this.ctx.save();
    this.ctx.translate(0, yOffset);

    // Hintergrund zeichnen (angepasst an Start Screen Design)
    this.drawBackground(currentTime);

    // Dunkellay mit Animation
    this.drawDarkOverlay();

    // GameOver Container mit Animationen
    this.drawGameOverContainer(score, earnedMoney, playerName, currentTime);

    this.ctx.restore();
  }

  /**
   * Zeichnet den Hintergrund oder eine Standardfarbe + Retro Grid
   */
  private drawBackground(time: number): void {
    if (this.backgroundImage && this.backgroundImage.complete) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvasWidth, this.canvasHeight);
    } else {
      // Dunkler Hintergrund als Fallback (wie im Start Screen Video-Fallback)
      this.ctx.fillStyle = '#050505';
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    // Retro Grid Overlay (vom Start Screen übernommen)
    this.drawRetroGrid(time);
  }

  /**
   * Zeichnet ein animiertes Retro-Gitter (Synthwave-Stil)
   */
  private drawRetroGrid(time: number): void {
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(255, 102, 0, 0.2)"; // IFM Orange schwach
    this.ctx.lineWidth = 2;
    const offset = (time / 40) % 60;

    for(let y = 0; y < this.canvasHeight; y += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + offset);
      this.ctx.lineTo(this.canvasWidth, y + offset);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  /**
   * Zeichnet ein dunkles Overlay mit Animation
   */
  private drawDarkOverlay(): void {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * this.animationProgress})`;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  /**
   * Zeichnet den GameOver-Container mit Informationen
   */
  private drawGameOverContainer(score: number, earnedMoney: number, playerName: string, time: number): void {
    const containerWidth = 800;
    const containerHeight = 600;
    const containerX = (this.canvasWidth - containerWidth) / 2;
    const containerY = (this.canvasHeight - containerHeight) / 2;

    // Scale Animation (popup effect)
    const scale = 0.8 + this.animationProgress * 0.2;
    const alpha = this.animationProgress;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-this.canvasWidth / 2, -this.canvasHeight / 2);

    // --- Pulsing Glow Effect ---
    const pulse = Math.sin(time / 400) * 0.5 + 0.5;
    const glowBlur = 20 + pulse * 10;
    
    // IFM Orange (Primary/Secondary from Theme)
    const orangeColor = "rgba(255, 102, 0, 1)";
    const orangeDim = "rgba(255, 102, 0, 0.3)";

    this.ctx.shadowColor = orangeColor;
    this.ctx.shadowBlur = glowBlur;

    // Draw container background (Darker opacity for contrast)
    this.ctx.fillStyle = 'rgba(10, 15, 20, 0.9)';
    this.ctx.fillRect(containerX, containerY, containerWidth, containerHeight);

    // Draw container border (Thicker retro style)
    this.ctx.strokeStyle = orangeColor;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(containerX, containerY, containerWidth, containerHeight);

    // Inner Border Decoration
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = orangeDim;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(containerX + 15, containerY + 15, containerWidth - 30, containerHeight - 30);


    // Texte zeichnen
    this.drawGameOverText(containerX, containerY, containerWidth, containerHeight, score, earnedMoney, playerName, time);

    this.ctx.restore();
  }

  /**
   * Zeichnet die Texte für Score und verdientes Geld
   */
  private drawGameOverText(
    x: number,
    y: number,
    width: number,
    height: number,
    score: number,
    earnedMoney: number,
    playerName: string,
    time: number
  ): void {
    const centerX = x + width / 2;
    let currentY = y + 120;
    const font = '"Courier New", monospace';

    // --- GAME OVER / TIME IS UP Title ---
    this.ctx.save();
    this.ctx.font = `italic 900 80px ${font}`;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowColor = '#FF6600';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText('TIME IS UP!', centerX, currentY);
    this.ctx.restore();
    
    currentY += 100;

    // --- Player Name ---
    this.ctx.font = `bold 36px ${font}`;
    this.ctx.fillStyle = '#FF6600'; // IFM Orange
    this.ctx.textAlign = 'center';
    this.ctx.fillText(playerName.toUpperCase(), centerX, currentY);
    currentY += 80;

    // --- Score ---
    this.ctx.font = `28px ${font}`;
    this.ctx.fillStyle = '#aaa';
    this.ctx.fillText('FINAL SCORE', centerX, currentY);
    currentY += 50;

    this.ctx.font = `bold 60px ${font}`;
    this.ctx.fillStyle = '#FFFF00'; // Yellow highlight (Arcade style)
    this.ctx.shadowColor = '#FFFF00';
    this.ctx.shadowBlur = 10;
    this.ctx.fillText(score.toLocaleString(), centerX, currentY);
    this.ctx.shadowBlur = 0;
    currentY += 80;

    // --- Money ---
    this.ctx.font = `28px ${font}`;
    this.ctx.fillStyle = '#aaa';
    this.ctx.fillText('EARNED MONEY', centerX, currentY);
    currentY += 50;

    this.ctx.font = `bold 50px ${font}`;
    this.ctx.fillStyle = '#4ade80'; // Green
    this.ctx.fillText(`$${earnedMoney.toLocaleString()}`, centerX, currentY);
    currentY += 70;

    // Continue-Hinweis
    if (Math.floor(time / 500) % 2 === 0) {
        this.ctx.fillStyle = '#FFFFFF';
    } else {
        this.ctx.fillStyle = '#888888';
    }
    this.ctx.font = `20px ${font}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PRESS ENTER TO RESTART', centerX, y + height - 30);
  }

  /**
   * Setzt die Animation zurück, um sie erneut zu spielen
   */
  public resetAnimation(): void {
    this.startTime = Date.now();
    this.animationProgress = 0;
  }

  /**
   * Gibt an, ob die Animation abgeschlossen ist
   */
  public isAnimationComplete(): boolean {
    return this.animationProgress >= 1;
  }
}