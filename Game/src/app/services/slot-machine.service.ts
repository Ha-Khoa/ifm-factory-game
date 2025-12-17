import { Injectable } from '@angular/core';
import { RenderingService } from './rendering.service';

export interface SlotIcon {
  img: string;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class SlotMachineService {

  private _ctx!: CanvasRenderingContext2D;

  private _images!: { [key: string]: HTMLImageElement };
  private _slotIcons!: string[];
  private _sizePercentage: number = 20;
  private _startVelocity!: number;
  private _imgSize!: number;
  private _iconEdgeOffset!: number;
  private _spawnStartY!: number;
  private _maxProgress!: number;

  private _slots: SlotIcon[][] = [];

  constructor() { }

    private static _instance: SlotMachineService | null = null;


  static instance(): SlotMachineService {
    if (!this._instance) {
      this._instance = new SlotMachineService();
    }
    return this._instance;
  }

  init(ctx: CanvasRenderingContext2D, images: { [key: string]: HTMLImageElement })
  {
    this._ctx = ctx;
    this._images = images;
    this._slotIcons = ["/images/wall.png"];
    this._startVelocity = 500;
    this._iconEdgeOffset = 30;
    this._imgSize = (this._ctx.canvas.width * (1 - ((this._sizePercentage) / 100))) / 5 - 2 * this._iconEdgeOffset;
    this._spawnStartY = this._ctx.canvas.height * (this._sizePercentage) / 200 - this._imgSize - this._iconEdgeOffset / 2;
    this._maxProgress = this._ctx.canvas.height * (100 - this._sizePercentage) / 100 + this._imgSize + this._iconEdgeOffset ;
    // Lade Slot Icons
    for(let i = 0; i < 5; i++)
    {
      this._slots.push([]);
      for(let j = 0; j < 4; j++)
      {
        this._slots[i].push({img: this._slotIcons[Math.floor(Math.random() * this._slotIcons.length)], progress: j * this._imgSize});
      }
    }
  }

  render()
  {
    this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
    
    for(let i = 0; i < 5; i++)
    {
      if(RenderingService.instance().deltaTime)
      {
      this.drawRow(this._slots[i], i * (this._imgSize + this._iconEdgeOffset * 2) + this._ctx.canvas.width * (this._sizePercentage) / 200 + this._iconEdgeOffset, RenderingService.instance().deltaTime);
      }
    }
    this.drawEdge(this._sizePercentage);
    
  }

  drawRow(Icons: SlotIcon[],xPosition: number, deltaTime: number)
  {
    for(let i = 0; i < 4; i++)
    {
      for(let j = 0; j < 5; j++)
      {
        this._slots[j][i].progress %= this._maxProgress;
      }
    }
    Icons.forEach((icon, index) => {
      this._ctx.drawImage(
        this._images[icon.img],
        xPosition,
        this._spawnStartY + icon.progress + index * this._iconEdgeOffset,
        this._imgSize,
        this._imgSize
      )

      icon.progress += this._startVelocity * (deltaTime / 1000);
      
      
    });
    
  }

  drawEdge(sizePercentage: number)
  {
    const width = this._ctx.canvas.width;
    const height = this._ctx.canvas.height;
    const x1 = width * sizePercentage / 200;
    const y1 = width * 9/16 * sizePercentage / 200;
    const y2 = width * 9/16 * (200 - sizePercentage) / 200;
    const x2 = width * (200 - sizePercentage) / 200;

    this.drawRect([0, 0, x1, x1], [0, height, y2, y1], "#1b1b1bff");
    this.drawRect([0, width, x2, x1], [0, 0, y1, y1], "#3d3d3dff");
    this.drawRect([width, width, x2, x2], [0, height, y2, y1], "#929292ff");
    this.drawRect([0, x1, x2, width], [height, y2, y2, height], "#242424ff");
  }

  drawRect(xPoints: number[], yPoints: number[] ,color: string): void {
    if(xPoints.length !== yPoints.length) return;
    this._ctx.beginPath();
    this._ctx.moveTo(xPoints[0], yPoints[0]);
    for (let i = 1; i < xPoints.length; i++) {
      this._ctx.lineTo(xPoints[i], yPoints[i]);
    }
    this._ctx.closePath();
    this._ctx.fillStyle = color;
        // Fill the polygon first
    this._ctx.fill();
    // Then stroke its outline with the same color to mask anti-aliased gaps
    this._ctx.strokeStyle = color;
    this._ctx.lineWidth = 1;
    this._ctx.lineJoin = 'miter';
    this._ctx.miterLimit = 2;
    this._ctx.stroke();

  }
}
