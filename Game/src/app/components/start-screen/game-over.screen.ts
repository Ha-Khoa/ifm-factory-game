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
   */
  public render(): void {
    const score = this.playerService.getScore();
    const earnedMoney = this.playerService.getMoney();
    const playerName = this.playerService.player?.name ?? 'Player';

    // Update animation progress
    const elapsed = Date.now() - this.startTime;
    this.animationProgress = Math.min(elapsed / this.animationDuration, 1);

    // Bildschirm löschen
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Hintergrund zeichnen
    this.drawBackground();

    // Dunkellay mit Animation
    this.drawDarkOverlay();

    // GameOver Container mit Animationen
    this.drawGameOverContainer(score, earnedMoney, playerName);

    // Decorative Elemente
    this.drawDecorations();
  }

  /**
   * Zeichnet den Hintergrund oder eine Standardfarbe
   */
  private drawBackground(): void {
    if (this.backgroundImage && this.backgroundImage.complete) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvasWidth, this.canvasHeight);
    } else {
      // Gradient Hintergrund als Fallback
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
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
  private drawGameOverContainer(score: number, earnedMoney: number, playerName: string): void {
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
    const time = Date.now();
    const pulse = Math.sin(time / 400) * 0.5 + 0.5; // Creates a value between 0 and 1
    const glowBlur = 15 + pulse * 15; // Pulsates between 15 and 30
    const glowAlpha = 0.7 + pulse * 0.3; // Pulsates between 0.7 and 1.0
    this.ctx.shadowColor = `rgba(255, 102, 0, ${glowAlpha})`;
    this.ctx.shadowBlur = glowBlur;

    // Draw container background
    this.ctx.fillStyle = 'rgba(10, 20, 40, 0.85)';
    this.ctx.fillRect(containerX, containerY, containerWidth, containerHeight);

    // Draw container border
    this.ctx.strokeStyle = '#FF6600'; // ifm Orange
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(containerX, containerY, containerWidth, containerHeight);

    // Glow-Effekt
    this.ctx.shadowColor = '#00d4ff';
    this.ctx.shadowBlur = 20;
    this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(containerX - 5, containerY - 5, containerWidth + 10, containerHeight + 10);
    this.ctx.shadowBlur = 0;


    // Texte zeichnen (innerhalb save/restore damit sie mit Container animieren)
    this.drawGameOverText(containerX, containerY, containerWidth, containerHeight, score, earnedMoney, playerName);

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
    playerName: string
  ): void {
    const centerX = x + width / 2;
    let currentY = y + 120;

    // Helper to calculate staggered alpha
    const getStaggeredAlpha = (delay: number) => Math.max(0, Math.min(1, (this.animationProgress - delay) / (1 - delay)));

    // --- GAME OVER Title ---
    this.ctx.save();
    this.ctx.globalAlpha = getStaggeredAlpha(0.2);
    this.ctx.font = `bold 80px ${UI_THEME.fontFamily}, sans-serif`;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowColor = '#FF6600';
    this.ctx.shadowBlur = 15;
    this.ctx.fillText('TIME IS UP!', centerX, currentY);
    this.ctx.restore();
    currentY += 120;

    // --- Final Score ---
    this.ctx.save();
    this.ctx.globalAlpha = getStaggeredAlpha(0.4);
    this.ctx.font = `40px ${UI_THEME.fontFamily}, sans-serif`;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Final Score', centerX, currentY);
    currentY += 55;

    this.ctx.font = `bold 60px ${UI_THEME.fontFamily}, sans-serif`;
    this.ctx.fillStyle = '#FFC107'; // A bright gold color
    this.ctx.fillText(score.toLocaleString(), centerX, currentY);
    this.ctx.restore();
    currentY += 100;

    // Spieler Name
    this.ctx.font = `30px ${UI_THEME.fontFamily}`;
    this.ctx.fillStyle = '#00d4ff';
    this.ctx.fillText(`${playerName}`, centerX, currentY);
    currentY += 60;

    // Separator Line
    this.ctx.strokeStyle = '#00d4ff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 50, currentY);
    this.ctx.lineTo(x + width - 50, currentY);
    this.ctx.stroke();
    currentY += 40;

    // Score Label und Wert
    this.ctx.font = `24px ${UI_THEME.fontFamily}`;
    this.ctx.fillStyle = '#a0aec0';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Final Score:', x + 80, currentY);

    this.ctx.font = `bold 32px ${UI_THEME.fontFamily}`;
    this.ctx.fillStyle = '#ffd700';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(score.toLocaleString(), x + width - 80, currentY);
    currentY += 60;

    // Earned Money Label und Wert
    this.ctx.font = `24px ${UI_THEME.fontFamily}`;
    this.ctx.fillStyle = '#a0aec0';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Earned Money:', x + 80, currentY);

    this.ctx.font = `bold 32px ${UI_THEME.fontFamily}`;
    this.ctx.fillStyle = '#4ade80';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`$${earnedMoney.toLocaleString()}`, x + width - 80, currentY);
    currentY += 80;

    // Continue-Hinweis
    this.ctx.font = `18px ${UI_THEME.fontFamily}`;
    this.ctx.fillStyle = '#888888';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Drücke F5 zum restarten', centerX, y + height - 30);
  }

  /**
   * Zeichnet dekorative Elemente wie Ecken und Effekte
   */
  private drawDecorations(): void {
    const containerWidth = 800;
    const containerHeight = 600;
    const containerX = (this.canvasWidth - containerWidth) / 2;
    const containerY = (this.canvasHeight - containerHeight) / 2;
    const cornerSize = 20;
    const opacity = this.animationProgress;

    this.ctx.globalAlpha = opacity;

    // Eckenverzierungen
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 3;

    // Top-Left corner
    this.ctx.beginPath();
    this.ctx.moveTo(containerX, containerY + cornerSize);
    this.ctx.lineTo(containerX, containerY);
    this.ctx.lineTo(containerX + cornerSize, containerY);
    this.ctx.stroke();

    // Top-Right corner
    this.ctx.beginPath();
    this.ctx.moveTo(containerX + containerWidth - cornerSize, containerY);
    this.ctx.lineTo(containerX + containerWidth, containerY);
    this.ctx.lineTo(containerX + containerWidth, containerY + cornerSize);
    this.ctx.stroke();

    // Bottom-Left corner
    this.ctx.beginPath();
    this.ctx.moveTo(containerX, containerY + containerHeight - cornerSize);
    this.ctx.lineTo(containerX, containerY + containerHeight);
    this.ctx.lineTo(containerX + cornerSize, containerY + containerHeight);
    this.ctx.stroke();

    // Bottom-Right corner
    this.ctx.beginPath();
    this.ctx.moveTo(containerX + containerWidth - cornerSize, containerY + containerHeight);
    this.ctx.lineTo(containerX + containerWidth, containerY + containerHeight);
    this.ctx.lineTo(containerX + containerWidth, containerY + containerHeight - cornerSize);
    this.ctx.stroke();

    this.ctx.globalAlpha = 1;
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
