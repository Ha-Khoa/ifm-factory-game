import { Injectable } from '@angular/core';
import { Machine } from '../models/machine/machine';
import { Package } from '../models/package/package';
import { Product } from '../models/product/product';
import {Gamefield} from '../models/gamefield/gamefield';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
}

// Das UI_THEME Objekt wird jetzt dynamisch gefüllt.
const UI_THEME = {
  fontFamily: '',
  fontFamilyCentaur: '',
  textColor: '',
  bgColor: '',
  borderColor: '',
  highlightColor: '',
  lockedColor: '',
  shadowColor: '',
  progressBg: '',
  progressFill: '',
  progressBorder: '',
  primary: '',
  secondary: '',
  tertiary: '',
  transparent: '',
  black: '',
};

@Injectable({
  providedIn: 'root'
})
export class UIService {
  private ctxUI!: CanvasRenderingContext2D;
  private _angle!: number;

  // Lösch-Rechtecke speichern
  private machinePopups: Rect[] = [];
  private itemPopups: Rect[] = [];
  private neededItemPopups: Rect[] = [];
  private producingPopups: Rect[] = [];

  private images : { [key: string]: HTMLImageElement } = {}

  constructor() { }

  async init(ctxUI: CanvasRenderingContext2D, angle: number, images: { [key: string]: HTMLImageElement }) {
    this.ctxUI = ctxUI;
    this._angle = angle;
    this._loadTheme();
    this.images = images;
  }

  private _loadTheme() {
    const rootStyle = getComputedStyle(document.documentElement);
    UI_THEME.primary = rootStyle.getPropertyValue('--primary').trim();
    UI_THEME.secondary = rootStyle.getPropertyValue('--secondary').trim();
    UI_THEME.tertiary = rootStyle.getPropertyValue('--tertiary').trim();
    UI_THEME.fontFamily = rootStyle.getPropertyValue('--font-family').trim();
    UI_THEME.fontFamilyCentaur = rootStyle.getPropertyValue('--font-family-centaur').trim();
    UI_THEME.textColor = UI_THEME.tertiary;
    UI_THEME.bgColor = UI_THEME.primary; // Use primary color for popup background
    UI_THEME.borderColor = rootStyle.getPropertyValue('--border-color').trim();
    UI_THEME.highlightColor = UI_THEME.secondary; // Use secondary for highlight
    UI_THEME.lockedColor = rootStyle.getPropertyValue('--locked-color').trim();
    UI_THEME.shadowColor = rootStyle.getPropertyValue('--shadow-color').trim();
    UI_THEME.progressBg = rootStyle.getPropertyValue('--progress-bg').trim();
    UI_THEME.progressFill = rootStyle.getPropertyValue('--progress-fill').trim();
    UI_THEME.progressBorder = rootStyle.getPropertyValue('--progress-border').trim();
    UI_THEME.transparent = rootStyle.getPropertyValue('--md-sys-color-transparent').trim();
    UI_THEME.transparent = rootStyle.getPropertyValue('--md-sys-color-black').trim();
  }

  // ==========================================================================
  // --- ITEM POPUP (Für Items am Boden) ---
  // ==========================================================================

