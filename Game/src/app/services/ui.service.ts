import { Injectable } from '@angular/core';
import { Machine } from '../models/machine/machine';
import { Player } from '../models/player/player';

@Injectable({
  providedIn: 'root'
})
export class UIService {
  private ctxUI!: CanvasRenderingContext2D;
  private _angle!: number;

  constructor() { }

  async init(ctxUI: CanvasRenderingContext2D, angle: number) {

    this.ctxUI = ctxUI;
    this._angle = angle;

  }

  drawMachinePopUp(
    // x: number,
    // y: number,
    // name: string,
    // level: number,
    // productionTime: string,
    // machine.productionTimer: string,
    // upgradecost: number,
    // upgradable: boolean
    machine: Machine

  ) {

    const popupWidth = 150;
    const popupHeight = 125;

    // Variabeln zur Position der einzelnen Elementen
    const center = 75;
    const lineHeight = 20;
    const radius = 20;

    // Position des Popups (muss noch richtig berechnet werden)
    const x = machine.x - 50;
    console.log(this._angle)
    const y = machine.y * Math.cos(this._angle) - 200;

    // Test Variabeln: Müssen noch in machine.ts hinzugefügt werden
    // const productionProgress = machine.productionTimer;
    const upgradecost = 2000;

    // Draw popup background
    this.ctxUI.beginPath()
    this.ctxUI.fillStyle = '#fff';
    this.ctxUI.roundRect(x, y, popupWidth, popupHeight, radius);
    this.ctxUI.stroke()
    this.ctxUI.fill()


    // Draw border
    if (machine.upgradable) {
      this.ctxUI.strokeStyle = 'green';
    }
    else {
      this.ctxUI.strokeStyle = 'red'
    }
    this.ctxUI.lineWidth = 5;

    this.ctxUI.roundRect(x, y, popupWidth, popupHeight, radius);
    this.ctxUI.stroke()


    this.ctxUI.fillStyle = 'black';
    this.ctxUI.textAlign = 'center';

    let currentY = y + lineHeight + 10;

    this.ctxUI.font = 'bold 16px Arial';
    this.ctxUI.fillText(`Level: ${machine.level}`, x + center, currentY);

    currentY += lineHeight;

    this.ctxUI.font = 'italic 16px Arial';
    this.ctxUI.fillText(`${machine.name}`, x + center, currentY);

    currentY += lineHeight;

    this.ctxUI.font = '16px Arial';
    this.ctxUI.fillText(`Zeit: ${machine.productionRate}`, x + center, currentY);

    currentY += lineHeight;

    // Calculate progress percentage
    const progressPercentage = (1 - (machine.productionTimer * 1000 / machine.productionRate)) * 100;
    const progressValue = progressPercentage;

    const progressBarWidth = 100;
    const progressBarHeight = 15;
    const progressBarX = x + (popupWidth - progressBarWidth) / 2;
    const progressBarY = currentY - (lineHeight / 2) - 2; // Adjust position to center it a bit better

    // Draw progress bar background
    this.ctxUI.fillStyle = '#e0e0e0'; // Light gray background
    this.ctxUI.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

    // Draw filled part of the progress bar
    this.ctxUI.fillStyle = '#4CAF50'; // Green progress
    const filledWidth = (progressBarWidth * progressValue) / 100;
    this.ctxUI.fillRect(progressBarX, progressBarY, filledWidth, progressBarHeight);

    // Draw progress bar border
    this.ctxUI.strokeStyle = '#a0a0a0';
    this.ctxUI.lineWidth = 1;
    this.ctxUI.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

    // Draw the progress text on top of the bar
    this.ctxUI.fillStyle = 'black';
    this.ctxUI.font = '12px Arial';
    this.ctxUI.fillText(`${Math.round(progressValue)}%`, x + center, currentY);

    currentY += lineHeight;
    this.ctxUI.beginPath()

    this.ctxUI.fillStyle = 'green'
    this.ctxUI.roundRect(x + (popupWidth - 80) / 2, currentY - 15, 80, lineHeight, radius);
    this.ctxUI.stroke()
    this.ctxUI.fill()
    this.ctxUI.fillStyle = 'black'
    this.ctxUI.fillText(`${upgradecost}`, x + center, currentY)
  }

  clearMachinePopUp() {
    this.ctxUI.clearRect(0, 0, this.ctxUI.canvas.width, this.ctxUI.canvas.height)
  }

  debugProduct(player: Player) {
    this.ctxUI.clearRect(0, 0, 200, 400)
    this.ctxUI.fillStyle = 'black';
    this.ctxUI.font = '20px Arial';
    this.ctxUI.textAlign = 'start';
    this.ctxUI.fillText(`${player.inventory?.name}`, 20, 20)
  }
}
