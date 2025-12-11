import { Injectable } from '@angular/core';
import { Machine } from '../models/machine/machine';
import { Package } from '../models/package/package';
import { Product } from '../models/product/product';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Das UI_THEME Objekt wird jetzt dynamisch gefüllt.
const UI_THEME = {
  fontFamily: '',
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
  tertiary: ''
};

@Injectable({
  providedIn: 'root'
})
export class UIService {
  private ctxUI!: CanvasRenderingContext2D;
  private _angle!: number;

  // Lösch-Rechtecke speichern
  private lastMachinePopupRect: Rect | null = null;
  private lastItemPopupRect: Rect | null = null;

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
    UI_THEME.textColor = UI_THEME.tertiary;
    UI_THEME.bgColor = UI_THEME.primary; // Use primary color for popup background
    UI_THEME.borderColor = rootStyle.getPropertyValue('--border-color').trim();
    UI_THEME.highlightColor = UI_THEME.secondary; // Use secondary for highlight
    UI_THEME.lockedColor = rootStyle.getPropertyValue('--locked-color').trim();
    UI_THEME.shadowColor = rootStyle.getPropertyValue('--shadow-color').trim();
    UI_THEME.progressBg = rootStyle.getPropertyValue('--progress-bg').trim();
    UI_THEME.progressFill = rootStyle.getPropertyValue('--progress-fill').trim();
    UI_THEME.progressBorder = rootStyle.getPropertyValue('--progress-border').trim();
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
    let contentLines: string[] = [];

    if (item instanceof Package) {
      title = '📦 Paket (E)';
      item.products.forEach(p => contentLines.push(`• ${p.name}`));
    } else {
      title = 'Aufheben (E)';
      contentLines.push(`• ${item.name}`);
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

    // 4. Löschbereich speichern (WICHTIG: Großzügiger Puffer gegen Schattenreste!)
    this.lastItemPopupRect = {
      x: x - 10,
      y: y - 10,
      width: width + 20,
      height: height + 20
    };

    // 5. Zeichnen
    // Rahmen zeichnen (undefined = Highlight-Farbe)
    this._drawStyledPopupBackground(x, y, popupConfig, undefined);

    this.ctxUI.textAlign = 'center';
    this.ctxUI.fillStyle = UI_THEME.textColor;
    let currentY = y + popupConfig.borderWidth + 15;
    const centerX = x + (width / 2);

    // Titel
    this.ctxUI.font = `bold 13px ${UI_THEME.fontFamily}`;
    this.ctxUI.fillText(title, centerX, currentY);
    currentY += 5;

    // Linie
    this._drawSeparator(centerX, currentY, width);
    currentY += 15;

    // Inhalt
    this.ctxUI.font = `12px ${UI_THEME.fontFamily}`;
    contentLines.forEach(line => {
      this.ctxUI.fillText(line, centerX, currentY);
      currentY += lineHeight;
    });

    this.ctxUI.restore();
  }

  clearItemPopup() {
    if (this.lastItemPopupRect) {
      const rect = this.lastItemPopupRect;
      this.ctxUI.clearRect(rect.x, rect.y, rect.width, rect.height);
      this.lastItemPopupRect = null;
    }
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

    this.lastMachinePopupRect = {
      x: x - 10, y: y - 10, width: popupConfig.width + 20, height: popupConfig.height + 20
    };

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

    this.ctxUI.restore();
  }

  clearMachinePopUp() {
    if (this.lastMachinePopupRect) {
      const rect = this.lastMachinePopupRect;
      this.ctxUI.clearRect(rect.x, rect.y, rect.width, rect.height);
      this.lastMachinePopupRect = null;
    }
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
