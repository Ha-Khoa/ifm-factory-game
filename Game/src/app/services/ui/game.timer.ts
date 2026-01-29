import { RenderingService } from "../rendering.service";
import { UI_THEME } from "./theme.manager";

/**
 * Represents a game timer with a visual representation inspired by an industrial pressure gauge.
 * It counts down from a given time and provides a visual and digital display.
 * This version is fully procedural and does not rely on external images.
 */
export class GameTimer {
  private initialTime: number;
  private currentTime: number;

  /**
   * Creates an instance of GameTimer.
   * @param ctx The 2D rendering context of the canvas.
   * @param images A dictionary of pre-loaded HTMLImageElement objects (unused, kept for signature consistency).
   * @param initialMinutes The starting minutes for the timer. Defaults to 15.
   * @param initialSeconds The starting seconds for the timer. Defaults to 0.
   */
  constructor(
    private ctx: CanvasRenderingContext2D,
    private images: { [key: string]: HTMLImageElement },
    initialMinutes: number = 5,
    initialSeconds: number = 0
  ) {
    this.initialTime = (initialMinutes * 60 + initialSeconds) * 1000;
    this.currentTime = this.initialTime;
  }

  /**
   * Draws the entire timer gauge on the canvas.
   * @returns A hitbox array for UI interaction management.
   */
  public drawTimer(): { x: number; y: number; width: number; height: number }[] {
    const centerX = this.ctx.canvas.width / 2;
    const centerY = 70; // Positioned near the top-center
    const radius = 60;

    this.drawGauge(centerX, centerY, radius);
    this.drawTimeArc(centerX, centerY, radius);
    this.drawTimeText(centerX, centerY);

    // Return a single hitbox for the entire gauge.
    return [{ x: centerX - radius, y: centerY - radius, width: radius * 2, height: radius * 2 }];
  }

  /**
   * Draws the background and border of the gauge using procedural gradients.
   */
  private drawGauge(x: number, y: number, radius: number): void {
    this.ctx.save();

    // Draw the procedural background using a radial gradient for a 3D effect.
    const bgGradient = this.ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius);
    bgGradient.addColorStop(0, '#444');
    bgGradient.addColorStop(0.5, '#222');
    bgGradient.addColorStop(1, '#111');

    this.ctx.fillStyle = bgGradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Add a thin black inner stroke for definition.
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw the main orange glowing border.
    this.ctx.shadowColor = UI_THEME.secondary;
    this.ctx.shadowBlur = 25;
    this.ctx.strokeStyle = UI_THEME.secondary;
    this.ctx.lineWidth = 8;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Draws the arc representing the remaining time.
   */
  private drawTimeArc(x: number, y: number, radius: number): void {
    this.ctx.save();
    const timeRatio = this.currentTime / this.initialTime;
    // The arc starts at the top (-90 degrees) and goes clockwise
    const startAngle = -0.5 * Math.PI;
    const endAngle = startAngle + timeRatio * 2 * Math.PI;

    // The color of the arc indicates the urgency
    let arcColor = UI_THEME.secondary; // Standard IFM orange
    if (timeRatio < 0.5) arcColor = '#D95800'; // A darker, more urgent orange
    if (timeRatio < 0.2) arcColor = '#B34700'; // A reddish, critical orange

    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = arcColor;
    this.ctx.lineWidth = 14;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius - 20, startAngle, endAngle);
    this.ctx.stroke();

    // Add a pulsing glow effect when time is critically low
    if (timeRatio < 0.2) {
      const pulse = (Math.sin(Date.now() / 150) + 1) / 2; // Varies between 0 and 1
      this.ctx.globalAlpha = 0.5 + pulse * 0.5;
      this.ctx.shadowColor = '#fa1100'; // A strong red glow for danger
      this.ctx.shadowBlur = 30;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  /**
   * Draws the digital time display in the center of the gauge.
   */
  private drawTimeText(x: number, y: number): void {
    const minutes = Math.floor(this.currentTime / 60000);
    const seconds = Math.floor((this.currentTime % 60000) / 1000);
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    this.ctx.save();
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = `bold 20px "Courier New", monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Add a subtle shadow to make the text pop
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;

    this.ctx.fillText(timeString, x, y);
    this.ctx.restore();
  }

  /**
   * Updates the timer's current time based on the delta time from the rendering service.
   * @returns True if the timer has reached zero, false otherwise.
   */
  public updateTimer(): boolean {
    const dt = RenderingService.instance().deltaTime;

    // Clamp delta time to a max of 250ms to prevent large jumps after unpausing.
    const clampedDt = Math.min(dt, 250);

    // Prevent time from going below zero
    if (this.currentTime > 0) {
      this.currentTime -= clampedDt || 16; // Use clampedDt and 16ms as a fallback delta
      if (this.currentTime < 0) {
        this.currentTime = 0;
      }
    }

    return this.currentTime <= 0;
  }
}
