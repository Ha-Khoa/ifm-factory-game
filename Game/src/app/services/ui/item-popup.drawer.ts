import { Product } from '../../models/product/product';
import { Package } from '../../models/package/package';
import { Rect } from './rect.interface';
import { CanvasHelper } from './canvas.helper';
import { UI_THEME } from './theme.manager';
import { RenderingService } from '../rendering.service';

/**
 * Handles drawing popups for items on the ground (Products and Packages).
 */
export class ItemPopupDrawer {
  /**
   * @param ctx The canvas rendering context.
   * @param images A map of loaded image elements.
   * @param angle The isometric projection angle.
   */

  constructor(
    private ctx: CanvasRenderingContext2D,
    private images: { [key: string]: HTMLImageElement }
  ) {}

  /**
   * Draws a popup for a given Product or Package.
   * @param item The item to display the popup for.
   * @returns An array of Rects representing the areas drawn, for later clearing.
   */
  public draw(item: Product | Package, offsetCamera: [number, number], fov: number): Rect[] {
    this.ctx.save();

    const gameFov = RenderingService.instance().gameFov

    let title: string;
    let contentLines: { content: string; counted: number }[] = [];
    let titleImage: HTMLImageElement;

    if (item instanceof Package) {
      title = 'Paket';
      titleImage = this.images['/images/package.png'];
      const map = new Map<string, number>();
      item.products.forEach(({ name }) => map.set(name, (map.get(name) ?? 0) + 1));
      contentLines = [...map].map(([content, counted]) => ({ content, counted }));
    } else {
      title = item.name;
      titleImage = this.images[`/images/Products/${item.name.toLowerCase().replace(' ', '-')}.png`];
    }

    const lineHeight = 20 * fov / gameFov;
    const padding = 15 * fov / gameFov;
    const height = 15 * fov / gameFov + (contentLines.length * lineHeight) + padding;
    const width = 150 * fov / gameFov;
    const angle = RenderingService.instance().angle;
    const popupConfig = { width, height, radius: 10, borderWidth: 2 };

    const x = item.position.x * fov + (item.size / 2) - (width / 2) + offsetCamera[0];
    const y = item.position.y * Math.cos(angle) * fov - height - 40 + offsetCamera[1] * Math.cos(angle) + RenderingService.instance().rotationZ;

    // The 'unlocked' parameter is undefined to trigger the special highlight border
    CanvasHelper.drawStyledPopupBackground(this.ctx, x, y, popupConfig);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = UI_THEME.textColor;
    let currentY = y + popupConfig.borderWidth;
    const centerX = x + (width / 2);

    // Title
    currentY += 17.5;
    this.ctx.font = `bold 13px ${UI_THEME.fontFamily}`;
    this.ctx.fillText(title, centerX, currentY);
    if (titleImage) {
      this.ctx.drawImage(titleImage, x + 10, currentY - 15, 20, 20);
    }

    // Separator
    currentY += 5;
    CanvasHelper.drawSeparator(this.ctx, centerX, currentY, width);

    // Content (for packages)
    currentY += 15;
    this.ctx.font = `12px ${UI_THEME.fontFamily}`;
    contentLines.forEach(line => {
      this.ctx.fillText(`${line.counted}x ${line.content}`, centerX, currentY);
      const image = this.images[`/images/Products/${line.content.toLowerCase().replace(' ', '-')}.png`];
      if (image) {
        this.ctx.drawImage(image, x + 10, currentY - 15, 20, 20);
      }
      currentY += lineHeight;
    });

    // Interaction hint
    const eKeyImage = this.images['/images/KeyBindings/keyBindings_E.png'];
    if (eKeyImage) {
      this.ctx.drawImage(eKeyImage, x + width - 20, y + height - 20, 35, 35);
    }

    this.ctx.restore();

    // Define areas to be cleared on the next frame
    const mainPopupRect: Rect = { x: x - 2, y: y - 2, width: width + 4, height: height + 4, radius: popupConfig.radius };
    const buttonRect: Rect = { x: x + width - 20, y: y + height - 20, width: 35, height: 35, radius: 0 };

    return [mainPopupRect, buttonRect];
  }
}