  drawItemPopup(item: Product | Package) {
    // 1. Erstmal IMMER aufräumen (verhindert Artefakte bei Bewegung)
    this.clearItemPopup();

    this.ctxUI.save();

    // 2. Inhalt bestimmen
    let title;
    let contentLines: { content: any; counted: any }[] = [];
    let titleImage;
    if (item instanceof Package) {
      title = 'Paket';
      titleImage = this.images[`/images/package.png`];
      const map = new Map<string, number>();
      for (const { name } of item.products) { map.set(name, (map.get(name) ?? 0) + 1); }
      contentLines = [...map].map(([content, counted]) => ({ content: content, counted: counted }));
    } else {
      titleImage = this.images[`/images/Products/${item.name.toLowerCase().replace(" ", "-")}.png`];
      title = `${item.name}`;
    }

    // 3. Größe und Position
    const lineHeight = 20;
    const padding = 15;
    const height = 15 + (contentLines.length * lineHeight) + padding;
    const width = 150;

    const popupConfig = {
      width: width,
      height: height,
      radius: 10,
      borderWidth: 2
    };

    // Position: Über dem ITEM (nicht Player)
    const x = item.position.x + (item.size / 2) - (width / 2);

    // Y-Position isometrisch projiziert + Offset nach oben
    const y = (item.position.y * Math.cos(this._angle)) - height - 40;

    // 4. Zeichnen
    // Rahmen zeichnen (undefined = Highlight-Farbe)
    this._drawStyledPopupBackground(x, y, popupConfig, undefined);

    this.ctxUI.textAlign = 'center';
    this.ctxUI.fillStyle = UI_THEME.textColor;
    let currentY = y + popupConfig.borderWidth;
    const centerX = x + (width / 2);

    // Titel
    currentY += 17.5;
    this.ctxUI.font = `bold 13px ${UI_THEME.fontFamily}`;
    this.ctxUI.fillText(title, centerX, currentY);

    this.ctxUI.drawImage(titleImage, x + 10, currentY - 15, 20, 20);

    // Linie
    currentY += 5;
    this._drawSeparator(centerX, currentY, width);

    // Inhalt
    currentY += 15;
    this.ctxUI.font = `12px ${UI_THEME.fontFamily}`;
    contentLines.forEach(line => {
      this.ctxUI.fillText(line.counted + "x " + line.content, centerX, currentY);

      let image = this.images[`/images/Products/${line.content.toLowerCase().replace(" ", "-")}.png`];
      this.ctxUI.drawImage(image, x + 10, currentY - 15, 20, 20);
      currentY += lineHeight;
    });

    // Button
    let image = this.images["/images/KeyBindings/keyBindings_E.png"];
    this.ctxUI.drawImage(image, x + width - 20, y + height - 20, 35, 35)

    this.ctxUI.restore();

    // 4. Löschbereich speichern
    this.itemPopups.push({
      x: x - 2,
      y: y - 2,
      width: width + 4,
      height: height + 4
    });
    this.itemPopups.push({
      x: x + width - 20,
      y: y + height - 20,
      width: 35,
      height: 35,
      radius: 0
    })
  }

  clearItemPopup() {
    this.itemPopups.forEach(
      rect => this.clearRectRounded(
        rect,
        rect.radius ?? 10,
        true
      )
    )
    this.itemPopups = [];
    return;
  }

  /**
   * Clears a rectangular area with rounded corners on the canvas context.
   *
   * @param {Rect} rect - The rectangle object defining the position (x, y), width, and height of the area to clear.
   * @param {number} [radius=10] - The radius of the corners. Defaults to 10 if not provided.
   * @param addOnePixel
   * @return {void} Does not return any value.
   */
  clearRectRounded(rect: Rect, radius:number = 10, addOnePixel:boolean = false): void {
    if(addOnePixel) {
      rect.x -= 1;
      rect.y -= 1;
      rect.width += 2;
      rect.height += 2;
    }
    this.ctxUI.save();
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(rect.x, rect.y, rect.width, rect.height, radius ?? 10);
    this.ctxUI.clip();
    this.ctxUI.clearRect(rect.x, rect.y, rect.width, rect.height);
    this.ctxUI.restore();
  }


  // ==========================================================================
  // --- MASCHINEN POPUP ---
  // ==========================================================================

