import { Order } from '../../interfaces/order';
import { UI_THEME } from './theme.manager';
import { Rect } from './rect.interface';
import { CanvasHelper } from './canvas.helper';

export class OrderDrawer {
  private readonly FONT_SIZE = 16;
  private readonly PADDING = 15;
  private readonly ICON_SIZE = 24;
  private readonly RADIUS = 20;

  // Design constants
  private readonly CARD_WIDTH = 300;
  private readonly BORDER_WIDTH = 5;
  private readonly HEADER_HEIGHT = 40;
  private readonly FOOTER_HEIGHT = 50;
  private readonly ITEM_GAP = 10;
  private readonly TIMER_AREA_HEIGHT = 30;
  private readonly PROGRESS_BAR_RADIUS = this.RADIUS;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private images: { [key: string]: HTMLImageElement }
  ) {}

  public draw(order: Order, initialTime: number | undefined, x: number, y: number): void {
    this.ctx.save();
    // --- 1. Calculate height ---
    const itemsHeight = order.items.length > 0 ? order.items.length * (this.ICON_SIZE + this.ITEM_GAP) - this.ITEM_GAP : 0;
    const contentHeight =
      this.PADDING +
      itemsHeight +
      this.PADDING +
      1 + // Separator
      this.PADDING +
      this.ICON_SIZE + // Costs
      this.PADDING +
      this.TIMER_AREA_HEIGHT;

    const totalHeight = this.HEADER_HEIGHT + contentHeight + this.FOOTER_HEIGHT;

    // --- 2. Draw Card Layout ---
    this.drawCardBase(x, y, totalHeight);
    x += this.PADDING;
    y += this.PADDING + this.BORDER_WIDTH;
    this.drawHeader(x, y);
    const progressBarHeight = 20;
    y += this.PADDING
    const timerY = y + (this.TIMER_AREA_HEIGHT - progressBarHeight) / 2;
    this.drawTimer(x, timerY, order.timeSeconds, order.initialTime / 1000);

    // --- 3. Draw Content ---
    let currentY = y + this.TIMER_AREA_HEIGHT;
    currentY += this.PADDING

    currentY = this.drawItems(order, x, currentY);
    currentY += this.PADDING;

    currentY = this.drawCosts(order, x, currentY);

    this.drawSeparator(x, currentY, this.CARD_WIDTH - this.PADDING * 2);
    currentY += this.PADDING;

    this.drawFooter(order, x, currentY)
    this.ctx.restore
    this.ctx.textBaseline = "alphabetic"
  }

  private drawCardBase(x: number, y: number, height: number): void {
    this.ctx.save();

    this.ctx.fillStyle = UI_THEME.tertiary;
    this.ctx.strokeStyle = UI_THEME.secondary;
    this.ctx.lineWidth = this.BORDER_WIDTH;

    this.ctx.beginPath();
    this.ctx.roundRect(x, y, this.CARD_WIDTH, height, this.RADIUS)
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore
  }

  private drawHeader(x: number, y: number): void {

    this.ctx.fillStyle = 'lightgray';
    this.ctx.font = `bold ${this.FONT_SIZE + 2}px ${UI_THEME.fontFamily}`;
    this.ctx.textBaseline = 'middle';
    const title = 'AKTUELLER AUFTRAG';
    this.ctx.fillText(title, x + this.BORDER_WIDTH, y + this.BORDER_WIDTH);
  }

  private drawItems(order: Order, x: number, y: number): number {
    let currentY = y;
    this.ctx.font = `bold ${this.FONT_SIZE}px ${UI_THEME.fontFamily}`;
    this.ctx.fillStyle = UI_THEME.secondary;
    this.ctx.textBaseline = 'middle';

    for (const item of order.items) {
      const icon = item.product.img ? this.images[item.product.img] : undefined;
      if (icon) {
        this.ctx.drawImage(icon, x, currentY, this.ICON_SIZE, this.ICON_SIZE);
      }
      const itemText = `${item.quantity}x ${item.product.name}`;
      this.ctx.fillText(itemText, x + this.ICON_SIZE + 10, currentY + this.ICON_SIZE / 2);
      currentY += this.ICON_SIZE + this.ITEM_GAP;
    }
    return currentY - this.ITEM_GAP;
  }

  private drawCosts(order: Order, x: number, y: number): number {
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = UI_THEME.secondary;
    const costsText = `Kosten: ${order.costs}`;
    this.ctx.drawImage(this.images['/images/fox/fox-coin.png'], x , y, this.ICON_SIZE, this.ICON_SIZE);
    this.ctx.fillText(costsText, x + this.ICON_SIZE + 10, y + this.ICON_SIZE / 2);
    return y + this.ICON_SIZE + this.PADDING;
  }

  private drawFooter(order: Order, x: number, y: number): void {

    this.ctx.fillStyle = 'lightgray'
    this.ctx.font = `bold ${this.FONT_SIZE}px ${UI_THEME.fontFamily}`;
    this.ctx.textBaseline = 'middle';

    this.ctx.fillText('BELOHNUNG', x, y)
    y += this.PADDING

    this.ctx.fillStyle = UI_THEME.secondary;
    const moneyText = `${order.grants}`;
    const pointsText = `${order.reward}`;

    const moneyIcon = this.images['/images/fox/fox-coin.png'];
    const moneyX = x;
    if (moneyIcon) {
      this.ctx.drawImage(moneyIcon, moneyX, y , this.ICON_SIZE, this.ICON_SIZE);
    }
    this.ctx.fillText(moneyText, moneyX + this.ICON_SIZE + 5, y + this.ICON_SIZE / 2);

    const trophyIcon = this.images['/images/fox/fox-trophy.png'];
    const moneyMetrics = this.ctx.measureText(moneyText)
    const moneyWidth = moneyMetrics.width + this.ICON_SIZE
    const pointsX = x + moneyWidth + this.PADDING;
    if (trophyIcon) {
      this.ctx.drawImage(trophyIcon, pointsX, y , this.ICON_SIZE, this.ICON_SIZE);
    }
    this.ctx.fillText(pointsText, pointsX + this.ICON_SIZE + 5, y + this.ICON_SIZE / 2);
  }

  private drawSeparator(x: number, y: number, width: number): void {
    this.ctx.save();
    this.ctx.strokeStyle = UI_THEME.outline;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + width, y);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawTimer(x: number, y: number, remainingTime: number, initialTime: number): void {
    if (initialTime <= 0) return;

    const availableWidth = this.CARD_WIDTH - this.PADDING * 2;
    const timeTextWidth = 50;
    const gap = 10;
    const progressBarWidth = availableWidth - timeTextWidth - gap;
    const progressBarHeight = 15;

    const progress = remainingTime / initialTime;

    const startX = x ;

    // Draw background
    this.ctx.fillStyle = UI_THEME.progressBg;
    this.ctx.beginPath();
    this.ctx.roundRect(startX, y, progressBarWidth, progressBarHeight, this.PROGRESS_BAR_RADIUS);
    this.ctx.fill();

    // Draw progress
    this.ctx.fillStyle = UI_THEME.secondary;
    this.ctx.beginPath();
    this.ctx.roundRect(startX, y, progressBarWidth * progress, progressBarHeight, this.PROGRESS_BAR_RADIUS);
    this.ctx.fill();

    // Draw border
    this.ctx.strokeStyle = UI_THEME.progressBorder;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(startX, y, progressBarWidth, progressBarHeight, this.PROGRESS_BAR_RADIUS);
    this.ctx.stroke();

    // Draw time text
    const minutes = Math.floor(remainingTime / 60);
    const seconds = Math.floor(remainingTime % 60);
    const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    this.ctx.fillStyle = UI_THEME.info;
    this.ctx.font = `bold ${this.FONT_SIZE}px ${UI_THEME.fontFamily}`;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(timeText, startX + progressBarWidth + gap, y + progressBarHeight / 2);
  }
}
