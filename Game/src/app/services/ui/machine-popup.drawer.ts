import { Machine } from '../../models/machine/machine';
import { Gamefield } from '../../models/gamefield/gamefield';
import { Rect } from './rect.interface';
import { CanvasHelper } from './canvas.helper';
import { UI_THEME } from './theme.manager';
import { RenderingService } from '../rendering.service';
import { PrepMachine } from '../../models/preProcess/prep-machine';
import { Camera } from '../../models/camera/camera';
import { Product } from '../../models/product/product';
import { Package } from '../../models/package/package';
import { Coordinates } from '../../models/coordinates/coordinates';
import { Player } from '../../models/player/player';
import { PlayerService } from '../player.service';
import { GameService } from '../game.service';

/**
 * Handles drawing all UI elements related to machines,
 * including detail popups, needed items, and production progress.
 */
export class MachinePopupDrawer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private images: { [key: string]: HTMLImageElement },
  ) {}

  /**
   * Draws the main details popup for a single machine.
   * @param machine The machine to display.
   * @returns An array of Rects for later clearing.
   */
  public drawDetails(machine: Machine, player: Player, playerService: PlayerService): Rect[] {
    //console.log('drawDetails called for machine:', machine.name, 'isPrepMachine:', machine instanceof PrepMachine);
    this.ctx.save();

    // Check ob es sich um eine PrepMachine handelt
    const isPrepMachine = machine instanceof PrepMachine;
    const requiredItemsCount = isPrepMachine ? 0 : machine.inputRequirements.length;
    const lineHeight = 23;
    const baseLines = 7; // Estimated lines for static content
    const reqLines = requiredItemsCount > 0 ? requiredItemsCount + 1 : 1;
    const totalHeight = 50 + (baseLines + reqLines) * lineHeight;

    const popupConfig = {
      width: 200,
      height: totalHeight,
      radius: 12,
      borderWidth: 6,
      lineHeight: lineHeight - 3,
    };

    const xPlayer1 = window.innerWidth * 0.02
    const xPlayer2 = window.innerWidth * 0.98 - popupConfig.width;
    const x = player.id === 0 ? xPlayer1 : xPlayer2;
    const y = window.innerHeight * 0.95 - totalHeight;

    CanvasHelper.drawStyledPopupBackground(this.ctx, x, y, popupConfig, isPrepMachine ? true : machine.unlocked);

    let currentY = y + popupConfig.borderWidth + 30;
    const centerX = x + popupConfig.width / 2;
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = UI_THEME.textColor;

    currentY = this.drawInfoText(centerX, currentY, machine, popupConfig.lineHeight);
    CanvasHelper.drawSeparator(this.ctx, centerX, currentY - 10, popupConfig.width * 0.85);
    currentY += 15;

    // if (isPrepMachine) {
    //   const prepMachine = machine as PrepMachine;
    //   // Zeigt nur die Animationsframes an, wenn die PrepMachine aktiv ist
    //   if (prepMachine.isProcessingActive()) {
    //     console.log('PrepMachine popup - prepNextFrame:', prepMachine.prepNextFrame);
    //     if (prepMachine.prepNextFrame) {
    //       const img = this.images[prepMachine.prepNextFrame];
    //       console.log('Image loaded:', !!img, 'Path:', prepMachine.prepNextFrame);
    //       if (img) {
    //         this.ctx.drawImage(img, centerX - 40, currentY + 5, 80, 80);
    //         console.log('Drew animation frame at:', centerX - 40, currentY + 5);
    //         currentY += 90;
    //       }
    //     }
    //   }
    // }

    if (!isPrepMachine) {
      currentY = this.drawRequirements(centerX, currentY, machine, popupConfig.lineHeight);
    }

    this.drawProgressBar(x, currentY, machine, popupConfig);

    if (!isPrepMachine) {
      const canUpgrade = machine.canUpgrade(playerService);
      this.drawUpgradeButton(x, currentY + 20, machine, popupConfig, canUpgrade);
    }

    const key = GameService.gamePad ? 'Y' : 'U';
    CanvasHelper.drawKey(this.ctx, key, popupConfig.width/2 + x - 15, currentY + 55, 30, 30)

    this.ctx.restore();

    const mainRect: Rect = { x: x - 10, y: y - 10, width: popupConfig.width + 20, height: popupConfig.height + 20, radius: popupConfig.radius};
    const buttonRect: Rect = { x: popupConfig.width + x - 25, y: popupConfig.height + y - 25, width: 40, height: 40, radius: 0};

    return [mainRect, buttonRect];
  }


  /**
   * Draws a circular progress indicator for machines that are currently producing.
   * @param machines An array of all machines.
   * @param offsetCamera
   * @param fov
   * @returns An array of Rects for later clearing.
   */
  public drawProductionProgress(machines: Machine[], offsetCamera: [number, number], fov: number): Rect[] {
    const drawnRects: Rect[] = [];
    const isometricAngle = RenderingService.instance().angle;

    for (const machine of machines) {
      if (machine.isProducing) {
        const percent = 1 - (machine.productionTimer * 1000 / machine.productionRate);
        const size = Gamefield.fieldsize * 0.75 * fov / 2.5;
        const offset = (Gamefield.fieldsize - size) / 2 * fov;
        const ringWidth = 8 * fov / 2.5;
        const radius = size / 2;
        const centerX = machine.position.x * fov + offset + radius * fov + offsetCamera[0];
        const centerY = machine.position.y * Math.cos(isometricAngle) * fov + offsetCamera[1] * Math.cos(isometricAngle) - size * 2.5 + radius + RenderingService.instance().rotationZ;
        const fontSize = 16 * fov / 2.5;

        this.ctx.save();
        this.ctx.lineWidth = ringWidth;
        this.ctx.lineCap = 'round';

        // Background Ring
        this.ctx.strokeStyle = UI_THEME.tertiary;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius - ringWidth / 2, 0, 2 * Math.PI);
        this.ctx.stroke();

        // Progress Ring
        this.ctx.strokeStyle = UI_THEME.progressFill;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius - ringWidth / 2, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * percent);
        this.ctx.stroke();

        // Timer Text
        this.ctx.fillStyle = UI_THEME.progressFill;
        this.ctx.textAlign = 'center';
        this.ctx.font = `bold ${fontSize}px ${UI_THEME.fontFamily}`;
        this.ctx.fillText(`${Math.floor(machine.productionTimer) + 1}`, centerX, centerY + 6 * fov / 2.5);
        this.ctx.restore();

        drawnRects.push({ x: centerX - radius, y: centerY - radius, width: size, height: size, radius: 100 });
      }
    }
    return drawnRects;
  }

  // --- Private Helper Methods for drawing specific parts of the detail popup ---

  private drawInfoText(x: number, y: number, machine: Machine, lineHeight: number): number {
    let currentY = y;
    const isPrepMachine = machine instanceof PrepMachine;

    //console.log('drawInfoText - machine name:', machine.name, 'isPrepMachine:', isPrepMachine);

    this.ctx.font = `bold 16px ${UI_THEME.fontFamily}`;
    this.ctx.fillText(machine.name, x, currentY);
    currentY += lineHeight;

    this.ctx.font = `12px ${UI_THEME.fontFamily}`;
    this.ctx.fillStyle = '#6d4c41';

    if (isPrepMachine) {
      this.ctx.fillText(`PrepMachine`, x, currentY - 5);
    } else {
      this.ctx.fillText(`Level ${machine.level}`, x, currentY - 5);
    }

    this.ctx.fillStyle = UI_THEME.textColor;
    currentY += lineHeight - 5;

    //Für PrepMachine speziellen Text
    if (isPrepMachine) {
      this.ctx.font = `italic 14px ${UI_THEME.fontFamily}`;
      this.ctx.fillText("Manuelle Verarbeitung", x, currentY);
      currentY += lineHeight;

      this.ctx.font = `14px ${UI_THEME.fontFamily}`;
      this.ctx.fillText("Drückt 'E' zum Arbeiten", x, currentY);
      currentY += lineHeight;
    } else {
      const img = this.images[machine.outputProduct._img!];
      if (img) {
        this.ctx.drawImage(img, x - 70, currentY - 15, 20, 20);
      }

      this.ctx.font = `italic 14px ${UI_THEME.fontFamily}`;
      this.ctx.fillText(machine.outputProduct.name, x, currentY);
      currentY += lineHeight;

      this.ctx.font = `14px ${UI_THEME.fontFamily}`;
      const productionTime = machine.productionRate / 1000;
      this.ctx.fillText(`Duration: ${productionTime.toFixed(2)}s`, x, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  private drawRequirements(x: number, y: number, machine: Machine, lineHeight: number): number {
    let currentY = y;
    this.ctx.font = `bold 14px ${UI_THEME.fontFamily}`;
    this.ctx.fillText('Requirements:', x, currentY);
    currentY += lineHeight;
    this.ctx.font = `13px ${UI_THEME.fontFamily}`;

    if (machine.inputRequirements.length === 0) {
      this.ctx.fillStyle = '#8d6e63';
      this.ctx.fillText('- Nothing -', x, currentY);
      this.ctx.fillStyle = UI_THEME.textColor;
      currentY += lineHeight;
    } else {
      for (const req of machine.inputRequirements) {
        let product = req.product;
        let quantity = req.quantity;

        const img = this.images[product._img!];

        if (img) {
          this.ctx.drawImage(img, x - 70, currentY - 15, 20, 20);
        }
        this.ctx.fillText(`${quantity}x ${product.name}`, x, currentY);
        currentY += lineHeight;
      }
    }
    return currentY;
  }

  private drawProgressBar(x: number, y: number, machine: Machine, config: any): void {
    const barWidth = config.width * 0.8;
    const barHeight = 12;
    const barX = x + (config.width - barWidth) / 2;

    let progressValue = 0;
    let isActive = false;

    // Check ob es sich um eine PrepMachine handelt
    if (machine instanceof PrepMachine) {
      const prepMachine = machine as PrepMachine;
      progressValue = prepMachine.getProgress();
      isActive = prepMachine.isProcessingActive();
    } else {
      // Für normale Maschinen
      const progressPercentage = (1 - (machine.productionTimer * 1000 / machine.productionRate));
      progressValue = Math.max(0, Math.min(1, progressPercentage));
      isActive = machine.isProducing;
    }

    this.ctx.fillStyle = UI_THEME.progressBg;
    this.ctx.beginPath();
    this.ctx.roundRect(barX, y, barWidth, barHeight, 6);
    this.ctx.fill();

    if (isActive && progressValue > 0) {
      this.ctx.fillStyle = UI_THEME.progressFill;
      this.ctx.beginPath();
      this.ctx.roundRect(barX, y, barWidth * progressValue, barHeight, 6);
      this.ctx.fill();
    }
    this.ctx.strokeStyle = UI_THEME.progressBorder;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(barX, y, barWidth, barHeight, 6);
    this.ctx.stroke();
  }

  private drawUpgradeButton(x: number, y: number, machine: Machine, config: any, canUpgrade: boolean) {
    if (!machine.upgradable) return;

    const btnWidth = config.width * 0.7;
    const btnHeight = 30;
    const btnX = x + (config.width - btnWidth) / 2;

    this.ctx.save();
    this.ctx.fillStyle = canUpgrade ? '#7ebb39' : UI_THEME.tertiary;
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, y, btnWidth, btnHeight, 15);
    this.ctx.fill();

    this.ctx.fillStyle = canUpgrade ? 'white' : UI_THEME.secondary;
    this.ctx.font = `bold 14px ${UI_THEME.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Upgrade (${machine.getUpgradeCost()}$)`, x + config.width / 2, y + 20);
    this.ctx.restore();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
