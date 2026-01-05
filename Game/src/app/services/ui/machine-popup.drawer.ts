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
  public drawDetails(machine: Machine): Rect[] {
    this.ctx.save();

    // Check if it's a PrepMachine and handle differently
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

    const x = window.innerWidth * 0.98 - popupConfig.width;
    const y = 100;

    CanvasHelper.drawStyledPopupBackground(this.ctx, x, y, popupConfig, isPrepMachine ? true : machine.unlocked);

    let currentY = y + popupConfig.borderWidth + 30;
    const centerX = x + popupConfig.width / 2;
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = UI_THEME.textColor;

    currentY = this.drawInfoText(centerX, currentY, machine, popupConfig.lineHeight);
    CanvasHelper.drawSeparator(this.ctx, centerX, currentY - 10, popupConfig.width * 0.85);
    currentY += 15;
    
    if (!isPrepMachine) {
      currentY = this.drawRequirements(centerX, currentY, machine, popupConfig.lineHeight);
    }
    
    this.drawProgressBar(x, currentY, machine, popupConfig);
    
    if (isPrepMachine) {
      const prepMachine = machine as PrepMachine;
      if (prepMachine.prepNextFrame) {
        const img = this.images[prepMachine.prepNextFrame];
        if (img) {
          this.ctx.drawImage(img, centerX - 32, currentY - 70, 64, 64);
        }
      }
    }
    
    if (!isPrepMachine) {
      this.drawUpgradeButton(x, currentY + 15, machine, popupConfig);
    }

    const fKeyImage = this.images['/images/KeyBindings/keyBindings_F.png'];
    if (fKeyImage) {
        this.ctx.drawImage(fKeyImage, popupConfig.width + x - 25, popupConfig.height + y - 25, 40, 40);
    }

    this.ctx.restore();

    const mainRect: Rect = { x: x - 10, y: y - 10, width: popupConfig.width + 20, height: popupConfig.height + 20, radius: popupConfig.radius };
    const buttonRect: Rect = { x: popupConfig.width + x - 25, y: popupConfig.height + y - 25, width: 40, height: 40, radius: 0 };

    return [mainRect, buttonRect];
  }

  /**
   * Draws indicators for items that are required by machines but not yet inserted.
   * @param machines An array of all machines on the field.
   * @param offsetCamera
   * @param fov
   * @returns An array of Rects for later clearing.
   */
  public drawNeeds(machines: Machine[], offsetCamera: [number, number], fov: number, playerInventory: Product | null | Package): Rect[] {
    const drawnRects: Rect[] = [];
    const isometricAngle = RenderingService.instance().angle;
    // console.log(offsetCamera)

    for (const machine of machines) {
      const neededRequirements = machine.inputRequirements.filter(req => !machine.inventory.some(invItem => invItem.product.id === req.product.id && invItem.quantity >= req.quantity));
      const itemsAlreadyInserted = machine.inventory.map(invItem => invItem.product.id);

      // update the neededItems quantity
      neededRequirements.forEach(req => {
        if(itemsAlreadyInserted.includes(req.product.id)) {
          req.quantity -= machine.inventory.find(invItem => invItem.product.id === req.product.id)?.quantity ?? 0;
        }
      })

      const neededItems = neededRequirements.map(req => req.product);

      for (let i = 0; i < neededItems.length; i++) {
        const item = neededItems[i];
        const size = Gamefield.fieldsize * fov / 2;
        const offset = size / 2;
        const gap = 8 * fov / RenderingService.instance().gameFov;

        let x = neededItems.indexOf(item) == 0
          ? fov * machine.position.x + offset + offsetCamera[0]
          : fov * machine.position.x + ((size + gap) * (neededItems.indexOf(item) % 2 === 0 ? -1 : 1)) + offset + offsetCamera[0];

        

        if(neededItems.length % 2 === 0)
          x -= size / 2 + gap/2;
        let y = fov * machine.position.y * Math.cos(isometricAngle) - size * 1.5 + offsetCamera[1] * Math.cos(isometricAngle) + RenderingService.instance().rotationZ;
        // Zeichne ein Pfeil wenn die Maschiene außerhalb den Sichtbereiches ist
        if(playerInventory instanceof Product && playerInventory.id === item.id) {
          const isOutOfBounds = x < 0 || x > window.innerWidth - size || y < 0 || y > window.innerHeight - size;
          
          if(isOutOfBounds) {
            let arrowY = this.clamp(y, 0, window.innerHeight - size);
            let arrowX = this.clamp(x, 0, window.innerWidth - size);
            let newY = this.clamp(y, size / 2, window.innerHeight - 2*size);
            let newX = this.clamp(x, size, window.innerWidth - 2*size);
            this.ctx.save();
            this.ctx.translate(arrowX + size / 2, arrowY + size / 2);
            const camera = RenderingService.instance().camera;
            const hypotenuse = 80;
            let angle: number;
            
            if(playerInventory.position.x - machine.position.x === 0) {
              angle = Math.PI / 2;
            } else {
              angle = Math.atan((machine.position.y - playerInventory.position.y) / (machine.position.x - playerInventory.position.x));
            }
            
            if(machine.position.x - playerInventory.position.x < 0) {
              angle += Math.PI;
            }
            let a = false;
            if(-angle > Math.PI + 1/10 * Math.PI && -angle < Math.PI - 1/10 * Math.PI) {angle = Math.PI;}
            y = -Math.sin(angle) * hypotenuse + arrowY;
            x = -Math.cos(angle) * hypotenuse + arrowX;
            this.ctx.rotate(angle);
            this.ctx.drawImage(this.images["/images/arrow.png"], -size / 2, -size / 2, size, size);
            drawnRects.push({x: arrowX , y: arrowY, width: size * fov, height: size * fov, radius: 0});

            this.ctx.restore();
          }
        }

        this.ctx.save();
        this.ctx.fillStyle = UI_THEME.tertiary;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, size, size, 10);
        this.ctx.fill();
        drawnRects.push({x, y, width: size, height: size, radius: 10});

        const img = this.images[item._img!];
        const quantity = neededRequirements.find(req => req.product.id === item.id)?.quantity ?? 0;
        if (img) {
          this.ctx.drawImage(img, x + size / 4, y + size / 4, size / 2, size / 2);
        }

        if(quantity > 1) {

          this.ctx.beginPath();
          this.ctx.fillStyle = UI_THEME.primary;
          this.ctx.roundRect(x - 10, y + size - 10, 20, 20, 10);
          this.ctx.fill();
          this.ctx.fillStyle = '#000000';
          this.ctx.textAlign = 'center';
          this.ctx.font = `clamp(12px, min(1dvw, 1dvh), 16px) ${UI_THEME.fontFamily}`;
          this.ctx.fillText(`${quantity}`, x, y + size + 5);
          drawnRects.push({x:x - 10, y:y + size - 10, width: 20, height: 20, radius: 10});
        }

        this.ctx.restore();
      }
    }
    return drawnRects;
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

    // For PrepMachine, show output product name only (no image since outputProduct is private)
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
      this.ctx.fillText(`Dauer: ${productionTime.toFixed(2)}s`, x, currentY);
      currentY += lineHeight;
    }
    
    return currentY;
  }

  private drawRequirements(x: number, y: number, machine: Machine, lineHeight: number): number {
    let currentY = y;
    this.ctx.font = `bold 14px ${UI_THEME.fontFamily}`;
    this.ctx.fillText('Benötigt:', x, currentY);
    currentY += lineHeight;
    this.ctx.font = `13px ${UI_THEME.fontFamily}`;

    if (machine.inputRequirements.length === 0) {
      this.ctx.fillStyle = '#8d6e63';
      this.ctx.fillText('- Nichts -', x, currentY);
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

  private drawUpgradeButton(x: number, y: number, machine: Machine, config: any) {
    if (!machine.upgradable) return;

    const btnWidth = config.width * 0.7;
    const btnHeight = 30;
    const btnX = x + (config.width - btnWidth) / 2;

    this.ctx.save();
    this.ctx.fillStyle = UI_THEME.tertiary;
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, y, btnWidth, btnHeight, 15);
    this.ctx.fill();

    this.ctx.fillStyle = UI_THEME.secondary;
    this.ctx.font = `bold 14px ${UI_THEME.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Upgrade (${machine.getUpgradeCost()}$)`, x + config.width / 2, y + 20);
    this.ctx.restore();

  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
