import { Injectable } from '@angular/core';
import { Machine } from '../models/machine/machine';
import { Player } from '../models/player/player';
import { InteractableManager } from '../models/interactableObject/interactable-manager';
import { Package } from '../models/package/package';
import { Product } from '../models/product/product';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const UI_THEME = {
  fontFamily: '"Arial Rounded MT Bold", "Segoe UI", Arial, sans-serif',
  textColor: '#3e2723',
  bgColor: '#f4e1c1',
  borderColor: '#5d4037',
  highlightColor: '#ffb300',
  lockedColor: '#d32f2f',
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  progressBg: '#d7ccc8',
  progressFill: '#7cb342',
  progressBorder: '#5d4037'
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

  constructor() { }

  async init(ctxUI: CanvasRenderingContext2D, angle: number) {
    this.ctxUI = ctxUI;
    this._angle = angle;
  }

  // ==========================================================================
  // --- ITEM POPUP (Für Items am Boden) ---
  // ==========================================================================

  drawItemPopup(item: Product | Package) {
    // 1. Erstmal IMMER aufräumen (verhindert Artefakte bei Bewegung)
    this.clearItemPopup();

    this.ctxUI.save();

    // 2. Inhalt bestimmen
    let title = '';
    let contentLines: string[] = [];

    if (item instanceof Package) {
      title = '📦 Paket (E)';
      item.products.forEach(p => contentLines.push(`• ${p.name}`));
    } else {
      title = '✨ Aufheben (E)';
      contentLines.push(`• ${item.name}`);
    }

    // 3. Größe und Position
    const lineHeight = 20;
    const padding = 15;
    const height = 35 + (contentLines.length * lineHeight) + padding;
    const width = 150;

    const popupConfig = {
      width: width,
      height: height,
      radius: 10,
      borderWidth: 3
    };

    // Position: Über dem ITEM (nicht Player)
    const x = item.position.x + (item.size / 2) - (width / 2);

    // Y-Position isometrisch projiziert + Offset nach oben
    const y = (item.position.y * Math.cos(this._angle)) - height - 40;

    // 4. Löschbereich speichern (WICHTIG: Großzügiger Puffer gegen Schattenreste!)
    this.lastItemPopupRect = {
      x: x - 50, 
      y: y - 50,
      width: width + 100, 
      height: height + 100
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
    this._drawSeparator(centerX, currentY, width * 0.8);
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
      lineHeight: lineHeight-3,
      yOffset: -250,
      xOffset: -62 
    };

    const center = popupConfig.width / 2;
    const x = machine.x + popupConfig.xOffset;
    const y = machine.y * Math.cos(this._angle) + popupConfig.yOffset;

    this.lastMachinePopupRect = { 
      x: x - 40, y: y - 40, width: popupConfig.width + 80, height: popupConfig.height + 80 
    };

    this._drawStyledPopupBackground(x, y, popupConfig, machine.unlocked);

    let currentY = y + popupConfig.borderWidth + 30; 
    this.ctxUI.textAlign = 'center';
    this.ctxUI.fillStyle = UI_THEME.textColor;

    currentY = this._drawStyledInfoText(x + center, currentY, machine, popupConfig.lineHeight);
    this._drawSeparator(x + center, currentY - 10, popupConfig.width * 0.85);
    currentY += 15;
    currentY = this._drawStyledRequirements(x + center, currentY, machine, popupConfig.lineHeight);
    currentY = this._drawStyledProgressBar(x, currentY + 15, machine, popupConfig);
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
    this.ctxUI.shadowColor = UI_THEME.shadowColor;
    this.ctxUI.shadowBlur = 20;
    this.ctxUI.shadowOffsetX = 8;
    this.ctxUI.shadowOffsetY = 8;

    let borderColor = unlocked ? UI_THEME.borderColor : UI_THEME.lockedColor;
    if (unlocked === undefined) borderColor = UI_THEME.highlightColor;

    this.ctxUI.fillStyle = borderColor;
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(x, y, config.width, config.height, config.radius);
    this.ctxUI.fill();
    this.ctxUI.restore();

    this.ctxUI.fillStyle = UI_THEME.bgColor;
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(
      x + config.borderWidth, y + config.borderWidth,
      config.width - (2 * config.borderWidth), config.height - (2 * config.borderWidth),
      Math.max(0, config.radius - config.borderWidth)
    );
    this.ctxUI.fill();
    this.ctxUI.strokeStyle = 'rgba(0,0,0,0.1)';
    this.ctxUI.lineWidth = 2;
    this.ctxUI.stroke();
  }

  private _drawStyledInfoText(x: number, y: number, machine: Machine, lineHeight: number): number {
    let currentY = y; 
    this.ctxUI.font = `bold 16px ${UI_THEME.fontFamily}`;
    this.ctxUI.fillText(`${machine.name}`, x, currentY);
    currentY += lineHeight;
    this.ctxUI.font = `12px ${UI_THEME.fontFamily}`;
    this.ctxUI.fillStyle = '#6d4c41';
    this.ctxUI.fillText(`Level ${machine.level}`, x, currentY - 5);
    this.ctxUI.fillStyle = UI_THEME.textColor;
    currentY += lineHeight - 5;
    this.ctxUI.font = `italic 14px ${UI_THEME.fontFamily}`;
    this.ctxUI.fillText(`Erzeugt: ${machine.outputProduct.name}`, x, currentY);
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
        this.ctxUI.fillStyle = '#8d6e63';
        this.ctxUI.fillText('- Nichts -', x, currentY);
        this.ctxUI.fillStyle = UI_THEME.textColor;
        currentY += lineHeight;
    } else {
        for (const req of machine.inputRequirements) {
            this.ctxUI.fillText(`• ${req.name}`, x, currentY);
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
    this.ctxUI.strokeStyle = 'rgba(62, 39, 35, 0.2)';
    this.ctxUI.lineWidth = 2;
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
    const btnWidth = config.width * 0.6;
    const btnHeight = 25;
    const btnX = x + (config.width - btnWidth) / 2;
    const btnY = y;
    this.ctxUI.save();
    this.ctxUI.shadowColor = 'rgba(0,0,0,0.3)';
    this.ctxUI.shadowBlur = 5;
    this.ctxUI.shadowOffsetY = 2;
    this.ctxUI.fillStyle = UI_THEME.highlightColor;
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(btnX, btnY, btnWidth, btnHeight, 8);
    this.ctxUI.fill();
    this.ctxUI.restore();
    this.ctxUI.fillStyle = '#3e2723';
    this.ctxUI.font = `bold 12px ${UI_THEME.fontFamily}`;
    this.ctxUI.textAlign = 'center';
    this.ctxUI.fillText(`Upgrade (2000$)`, x + config.width / 2, btnY + 17);
  }
  // ==========================================================================
  /*
  drawOrderPopUp() {
    this.ctxUI.clearRect(1000, 20, 500, 1000)
    this.ctxUI.save();

    // --- Allgemeine Variabeln ---
    const activeOrders = Orders.getActiveOrders();
    const titleHeight = 50; // Höhe für die Überschrift
    const paddingBetweenOrders = 10; // Padding zwischen den Aufträgen
    const orderBoxBaseHeight = 40; // Höhe für die Auftragsboxen
    const orderItemLineHeight = 15; // Line height für die Auftragsboxen

    let totalOrdersHeight = 0;
    for (const order of activeOrders) {
      totalOrdersHeight += orderBoxBaseHeight + (order.items.length * orderItemLineHeight) + paddingBetweenOrders;
    }

    const popupConfig = {
      width: 200,
      height: titleHeight + totalOrdersHeight + 20, // Mit extra Padding unten
      radius: 20,
      borderWidth: 5,
      lineHeight: 10,
      xOffset: 0,
      yOffset: 0,
    };

    const x = 1000 + popupConfig.xOffset;
    const y = 20 * Math.cos(this._angle) + popupConfig.yOffset;
    const centerX = x + popupConfig.width / 2;

    // --- Zeichne PopUp ---
    this._drawPopupBackground(x, y, popupConfig);

    let currentY = y + popupConfig.lineHeight + 20; // Nach dem Rand starten
    this.ctxUI.textAlign = 'center';
    this.ctxUI.fillStyle = 'black';

    this.ctxUI.font = 'bold 20px Arial';
    this.ctxUI.fillText("Aufgaben", centerX, currentY)
    currentY += popupConfig.lineHeight + 10;

    for (const order of activeOrders) {
      currentY = this._drawOrderBox(x, currentY, order);
      currentY += paddingBetweenOrders;
    }

    this.ctxUI.restore();
  }

  private _drawOrderBox(x: number, y: number, order: any): number {
    let currentY = y;
    const itemLineHeight = 15;
    const baseBoxHeight = 40;
    const dynamicBoxHeight = baseBoxHeight + (order.items.length * itemLineHeight);

    const config = {
      width: 150,
      height: dynamicBoxHeight,
      radius: 20,
      borderWidth: 5,
      xOffset: 25,
    }

    x += config.xOffset;

    this._drawPopupBackground(x, currentY, config);

    this.ctxUI.textAlign = 'start';
    this.ctxUI.fillStyle = 'black';

    // Order ID
    this.ctxUI.font = 'italic 12px Arial';
    this.ctxUI.fillText(`Order ID: ${order.id}`, x + 15, currentY);
    currentY += 20;

    // Items
    this.ctxUI.font = '12px Arial';
    for (const item of order.items) {
      this.ctxUI.fillText(`${item.product.name}: ${item.quantity}x`, x + 20, currentY);
      currentY += itemLineHeight;
    }

    // Reward
    this.ctxUI.font = 'bold 14px Arial';
    this.ctxUI.fillText(`Reward: ${order.reward}$`, x + 20, currentY + 5);
    currentY += 25;

    return currentY;
  }
  */
}
