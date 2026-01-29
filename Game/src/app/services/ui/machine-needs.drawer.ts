import { Machine } from '../../models/machine/machine';
import { Player } from '../../models/player/player';
import { Gamefield } from '../../models/gamefield/gamefield';
import { Rect } from './rect.interface';
import { RenderingService } from '../rendering.service';
import { UI_THEME } from './theme.manager';
import { PrepMachine } from '../../models/preProcess/prep-machine';
import { Product } from '../../models/product/product';

export class MachineNeedsDrawer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private images: { [key:string]: HTMLImageElement }
  ) {}

  public draw(machines: Machine[], offsetCamera: [number, number], fov: number, players: Player[] | null) : Rect[]{
    const drawnRects: Rect[] = [];
    const isometricAngle = RenderingService.instance().angle;
    const ifmOrange = UI_THEME.secondary;
    const size = Gamefield.fieldsize * fov / 2;

    for (const machine of machines) {
      if (machine instanceof PrepMachine || !machine.outputProduct) {
        continue; // Skip PrepMachines and others without a defined output for this combined view.
      }

      const neededRequirements = machine.inputRequirements.map(req => {
        const invItem = machine.inventory.find(item => item.product.id === req.product.id);
        const needed = req.quantity - (invItem?.quantity || 0);
        return { product: req.product, quantity: needed };
      }).filter(req => req.quantity > 0);

      const outputProduct = machine.outputProduct;
      if (neededRequirements.length === 0) {
        // Even if there are no needs, we might want to show the output. For now, we only show if there's an interaction.
        // continue; // This would hide popups for machines that are just producing. Let's show it.
      }

      const fovScale = fov / RenderingService.instance().gameFov;
      const boxHeight = 32 * fovScale;
      const itemSize = 24 * fovScale;
      const padding = 4 * fovScale;
      const arrowWidth = 20 * fovScale;

      const inputsWidth = neededRequirements.length * (itemSize + padding);
      const outputWidth = outputProduct ? (itemSize + padding) : 0;
      const separatorWidth = (neededRequirements.length > 0 && outputProduct) ? arrowWidth : 0;
      const totalWidth = inputsWidth + separatorWidth + outputWidth + padding * 2;
      const halfSize = Gamefield.fieldsize * fov / 2;

      const machineCenterX = fov * machine.position.x + halfSize + offsetCamera[0];
      const x = machineCenterX - totalWidth / 2;
      const y = fov * machine.position.y * Math.cos(isometricAngle) - boxHeight * 1.5 - halfSize/2 + offsetCamera[1] * Math.cos(isometricAngle) + RenderingService.instance().rotationZ;

      // --- Arrow logic for off-screen machines ---
      const playerCarryingItem = players?.find(p => p.inventory instanceof Product && neededRequirements.some(req => req.product.id === (p.inventory as Product).id));
      const isOutOfBounds = x + totalWidth < 0 || x > window.innerWidth || y + boxHeight < 0 || y > window.innerHeight;
      const neededItems = neededRequirements.map(req => req.product);

      for (let i = 0; i < neededItems.length; i++) {
        const item = neededItems[i];
        const size = Gamefield.fieldsize * fov;
        const offset = size / 2;
        const gap = 8 * fov / RenderingService.instance().gameFov;

        let x = neededItems.indexOf(item) == 0
          ? fov * machine.position.x + offset + offsetCamera[0]
          : fov * machine.position.x + ((size + gap) * (neededItems.indexOf(item) % 2 === 0 ? -1 : 1)) + offset + offsetCamera[0];



        if(neededItems.length % 2 === 0)
          x -= size / 2 + gap/2;
        let y = fov * machine.position.y * Math.cos(isometricAngle) - size * 1.5 + offsetCamera[1] * Math.cos(isometricAngle) + RenderingService.instance().rotationZ;
        // Zeichne ein Pfeil wenn die Maschiene außerhalb den Sichtbereiches ist
        for (let i = 0; i < players?.length!; i++) {
          const playerInventory = players![i].inventory;
          if(playerInventory instanceof Product && playerInventory.id === item.id) {
            const isOutOfBounds = x < -size || x > window.innerWidth - size || y <-size || y > window.innerHeight - size;
            if(isOutOfBounds) {
              let arrowY = this.clamp(y, 0, window.innerHeight - size);
            let arrowX = this.clamp(x, 0, window.innerWidth - size);
            let newY = this.clamp(y, size, window.innerHeight - 2*size);
            let newX = this.clamp(x, size, window.innerWidth - 2*size);
            this.ctx.save();
            this.ctx.translate(arrowX + size / 2, arrowY + size / 2);
            const camera = RenderingService.instance().camera;
            const hypotenuse = size*3/4;
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
            newY = -Math.sin(angle) * hypotenuse + arrowY;
            newX = -Math.cos(angle) * hypotenuse + arrowX;
            this.ctx.rotate(angle);
            this.ctx.drawImage(this.images["/images/arrow.png"], -size / 2, -size / 2, size, size);
            drawnRects.push({x: arrowX , y: arrowY, width: size * fov, height: size * fov, radius: 0});
                          
            this.ctx.restore();
            this.ctx.drawImage(this.images[playerInventory.img!], newX + size / 3, newY + size / 3, size / 3, size / 3);


          }
        }
      }
    }

      // --- On-screen popup drawing ---
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, totalWidth, boxHeight, 8 * fovScale);
      this.ctx.fill();
      drawnRects.push({ x, y, width: totalWidth, height: boxHeight, radius: 8 * fovScale });

      let currentX = x + padding;
      

      // Draw input items
      for (const req of neededRequirements) {
        const img = this.images[req.product._img!];
        if (img) {
          this.ctx.drawImage(img, currentX, y + padding, itemSize, itemSize);
        }

        if (req.quantity > 0) {
          const radius = 8 * fovScale;
          const quantityX = currentX + itemSize - radius;
          const quantityY = y + itemSize;
          this.ctx.fillStyle = ifmOrange;
          this.ctx.beginPath();
          this.ctx.arc(quantityX, quantityY, radius, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.fillStyle = 'white';
          this.ctx.textAlign = 'center';
          this.ctx.font = `bold ${11 * fovScale}px ${UI_THEME.fontFamily}`;
          this.ctx.fillText(`${req.quantity}`, quantityX, quantityY + 4 * fovScale);
        }
        currentX += itemSize + padding;
      }

      // Draw arrow separator
      if (neededRequirements.length > 0 && outputProduct) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${18 * fovScale}px ${UI_THEME.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('→', currentX + arrowWidth / 2, y + boxHeight / 2);
        currentX += arrowWidth;
      }

      // Draw output product
      if (outputProduct) {
        const img = this.images[outputProduct._img!];
        if (img) {
          this.ctx.drawImage(img, currentX, y + padding, itemSize, itemSize);
        }
        this.ctx.strokeStyle = ifmOrange;
        this.ctx.lineWidth = 2 * fovScale;
        this.ctx.beginPath();
        this.ctx.roundRect(currentX - 1, y + padding - 1, itemSize + 2, itemSize + 2, 5 * fovScale);
        this.ctx.stroke();
      }

      this.ctx.restore();
    
  }
    return drawnRects;
  
  }
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
