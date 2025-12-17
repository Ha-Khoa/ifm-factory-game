import { Injectable, provideExperimentalCheckNoChangesForDebug } from '@angular/core';
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
  // Available icon image keys used by the reels
  private _slotIcons!: string[];
  private _sizePercentage: number = 20;
  // Initial spin velocity in px/s
  private _startVelocity!: number;
  private _imgSize!: number;
  // Padding around each icon tile inside a cell
  private _iconEdgeOffset!: number;
  private _spawnStartY!: number;
  private _maxProgress!: number;
  private _stopIntervall!: number;
  // Per-reel velocity (px/s)
  private _velocitys: number[] = [0,0,0,0,0];
  private _rowOffset!: number;
  private _step!: number;
  // Per-reel state flags
  private _isStopping: boolean[] = [false, false, false, false, false];
  private _stopped: boolean[] = [true, true, true, true, true];
  private _targets: number[] = [0,0,0,0,0];
  private _delayBetweenStops: number = 1000; 
  private _locking: boolean[] = [false, false, false, false, false];
  private _lockT: number[] = [0,0,0,0,0];
  private _lockStart: number[] = [0,0,0,0,0];
  private _lockTarget: number[] = [0,0,0,0,0];
  private _lockDuration: number = 200; 

  private _probabilitys: number[] = [0.05, 0.1, 0.25, 0.13, 0.25, 0.2, 0.02]; // Summe muss gleich 1 sein

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
    this._slotIcons = ["/images/slotMachine/seven.png",
       "/images/fox/fox-coin.png",
        "/images/slotMachine/cherry.png",
          "/images/slotMachine/diamond.png",
          "/images/slotMachine/lemon.png",
          "/images/slotMachine/ifm.png",
          "/images/slotMachine/manure.png"];
    this._startVelocity = 3000;
    this._iconEdgeOffset = this._ctx.canvas.height * (1 - ((this._sizePercentage) / 100)) / 5 * 0.1;

    this._imgSize = (this._ctx.canvas.height * (1 - ((this._sizePercentage) / 100))) / 3 - 2 * this._iconEdgeOffset;
    this._spawnStartY = this._ctx.canvas.height * (this._sizePercentage) / 200 - this._imgSize - this._iconEdgeOffset
    this._maxProgress = 4 * this._imgSize + this._iconEdgeOffset * 8;
    this._step = this._imgSize + 2 * this._iconEdgeOffset;
    this._stopIntervall = 2500;
    this._rowOffset = (this._ctx.canvas.width * (1 - ((this._sizePercentage) / 100)) - this._imgSize * 5) / 10;
    // Lade Slot Icons
    for(let i = 0; i < 5; i++)
    {
      this._slots.push([]);
      for(let j = 0; j < 4; j++)
      {
        this._slots[i].push({img: this._slotIcons[Math.floor(Math.random() * this._slotIcons.length)], progress: j * this._imgSize + 2 * j * this._iconEdgeOffset});
      }
    }
  }

  setInput(inputs: Record<string, boolean>)
  {
    for (const [key, pressed] of Object.entries(inputs)) {
               if(key === 'e' && pressed)
               {
                let stopped = true;
                console.log(this._stopped)
                this._stopped.forEach((stopping) => {
                  if (!stopping) stopped = false;
                });
                console.log(stopped)
                if (stopped) this.startSpin();
               }
           }
  }

  render()
  {
    this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
    this._ctx.rect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
    this._ctx.fillStyle = "#ffffffff";
    this._ctx.fill();
    for(let i = 0; i < 4; i++)
    {
      for(let j = 0; j < 5; j++)
      {
        if(this._slots[j][i].progress >= this._maxProgress)
        {
          this._slots[j][i].img = this.calcNewIcon();
        }
        this._slots[j][i].progress %= this._maxProgress;
      }
    }
    for(let i = 0; i < 5; i++)
    {
      if(RenderingService.instance().deltaTime)
      {
      this.drawRow(this._slots[i], i * (this._imgSize + this._iconEdgeOffset * 2) + this._ctx.canvas.width * (this._sizePercentage) / 200 + this._rowOffset * (i + 1) - this._rowOffset / 2, RenderingService.instance().deltaTime, i);
      }
    }
      this.drawEdge(this._sizePercentage);
  }

  calcNewIcon(): string
  {
    const rand = Math.random();
    let probSum = 0;
    for(let i = 0; i < this._probabilitys.length; i++)
    {
      probSum += this._probabilitys[i];
      if(rand <= probSum)
      {
        return this._slotIcons[i];
      }
    }
    return this._slotIcons[0];
  }

  startSpin()
  {
    for(let i = 0; i < 5; i++)
    {
      this._velocitys[i] = this._startVelocity;
      this._isStopping[i] = false;
      this._stopped[i] = false;
      this._locking[i] = false;
      this._lockT[i] = 0;
    }
    this.stopSpin();
  }

  async stopSpin()
  {
    // Delay before starting to stop reels
    await new Promise(r => setTimeout(r, this._stopIntervall));
    // Stagger stopping per reel
    for (let i = 0; i < 5; i++) {
      this.beginStop(i);
      await new Promise(r => setTimeout(r, this._delayBetweenStops));
    }
  }

  private beginStop(i: number) {
    if (this._isStopping[i] || this._stopped[i]) return;
    this._isStopping[i] = true;
    // Determine next forward grid cell for a clean lock-in (no backward snap)
    const p0 = ((this._slots[i][0].progress % this._maxProgress) + this._maxProgress) % this._maxProgress;
    let k = Math.ceil(p0 / this._step);
    if (k * this._step >= this._maxProgress) k = 0;
    this._targets[i] = k * this._step;
    this._locking[i] = true;
    this._lockT[i] = 0;
    this._lockStart[i] = p0;
    this._lockTarget[i] = this._targets[i];
    this._velocitys[i] = 0;
  }

  /**
   * Draws and updates a single reel.
   * @param Icons Icons for this reel (top-to-bottom order, each with progress)
   * @param xPosition X position to draw this reel
   * @param deltaTime Frame delta in ms
   * @param reelIndex Index of the reel (used to read/write per-reel state)
   */
  drawRow(Icons: SlotIcon[],xPosition: number, deltaTime: number, reelIndex: number = 0)
  {
    const dt = deltaTime / 1000;

    if (this._locking[reelIndex] && !this._stopped[reelIndex]) {
      this._lockT[reelIndex] += (deltaTime / this._lockDuration);
      const t = Math.min(1, this._lockT[reelIndex]);
      const ease = 1 - Math.pow(1 - t, 3);
      const start = this._lockStart[reelIndex];
      const target = this._lockTarget[reelIndex];
      const forwardDist = (target - start + this._maxProgress) % this._maxProgress;
      const base = (start + forwardDist * ease) % this._maxProgress;
      for (let j = 0; j < this._slots[reelIndex].length; j++) {
        this._slots[reelIndex][j].progress = (base + j * this._step) % this._maxProgress;
      }
      if (t >= 1) {
        for (let j = 0; j < this._slots[reelIndex].length; j++) {
          this._slots[reelIndex][j].progress = (target + j * this._step) % this._maxProgress;
        }
        this._stopped[reelIndex] = true;
        this._locking[reelIndex] = false;
      }
    } else {
      // Normal spin advance
      Icons.forEach((icon) => {
        icon.progress += this._velocitys[reelIndex] * dt;
      });
    }
    
    // Draw after updating per mode
    Icons.forEach((icon) => {
      this._ctx.drawImage(
        this._images[icon.img],
        xPosition,
        this._spawnStartY + icon.progress,
        this._imgSize,
        this._imgSize
      );
    });
    
  }

  drawEdge(sizePercentage: number)
  {
    const width = this._ctx.canvas.width;
    const height = this._ctx.canvas.height;
    const aspectRatio = width / height;
    let x1, y1, x2, y2;
    if(aspectRatio < 16/9) 
    {
    x1 = width * sizePercentage / 200;
    y1 = width * 9/16 * sizePercentage / 200;
    y2 = width * 9/16 * (200 - sizePercentage) / 200;
    x2 = width * (200 - sizePercentage) / 200;
    }
    else{
    x1 = height * 16/9 * sizePercentage / 200;
    y1 = height *  sizePercentage / 200;
    y2 = height * (200 - sizePercentage) / 200;
    x2 = height * 16/9 * (200 - sizePercentage) / 200;
    }


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
