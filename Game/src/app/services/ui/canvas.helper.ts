import { Rect } from './rect.interface';
import { UI_THEME } from './theme.manager';

/**
 * Provides static helper methods for common canvas drawing operations.
 */
export class CanvasHelper {
  /**
   * Clears a rectangular area with rounded corners on the canvas.
   * Expands the clear area by one pixel to prevent artifacts if specified.
   * @param ctx The canvas rendering context.
   * @param rect The rectangle to clear.
   * @param radius The corner radius.
   * @param addOnePixel Expands the clear area by one pixel.
   */
  public static clearRectRounded(ctx: CanvasRenderingContext2D, rect: Rect, radius: number = 10, addOnePixel: boolean = false): void {
    const r = { ...rect };
    if (addOnePixel) {
      r.x -= 1;
      r.y -= 1;
      r.width += 2;
      r.height += 2;
    }
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.width, r.height, radius ?? 10);
    ctx.clip();
    ctx.clearRect(r.x, r.y, r.width, r.height);
    ctx.restore();
  }

  /**
   * Draws a styled background for a popup, with different states for unlocked, locked, or special popups.
   * @param ctx The canvas rendering context.
   * @param x The x-coordinate of the popup.
   * @param y The y-coordinate of the popup.
   * @param config Configuration for size, radius, and border.
   * @param unlocked If false, shows a locked state. If undefined, it's a special item popup.
   */
  public static drawStyledPopupBackground(ctx: CanvasRenderingContext2D, x: number, y: number, config: any, unlocked?: boolean): void {
    ctx.save();

    // Outer border/background using the tertiary color
    ctx.fillStyle = UI_THEME.tertiary;
    ctx.beginPath();
    ctx.roundRect(x, y, config.width, config.height, config.radius);
    ctx.fill();

    // Inner main background using the primary background color
    ctx.fillStyle = UI_THEME.bgColor;
    ctx.beginPath();
    ctx.roundRect(
      x + config.borderWidth, y + config.borderWidth,
      config.width - (2 * config.borderWidth), config.height - (2 * config.borderWidth),
      Math.max(0, config.radius - config.borderWidth)
    );
    ctx.fill();

    // Special case for item popups: apply a highlight border
    if (unlocked === undefined) {
      ctx.strokeStyle = UI_THEME.highlightColor;
      ctx.lineWidth = config.borderWidth;
      ctx.roundRect(x, y, config.width, config.height, config.radius);
      ctx.stroke();
    }

    // Inner stroke for a slight inset detail
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    // Re-applies the roundRect path before stroking to avoid issues
    ctx.roundRect(
      x + config.borderWidth, y + config.borderWidth,
      config.width - (2 * config.borderWidth), config.height - (2 * config.borderWidth),
      Math.max(0, config.radius - config.borderWidth)
    );
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws a dashed separator line, typically used to divide sections within a popup.
   * @param ctx The canvas rendering context.
   * @param xCenter The horizontal center of the line.
   * @param y The vertical position of the line.
   * @param width The width of the line.
   */
  public static drawSeparator(ctx: CanvasRenderingContext2D, xCenter: number, y: number, width: number): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xCenter - width / 2, y);
    ctx.lineTo(xCenter + width / 2, y);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws a styled key or button, like those on a keyboard or gamepad.
   * @param ctx The canvas rendering context.
   * @param key The text to display inside the key (e.g., 'P', 'Space').
   * @param x The x-coordinate of the key.
   * @param y The y-coordinate of the key.
   * @param width The width of the key.
   * @param height The height of the key.
   */
  public static drawKey(ctx: CanvasRenderingContext2D, key: string, x: number, y: number, width: number, height: number): void {
    const cornerRadius = 8;
    ctx.save();

    ctx.fillStyle = UI_THEME.tertiary;
    ctx.strokeStyle = UI_THEME.secondary;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(x, y, width, height, cornerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const fontSize = height * (key.length > 2 ? 0.35 : 0.5);
    ctx.font = `bold ${fontSize}px ${UI_THEME.fontFamily}`;
    ctx.fillStyle = UI_THEME.secondary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillText(key, x + width / 2, y + height / 2);

    ctx.restore();
  }
}