  drawMachinePopUp(machine: Machine) {
    this.clearMachinePopUp();
    this.ctxUI.save();

    const requiredItemsCount = machine.inputRequirements.length;
    const lineHeight = 23;
    const baseLines = 7;
    const reqLines = requiredItemsCount > 0 ? requiredItemsCount + 1 : 1;
    const totalHeight = 50 + (baseLines + reqLines) * lineHeight;

    const popupConfig = {
      width: 200,
      height: totalHeight,
      radius: 12,
      borderWidth: 6,
      lineHeight: lineHeight - 3,
      yOffset: -250,
      xOffset: -62
    };

    const center = popupConfig.width / 2;
    // const x = machine.x + popupConfig.xOffset;
    // const y = machine.y * Math.cos(this._angle) + popupConfig.yOffset;
    const x = 50;
    const y = 610;

    this._drawStyledPopupBackground(x, y, popupConfig, machine.unlocked);

    let currentY = y + popupConfig.borderWidth + 30;
    this.ctxUI.textAlign = 'center';
    this.ctxUI.fillStyle = UI_THEME.textColor;

    currentY = this._drawStyledInfoText(x + center, currentY, machine, popupConfig.lineHeight);
    this._drawSeparator(x + center, currentY - 10, popupConfig.width * 0.85);
    currentY += 15;
    currentY = this._drawStyledRequirements(x + center, currentY, machine, popupConfig.lineHeight);
    currentY = this._drawStyledProgressBar(x, currentY, machine, popupConfig);
    this._drawStyledUpgradeButton(x, currentY + 15, machine, popupConfig);

    // User Action Button
    let image = this.images["/images/KeyBindings/keyBindings_F.png"];
    this.ctxUI.drawImage(image, popupConfig.width + x - 25, popupConfig.height + y - 25, 40, 40)

    this.ctxUI.restore();

    this.machinePopups.push({
      x: x - 10,
      y: y - 10,
      width: popupConfig.width + 20,
      height: popupConfig.height + 20
    });
    this.machinePopups.push({
      x: popupConfig.width + x - 25,
      y: popupConfig.height + y - 25,
      width: 40,
      height: 40,
      radius: 0
    })
  }

  drawMachineNeedsPopup(machines: Machine[]){
    this.neededItemPopups.forEach(rect => this.clearRectRounded(rect, 10, true))
    this.neededItemPopups = [];
    for(let machine of machines){
      let items = machine.inputRequirements.map(item => item)
      items = items.filter((item) => !machine.inventory.some(invItem => invItem.id === item.id));
      for(let item of items){
        let size = Gamefield.fieldsize * .75;
        let offset = (Gamefield.fieldsize - size) / 2;
        let gap = 8;
        let x = items.indexOf(item) == 0
          ? machine.position.x + offset
          : machine.position.x + ((size + gap) * (items.indexOf(item) % 2 === 0 ? -1 : 1)) + offset;
        if(items.length % 2 === 0)
          x -= size / 2 + gap/2;
        let y = machine.position.y * Math.cos(30 * Math.PI / 180) - size * 1.5;

        this.ctxUI.save();
        this.ctxUI.beginPath();
        this.ctxUI.fillStyle = UI_THEME.tertiary;
        this.ctxUI.roundRect(
          x,
          y,
          size,
          size,
          10
        );
        this.neededItemPopups.push({x, y, width: size, height: size});
        this.ctxUI.fill();

        let img = this.images[item._img!];
        this.ctxUI.drawImage(img, x + size/4, y + size/4, size/2, size/2);

        this.ctxUI.restore();
      }
    }
  }
  drawMachineProducingPopup(machines: Machine[]){
    this.producingPopups.forEach(rect => this.clearRectRounded(rect, 100, true))
    this.producingPopups = [];
    for (let machine of machines) {
      if (machine.isProducing) {
        const percent = 1 - (machine.productionTimer * 1000 / machine.productionRate);

        const size = Gamefield.fieldsize * 0.75;
        const offset = (Gamefield.fieldsize - size) / 2;
        const ringWidth = 8;
        const centerX = machine.position.x + offset + size / 2;
        const centerY = machine.position.y * Math.cos(30 * Math.PI / 180) - size * 1.5 + size / 2;
        const radius = size / 2;

        this.ctxUI.save();
        this.ctxUI.lineWidth = ringWidth;
        this.ctxUI.lineCap = 'round';

        // Background Ring
        this.ctxUI.strokeStyle = UI_THEME.tertiary;
        this.ctxUI.beginPath();
        this.ctxUI.arc(centerX, centerY, radius - ringWidth / 2, 0, 2 * Math.PI);
        this.ctxUI.stroke();

        // Progress Ring
        this.ctxUI.strokeStyle = UI_THEME.progressFill;
        this.ctxUI.beginPath();
        this.ctxUI.arc(centerX, centerY, radius - ringWidth / 2, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * percent);
        this.ctxUI.stroke();

        // Timer
        this.ctxUI.fillStyle = UI_THEME.progressFill;
        this.ctxUI.textAlign = 'center';
        this.ctxUI.font = `bold 16px ${UI_THEME.fontFamily}`;
        this.ctxUI.fillText(`${Math.floor(machine.productionTimer) + 1}`, centerX, centerY + 6);

        this.ctxUI.restore();

        this.producingPopups.push({
          x: centerX - radius,
          y: centerY - radius,
          width: size,
          height: size
        });
      }

    }
  }

