import { UI_THEME } from '../../services/ui/theme.manager';

export class PauseScreen {
  private resumeButtonRect = { x: 0, y: 0, width: 0, height: 0 };
  private endGameButtonRect = { x: 0, y: 0, width: 0, height: 0 };
  private animationProgress: number = 0; // 0 to 1
  private startTime: number = 0;
  private animationDuration: number = 300; // 0.3 second animation
  private backgroundImage: HTMLImageElement | null = null;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private canvasWidth: number,
    private canvasHeight: number,
  ) {
  }

  public setBackgroundImage(imagePath: string): void {
    this.backgroundImage = new Image();
    this.backgroundImage.src = imagePath;
  }

  public render(selectedButtonIndex: number = 0): void {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight); // Clear the canvas at the beginning of each frame

    const currentTime = Date.now();
    const elapsed = currentTime - this.startTime;
    this.animationProgress = Math.min(elapsed / this.animationDuration, 1);

    this.drawBackground(currentTime);
    this.drawOverlay();
    this.drawPauseContainer(selectedButtonIndex);
  }

  private drawBackground(time: number): void {
    if (this.backgroundImage && this.backgroundImage.complete) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvasWidth, this.canvasHeight);
    } else {
      this.ctx.fillStyle = '#050505';
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    this.drawRetroGrid(time);
  }

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

  private drawOverlay(): void {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * this.animationProgress})`;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  private drawPauseContainer(selectedButtonIndex: number): void {
    const containerWidth = 600;
    const containerHeight = 400;
    const containerX = (this.canvasWidth - containerWidth) / 2;
    const containerY = (this.canvasHeight - containerHeight) / 2;

    const scale = 0.9 + this.animationProgress * 0.1;
    const alpha = this.animationProgress;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-this.canvasWidth / 2, -this.canvasHeight / 2);

    // Container Style
    this.ctx.fillStyle = 'rgba(10, 15, 20, 0.9)';
    this.ctx.strokeStyle = UI_THEME.secondary;
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = UI_THEME.secondary;
    this.ctx.shadowBlur = 20;

    this.ctx.fillRect(containerX, containerY, containerWidth, containerHeight);
    this.ctx.strokeRect(containerX, containerY, containerWidth, containerHeight);

    this.ctx.shadowBlur = 0;

    // Title
    this.ctx.font = `italic 900 80px "Courier New", monospace`;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('PAUSIERT', this.canvasWidth / 2, containerY + 100);

    // Buttons
    const buttonWidth = 300;
    const buttonHeight = 60;
    const buttonX = (this.canvasWidth - buttonWidth) / 2;
    const startY = containerY + 200;
    const buttonGap = 30;

    this.resumeButtonRect = { x: buttonX, y: startY, width: buttonWidth, height: buttonHeight };
    this.endGameButtonRect = { x: buttonX, y: startY + buttonHeight + buttonGap, width: buttonWidth, height: buttonHeight };

    this.drawArcadeButton('FORTFAHREN', this.resumeButtonRect, selectedButtonIndex === 0);
    this.drawArcadeButton('SPIEL BEENDEN', this.endGameButtonRect, selectedButtonIndex === 1);

    this.ctx.restore();
  }

  private drawArcadeButton(text: string, rect: { x: number, y: number, width: number, height: number }, isSelected: boolean): void {
    this.ctx.fillStyle = isSelected ? "rgba(255, 102, 0, 0.25)" : "rgba(0, 0, 0, 0.8)";
    this.ctx.strokeStyle = isSelected ? UI_THEME.secondary : "#555";
    this.ctx.lineWidth = 3;

    if (isSelected) {
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = UI_THEME.secondary;
    }

    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = isSelected ? "#fff" : "#aaa";
    this.ctx.font = `bold 30px "Courier New", monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    if (isSelected && Math.floor(Date.now() / 100) % 2 === 0) {
        this.ctx.fillStyle = UI_THEME.secondary;
    }
    this.ctx.fillText(text, rect.x + rect.width / 2, rect.y + rect.height / 2);
  }

  public getClickedButtonIndex(x: number, y: number): number | null {
    if (this.isPointInRect(x, y, this.resumeButtonRect)) return 0;
    if (this.isPointInRect(x, y, this.endGameButtonRect)) return 1;
    return null;
  }

  private isPointInRect(x: number, y: number, rect: { x: number, y: number, width: number, height: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }

  public resetAnimation(): void {
    this.startTime = Date.now();
    this.animationProgress = 0;
  }
}
