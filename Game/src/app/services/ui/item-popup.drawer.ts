import { Product } from '../../models/product/product';
import { Package } from '../../models/package/package';
import { Rect } from './rect.interface';
import { CanvasHelper } from './canvas.helper';
import { UI_THEME } from './theme.manager';
import { RenderingService } from '../rendering.service';
import { GameService } from '../game.service';

/**
 * Handles drawing popups for items on the ground (Products and Packages).
 */
export class ItemPopupDrawer {
  /**
   * @param ctx The canvas rendering context.
   * @param images A map of loaded image elements.
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
    let title: string;
    let contentLines: { content: string; counted: number; img?: string; }[] = [];
    let titleImage: HTMLImageElement;

    if (item instanceof Package) {
      title = 'Paket';
      titleImage = this.images['/images/package.png'];
      const productSummary = new Map<string, { count: number, img: string | undefined }>();
      item.products.forEach(product => {
        const entry = productSummary.get(product.name);
        if (entry) {
          entry.count++;
        } else {
          productSummary.set(product.name, { count: 1, img: product.img });
        }
      });
      contentLines = [...productSummary].map(([name, { count, img }]) => ({ content: name, counted: count, img: img }));
    } else {
      title = item.name;
      titleImage = this.images['/images/package.png']
      if (item.img) titleImage = this.images[item.img];
    }

    const lineHeight = 20;
    const padding = 15;
    const height = 15 + (contentLines.length * lineHeight) + padding;
    const width = 150;
    const angle = RenderingService.instance().angle;
    const popupConfig = { width, height, radius: 10, borderWidth: 2 };

    const x = item.position.x * fov + (item.size / 2) - (width / 2.5) + offsetCamera[0];
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

    this.ctx.drawImage(titleImage, x + 10, currentY - 15, 18, 18);

    // Separator
    currentY += 5;
    if (contentLines.length != 0) CanvasHelper.drawSeparator(this.ctx, centerX, currentY, width);

    // Content (for packages)
    currentY += 15;
    this.ctx.font = `12px ${UI_THEME.fontFamily}`;
    contentLines.forEach(line => {
      this.ctx.fillText(`${line.counted}x ${line.content}`, centerX, currentY);
      const image = line.img ? this.images[line.img] : undefined;
      if (image) {
        this.ctx.drawImage(image, x + 10, currentY - 15, 20, 20);
      }
      currentY += lineHeight;
    });

    this.ctx.restore();

    // Define areas to be cleared on the next frame
    const mainPopupRect: Rect = { x: x - 2, y: y - 2, width: width + 4, height: height + 4, radius: popupConfig.radius };
    const buttonRect: Rect = { x: x + width - 20, y: y + height - 20, width: 35, height: 35, radius: 0 };

    return [mainPopupRect, buttonRect];
  }
}