  clearMachinePopUp() {
    this.machinePopups.forEach(popUp => this.clearRectRounded(popUp, popUp.radius ?? 10, true));
    this.machinePopups = [];
  }

  // --- HELPER ---


  private _drawStyledPopupBackground(x: number, y: number, config: any, unlocked?: boolean) {
    this.ctxUI.save();
    // this.ctxUI.shadowColor = UI_THEME.shadowColor;
    // this.ctxUI.shadowBlur = 10;
    // this.ctxUI.shadowOffsetX = 8;
    // this.ctxUI.shadowOffsetY = 8;

    // Use tertiary color for the border of the main popup content
    this.ctxUI.fillStyle = UI_THEME.tertiary;
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(x, y, config.width, config.height, config.radius);
    this.ctxUI.fill();

    // The main background of the popup uses the primary color
    this.ctxUI.fillStyle = UI_THEME.bgColor;
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(
      x + config.borderWidth, y + config.borderWidth,
      config.width - (2 * config.borderWidth), config.height - (2 * config.borderWidth),
      Math.max(0, config.radius - config.borderWidth)
    );
    this.ctxUI.fill();

    // Special case for item popup: use highlight color as border
    if (unlocked === undefined) {
      this.ctxUI.strokeStyle = UI_THEME.highlightColor;
      this.ctxUI.lineWidth = config.borderWidth;
      this.ctxUI.roundRect(x, y, config.width, config.height, config.radius);
      this.ctxUI.stroke();
    }
    // Inner stroke for detail
    this.ctxUI.strokeStyle = 'rgba(0,0,0,0.1)';
    this.ctxUI.lineWidth = 2;
    this.ctxUI.stroke();
    this.ctxUI.restore();

  }

  private _drawStyledInfoText(x: number, y: number, machine: Machine, lineHeight: number): number {
    let currentY = y;
    this.ctxUI.font = `bold 16px ${UI_THEME.fontFamily}`;
    this.ctxUI.fillText(`${machine.name}`, x, currentY);
    currentY += lineHeight;
    this.ctxUI.font = `12px ${UI_THEME.fontFamily}`;
    this.ctxUI.fillStyle = '#6d4c41'; // Keep this subtle color for level
    this.ctxUI.fillText(`Level ${machine.level}`, x, currentY - 5);
    this.ctxUI.fillStyle = UI_THEME.textColor;
    currentY += lineHeight - 5;

    let img = this.images[machine.outputProduct._img!];
    this.ctxUI.drawImage(img, x-70, currentY - 15, 20, 20);

    this.ctxUI.font = `italic 14px ${UI_THEME.fontFamily}`;
    this.ctxUI.fillText(`${machine.outputProduct.name}`, x, currentY);
    currentY += lineHeight;
    this.ctxUI.font = `14px ${UI_THEME.fontFamily}`;
    this.ctxUI.fillText(`Dauer: ${machine.productionRate / 1000}s`, x, currentY);
    currentY += lineHeight;
    return currentY;
  }

