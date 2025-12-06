import { Injectable } from '@angular/core';
import { Machine } from '../models/machine/machine';
import { Player } from '../models/player/player';
import { InteractableManager } from '../models/interactableObject/interactable-manager';
import { Orders } from '../models/orders/orders';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}


@Injectable({
  providedIn: 'root'
})
export class UIService {
  private ctxUI!: CanvasRenderingContext2D;
  private _angle!: number;
  private lastMachinePopupRect: Rect | null = null; // Für das Löschen des Popups

  constructor() { }

  async init(ctxUI: CanvasRenderingContext2D, angle: number) {
    this.ctxUI = ctxUI;
    this._angle = angle;
  }

  drawMachinePopUp(machine: Machine) {
    this.ctxUI.save();

    // --- Allgemeine Variabeln ---
    const popupConfig = {
      width: 150,
      height: 125,
      radius: 20,
      borderWidth: 5,
      lineHeight: 20,
      yOffset: -200,
      xOffset: -50
    };
    const center = popupConfig.width / 2;
    const x = machine.x + popupConfig.xOffset;
    const y = machine.y * Math.cos(this._angle) + popupConfig.yOffset;

    // Speichere die Bounding Box, um sie später zu löschen
    this.lastMachinePopupRect = { x: x - 5, y: y - 5, width: popupConfig.width + 10, height: popupConfig.height + 10 };

    // --- Zeichne PopUp ---
    this._drawPopupBackground(x, y, popupConfig, machine.upgradable);

    let currentY = y + popupConfig.lineHeight + 10;
    this.ctxUI.textAlign = 'center';
    this.ctxUI.fillStyle = 'black';

    currentY = this._drawInfoText(x + center, currentY, machine, popupConfig.lineHeight);
    currentY = this._drawProgressBar(x, currentY, machine, popupConfig);
    this._drawUpgradeButton(x, currentY, machine, popupConfig);


    this.ctxUI.restore();
  }

  private _drawPopupBackground(x: number, y: number, config: any, upgradable?: boolean) {
    let borderColor: string;
    switch (upgradable) {
      case true:
        borderColor = 'green';
        break;
      case false:
        borderColor = 'red';
        break;
      default:
        borderColor = '#ff6f00'
    }

    // Zeichne Rand
    this.ctxUI.fillStyle = borderColor;
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(x, y, config.width, config.height, config.radius);
    this.ctxUI.fill();

    // Zeichen inneren Hintergrund
    this.ctxUI.fillStyle = '#fff';
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(
      x + config.borderWidth,
      y + config.borderWidth,
      config.width - (2 * config.borderWidth),
      config.height - (2 * config.borderWidth),
      config.radius - config.borderWidth
    );
    this.ctxUI.fill();
  }

  private _drawInfoText(x: number, y: number, machine: Machine, lineHeight: number): number {
    let currentY = y;

    this.ctxUI.font = 'bold 16px Arial';
    this.ctxUI.fillText(`Level: ${machine.level}`, x, currentY);
    currentY += lineHeight;

    this.ctxUI.font = 'italic 16px Arial';
    this.ctxUI.fillText(`${machine.name}`, x, currentY);
    currentY += lineHeight;

    this.ctxUI.font = '16px Arial';
    this.ctxUI.fillText(`Zeit: ${machine.productionRate}`, x, currentY);
    currentY += lineHeight;

    return currentY;
  }

  private _drawProgressBar(x: number, y: number, machine: Machine, config: any): number {
    let currentY = y;
    const center = config.width / 2;

    const progressPercentage = (1 - (machine.productionTimer * 1000 / machine.productionRate)) * 100;
    const progressValue = Math.max(0, Math.min(100, progressPercentage)); // Clamp between 0 and 100

    const progressBarConfig = {
      width: 100,
      height: 15,
      bgColor: '#e0e0e0',
      fillColor: '#4CAF50',
      borderColor: '#a0a0a0'
    };

    const progressBarX = x + (config.width - progressBarConfig.width) / 2;
    const progressBarY = currentY - (config.lineHeight / 2) - 2;

    // Zeichne Hintergrund vom Fortschrittsbalken
    this.ctxUI.fillStyle = progressBarConfig.bgColor;
    this.ctxUI.fillRect(progressBarX, progressBarY, progressBarConfig.width, progressBarConfig.height);

    // Zeichne gefüllten Teil
    const filledWidth = (progressBarConfig.width * progressValue) / 100;
    this.ctxUI.fillStyle = progressBarConfig.fillColor;
    this.ctxUI.fillRect(progressBarX, progressBarY, filledWidth, progressBarConfig.height);

    // Zeichne Fortschrittsbalken Rand
    this.ctxUI.strokeStyle = progressBarConfig.borderColor;
    this.ctxUI.lineWidth = 1;
    this.ctxUI.strokeRect(progressBarX, progressBarY, progressBarConfig.width, progressBarConfig.height);

    // Zeichne Fortschritts Text
    this.ctxUI.fillStyle = 'black';
    this.ctxUI.font = '12px Arial';
    this.ctxUI.fillText(`${Math.round(progressValue)}%`, x + center, currentY);
    currentY += config.lineHeight;

    return currentY;
  }

  private _drawUpgradeButton(x: number, y: number, machine: Machine, config: any) {
    // TODO: Upgrade Kosten von Machinen Klasse
    const upgradeCost = 2000;
    const center = config.width / 2;

    const buttonConfig = {
      width: 80,
      height: config.lineHeight,
      yOffset: -15,
      bgColor: 'green',
      textColor: 'black'
    };

    const buttonX = x + (config.width - buttonConfig.width) / 2;
    const buttonY = y + buttonConfig.yOffset;

    this.ctxUI.fillStyle = buttonConfig.bgColor;
    this.ctxUI.beginPath();
    this.ctxUI.roundRect(buttonX, buttonY, buttonConfig.width, buttonConfig.height, config.radius);
    this.ctxUI.fill();

    this.ctxUI.fillStyle = buttonConfig.textColor;
    this.ctxUI.font = '12px Arial';
    this.ctxUI.fillText(`${upgradeCost}`, x + center, y);
  }


  clearMachinePopUp() {
    if (this.lastMachinePopupRect) {
      const rect = this.lastMachinePopupRect;
      this.ctxUI.clearRect(rect.x, rect.y, rect.width, rect.height);
      this.lastMachinePopupRect = null; // Setze es zurück, nachdem es gelöscht wurde
    }
  }

  debugProduct(player: Player) {
    this.ctxUI.clearRect(0, 0, 200, 400)
    this.ctxUI.fillStyle = 'black';
    this.ctxUI.font = '20px Arial';
    this.ctxUI.textAlign = 'start';
    this.ctxUI.fillText(`${player.inventory?.name}`, 20, 20);
  }

  updateIndicator(machineManager: InteractableManager) {
    for (const machine of machineManager.getMachines()) {
      if (machine.upgradable) {
        this.ctxUI.save();
        const indicatorConfig = {
          width: 10,
          height: 50,
          xOffset: 20,
          yOffset: -100,
        };

        const x = machine.x + indicatorConfig.xOffset;
        const y = machine.y * Math.cos(this._angle) + indicatorConfig.yOffset;
        this.ctxUI.fillStyle = 'green';
        this.ctxUI.fillRect(x, y, indicatorConfig.width, indicatorConfig.height);

        this.ctxUI.restore();
      }
    }
  }

  drawOrderPopUp(orders: Orders) {
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

}