  private _drawStyledRequirements(x: number, y: number, machine: Machine, lineHeight: number): number {
    let currentY = y;
    this.ctxUI.font = `bold 14px ${UI_THEME.fontFamily}`;
    this.ctxUI.fillText('Benötigt:', x, currentY);
    currentY += lineHeight;
    this.ctxUI.font = `13px ${UI_THEME.fontFamily}`;
    if (machine.inputRequirements.length === 0) {
      this.ctxUI.fillStyle = '#8d6e63'; // Subtle color for "Nichts"
      this.ctxUI.fillText('- Nichts -', x, currentY);
      this.ctxUI.fillStyle = UI_THEME.textColor;
      currentY += lineHeight;
    } else {
      for (const req of machine.inputRequirements) {
        let img = this.images[req._img!];
        this.ctxUI.drawImage(img, x-70, currentY - 15, 20, 20);
        this.ctxUI.fillText(`${req.name}`, x, currentY);
        currentY += lineHeight;
      }
    }
    return currentY;
  }

  private _drawSeparator(xCenter: number, y: number, width: number) {
    this.ctxUI.save();
    this.ctxUI.beginPath();
    this.ctxUI.moveTo(xCenter - width / 2, y);
    this.ctxUI.lineTo(xCenter + width / 2, y);
    this.ctxUI.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Use a semi-transparent black for the separator
    this.ctxUI.lineWidth = 1;
    this.ctxUI.setLineDash([2, 4]); // Dashed line like in the order component
    this.ctxUI.stroke();
    this.ctxUI.restore();
  }

  private _drawStyledProgressBar(x: number, y: number, machine: Machine, config: any): number {
    const barWidth = config.width * 0.8;
    const barHeight = 12;
    const barX = x + (config.width - barWidth) / 2;
    const barY = y;
    const progressPercentage = (1 - (machine.productionTimer * 1000 / machine.productionRate));
    const progressValue = Math.max(0, Math.min(1, progressPercentage));

    this.ctxUI.fillStyle = UI_THEME.progressBg;
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(barX, barY, barWidth, barHeight, 6);
    this.ctxUI.fill();

    if (machine.isProducing && progressValue > 0) {
      this.ctxUI.fillStyle = UI_THEME.progressFill;
      this.ctxUI.beginPath();
      this.ctxUI.roundRect(barX, barY, barWidth * progressValue, barHeight, 6);
      this.ctxUI.fill();
    }
    this.ctxUI.strokeStyle = UI_THEME.progressBorder;
    this.ctxUI.lineWidth = 1;
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(barX, barY, barWidth, barHeight, 6);
    this.ctxUI.stroke();
    return y + barHeight + 5;
  }

  private _drawStyledUpgradeButton(x: number, y: number, machine: Machine, config: any) {
    if (!machine.upgradable) return;
    const btnWidth = config.width * 0.7;
    const btnHeight = 30;
    const btnX = x + (config.width - btnWidth) / 2;
    const btnY = y;
    this.ctxUI.save();

    // Button Background: Use tertiary color to match the order rewards section
    this.ctxUI.fillStyle = UI_THEME.tertiary;
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(btnX, btnY, btnWidth, btnHeight, 15);
    this.ctxUI.fill();

    // Button Text: Use secondary color for contrast
    this.ctxUI.fillStyle = UI_THEME.secondary;
    this.ctxUI.font = `bold 14px ${UI_THEME.fontFamily}`;
    this.ctxUI.textAlign = 'center';
    this.ctxUI.fillText(`Upgrade (2000$)`, x + config.width / 2, btnY + 20);
    this.ctxUI.restore();
  }
}
