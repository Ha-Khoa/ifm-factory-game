import { Injectable} from '@angular/core';
import { RenderingService } from './rendering.service';
import { PlayerService } from './player.service';
import { Gamefield } from '../models/gamefield/gamefield';
import { Player } from '../models/player/player';

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
  private _imgSizeX!: number;
  private _imgSizeY!: number;
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

  private _blinkDuration: number = 1000;

  private _blinkT: number = 0;

  private _blinkState: boolean = false;

  private _activePatterns: number[][][] = [];

  private _probabilitys: number[] = [0.05, 0.1, 0.25, 0.13, 0.25, 0.2, 0.0000001,0.02]; // Summe muss gleich 1 sein

  private _iconMultiplier: number[] = [10, 2, 1, 2, 1, 1.5, Infinity, -Infinity];

  private _slots: SlotIcon[][] = [];

  private _won: number = 0;

  private _playerService!: PlayerService


  constructor() 
  {
  }


    private static _instance: SlotMachineService | null = null;


  static instance(): SlotMachineService {
    if (!this._instance) {
      this._instance = new SlotMachineService();
    }
    return this._instance;
  }

  init(ctx: CanvasRenderingContext2D, images: { [key: string]: HTMLImageElement }, playerService: PlayerService)
  {
    this._ctx = ctx;
    this._playerService = playerService;

    this._images = images;
    this._slotIcons = ["/images/slotMachine/seven.png",
       "/images/fox/fox-coin.png",
        "/images/slotMachine/cherry.png",
          "/images/slotMachine/diamond.png",
          "/images/slotMachine/lemon.png",
          "/images/slotMachine/ifm.png",
          "/images/slotMachine/squirrel.png",
          "/images/slotMachine/manure.png"];
    this._startVelocity = 3000;
    this._stopIntervall = 2500;
    this._iconEdgeOffset = this._ctx.canvas.height * (1 - ((this._sizePercentage) / 100)) / 5 * 0.1;
    this._rowOffset = 20;
    this._imgSizeX = (this._ctx.canvas.width * (1 - ((this._sizePercentage) / 100))) / 5 - 2 * this._iconEdgeOffset - 5/6 *this._rowOffset;
    this._imgSizeY = (this._ctx.canvas.height * (1 - ((this._sizePercentage) / 100))) / 3 - 2 * this._iconEdgeOffset;
    this._spawnStartY = this._ctx.canvas.height * (this._sizePercentage) / 200 - this._imgSizeY - this._iconEdgeOffset
    this._maxProgress = 4 * this._imgSizeY + this._iconEdgeOffset * 8;
    this._step = this._imgSizeY + 2 * this._iconEdgeOffset;

    // Lade Slot Icons
    for(let i = 0; i < 5; i++)
    {
      this._slots.push([]);
      for(let j = 0; j < 4; j++)
      {
        this._slots[i].push({img: this._slotIcons[1], progress: j * this._imgSizeY + 2 * j * this._iconEdgeOffset});
      }
    }
  }

  setInput(inputs: Record<string, boolean>)
  {
    for (const [key, pressed] of Object.entries(inputs)) {
               if(key === 'e' && pressed)
               {
                let stopped = true;
                this._stopped.forEach((stopping) => {
                  if (!stopping) stopped = false;
                });
                if (stopped && this._playerService.getMoney() >= 10) 
                {
                  this._playerService.removeMoney(10).subscribe({
                    next: () => {
                      this.startSpin();
                    },
                    error: (err) => {
                      console.error("Could not start spin, failed to remove money:", err.message);
                      // Maybe show a UI notification to the player
                    }
                  });
                }
               }
           }
  }

  render(x: number, y: number, width: number, height: number)
  {
    this._ctx.save();
    
    this._ctx.beginPath();
    this._ctx.rect(x, y, width, height);
    this._ctx.clip();
    
    this._ctx.translate(x, y);
    
    const scaleX = width / this._ctx.canvas.width;
    const scaleY = height / this._ctx.canvas.height;
    this._ctx.scale(scaleX, scaleY);

    // Slot-machine background
    this._ctx.beginPath();
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
      this.drawRow(this._slots[i], i * (this._imgSizeX + this._iconEdgeOffset * 2) + this._ctx.canvas.width * (this._sizePercentage) / 200 + this._rowOffset * (i + 1), RenderingService.instance().deltaTime, i);
      }
    }
      this.drawEdge(this._sizePercentage);
    if(this._stopped.every((stopped) => stopped))
    {
      this.drawPattern("#ff0000");
    }
    else
    {
      this._activePatterns = [];
    }
    this.drawCosts();
    this.drawWon();
    this._ctx.restore();
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
    await new Promise(r => setTimeout(r, this._stopIntervall));
    for (let i = 0; i < 5; i++) {
      this.beginStop(i);
      await new Promise(r => setTimeout(r, this._delayBetweenStops));

    }
    this._slots.forEach((icon) => {
      icon.sort((a,b) => a.progress - b.progress);
    });
    const won = this.checkAllPattern();
    if(won > 0)
    {
      this._playerService.addMoney(won);
    }
  }

  private beginStop(i: number) {
    if (this._isStopping[i] || this._stopped[i]) return;
    this._isStopping[i] = true;
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

  checkAllPattern() : number
  {
    let totalWon = 0;


    const emptyPattern = (): number[][] => Array.from({ length: 5 }, () => [0, 0, 0]);

    const getVisibleImg = (reel: number, row: number): string | null => {

      const slot = this._slots[reel]?.[row + 1];
      return slot ? slot.img : null;
    };

    const addPaylinePattern = (rows: number[], start: number, length: number): number[][] => {
      const p = emptyPattern();
      for (let i = start; i < start + length; i++) {
        const r = rows[i];
        if (r < 0 || r > 2) continue;
        p[i][r] = 1;
      }
      return p;
    };

    const checkPayline = (rows: number[], multiplier: number): number => {
      if (rows.length !== 5) return 0;
      for (const r of rows) if (r < 0 || r > 2) return 0;

      const imgs: (string | null)[] = new Array(5);
      for (let i = 0; i < 5; i++) imgs[i] = getVisibleImg(i, rows[i]);

      let bestLen = 0;
      let bestStart = 0;
      let bestImg = '';

      let runStart = 0;
      let runLen = 0;
      let runImg: string | null = null;

      for (let i = 0; i < 5; i++) {
        const img = imgs[i];
        if (!img) {
          // break the run on missing data
          if (runLen > bestLen) {
            bestLen = runLen;
            bestStart = runStart;
            bestImg = runImg ?? '';
          }
          runImg = null;
          runLen = 0;
          runStart = i + 1;
          continue;
        }

        if (runImg === null || img !== runImg) {
          // finalize previous run
          if (runLen > bestLen) {
            bestLen = runLen;
            bestStart = runStart;
            bestImg = runImg ?? '';
          }
          // start new run
          runImg = img;
          runStart = i;
          runLen = 1;
        } else {
          runLen++;
        }
      }

      // finalize last run
      if (runLen > bestLen) {
        bestLen = runLen;
        bestStart = runStart;
        bestImg = runImg ?? '';
      }

      if (bestLen < 3) return 0;
      if (bestLen > 5) bestLen = 5;

      let payLen = 0
      if(bestLen === 3) payLen = 1;
      if(bestLen === 4) payLen = 2;
      if(bestLen === 5) payLen = 4;

      this._activePatterns.push(addPaylinePattern(rows, bestStart, bestLen));
      const idx = this._slotIcons.indexOf(bestImg);
      const iconMult = idx >= 0 ? this._iconMultiplier[idx] : 1;
      return payLen * multiplier * iconMult;
    };

    // Checks a diagonal of length 3 starting at reel `startReel` with slope +1 (down) or -1 (up).
    const checkDiagonal3 = (startReel: number, slope: 1 | -1, multiplier: number): number => {
      if (startReel < 0 || startReel > 2) return 0;
      const startRow = slope === 1 ? 0 : 2;
      const rows3 = [startRow, startRow + slope, startRow + 2 * slope];
      if (rows3.some(r => r < 0 || r > 2)) return 0;

      const img0 = getVisibleImg(startReel, rows3[0]);
      const img1 = getVisibleImg(startReel + 1, rows3[1]);
      const img2 = getVisibleImg(startReel + 2, rows3[2]);
      if (!img0 || !img1 || !img2) return 0;
      if (img0 !== img1 || img0 !== img2) return 0;

      const p = emptyPattern();
      p[startReel][rows3[0]] = 1;
      p[startReel + 1][rows3[1]] = 1;
      p[startReel + 2][rows3[2]] = 1;
      this._activePatterns.push(p);

      const idx = this._slotIcons.indexOf(img0);
      const iconMult = idx >= 0 ? this._iconMultiplier[idx] : 1;
      return 3 * multiplier * iconMult;
    };

    // Column wins (3 stacked in a reel)
    for(let i = 0; i < 5; i++)
    {
      const check = emptyPattern();
      check[i] = [1,1,1];
      totalWon += this.checkPattern(check, 4);
    }
    totalWon += this.checkPattern([[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1]], 500); 

    // Horizontal lines (top/middle/bottom): pay 3/4/5 in a row
    totalWon += checkPayline([0, 0, 0, 0, 0], 10);
    totalWon += checkPayline([1, 1, 1, 1, 1], 10);
    totalWon += checkPayline([2, 2, 2, 2, 2], 10);

    // Down then up: 0-1-2-1-0
    {
      const p = emptyPattern();
      const rows = [0, 1, 2, 1, 0];
      for (let i = 0; i < 5; i++) p[i][rows[i]] = 1;
      totalWon += this.checkPattern(p, 7);
    }

    // Up then down: 2-1-0-1-2
    {
      const p = emptyPattern();
      const rows = [2, 1, 0, 1, 2];
      for (let i = 0; i < 5; i++) p[i][rows[i]] = 1;
      totalWon += this.checkPattern(p, 10);
    }

    // Simple diagonals of length 3 (both directions), across all 3-reel windows
    for (let startReel = 0; startReel <= 2; startReel++) {
      totalWon += checkDiagonal3(startReel, 1, 5);  // 0-1-2
      totalWon += checkDiagonal3(startReel, -1, 5); // 2-1-0
    }
    this._won = Math.ceil(totalWon)
    return Math.ceil(totalWon);

  }

  checkPattern(pattern: number[][], multiplier: number) : number
  {
    // A pattern wins only if ALL marked cells match the same symbol.
    let expected = 0;
    let matched = 0;
    let lastImg = "";

    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        if (pattern[i][j] !== 1) continue;
        expected++;

        // Visible rows are mapped to slot indices 1..3 (skip the top offscreen icon at index 0)
        const slotRowIndex = j + 1;
        const slot = this._slots[i]?.[slotRowIndex];
        if (!slot) return 0;

        const img = slot.img;
        if (lastImg === "") {
          lastImg = img;
          matched++;
          continue;
        }

        if (img !== lastImg) return 0; // fail fast on first mismatch
        matched++;
      }
    }

    if (expected > 0 && matched === expected) {
      this._activePatterns.push(pattern);
      const idx = this._slotIcons.indexOf(lastImg);
      const multiplier2 = idx >= 0 ? this._iconMultiplier[idx] : 1;
      return matched * multiplier * multiplier2;
    }
    
    return 0;
  }

  drawPattern(_fallbackColor: string = '#ff0000')
  {
    if (this._activePatterns.length === 0) return;

    const dt = RenderingService.instance().deltaTime ? RenderingService.instance().deltaTime : 1;
    this._blinkT += dt;
    if (this._blinkT >= this._blinkDuration)
    {
      this._blinkT = 0;
      this._blinkState = !this._blinkState;
    }
    if (this._blinkState === false) return;

    const palette: Array<[number, number, number]> = [
      [255, 60, 60],
      [60, 160, 255],
      [60, 220, 140],
      [255, 180, 60],
      [200, 80, 255],
      [60, 220, 220],
    ];

    this._ctx.save();
    this._ctx.lineWidth = 4;
    this._ctx.globalCompositeOperation = 'source-over';

    for (let pIndex = 0; pIndex < this._activePatterns.length; pIndex++)
    {
      const pattern = this._activePatterns[pIndex];
      const [r, g, b] = palette[pIndex % palette.length];
      const fill = `rgba(${r}, ${g}, ${b}, 0.18)`;
      const stroke = `rgba(${r}, ${g}, ${b}, 0.70)`;

      for(let i = 0; i < pattern.length; i++)
      {
        for(let j = 0; j < pattern[i].length; j++)
        {
          if(pattern[i][j] === 1)
          {
            const x = i * (this._imgSizeX + this._iconEdgeOffset * 2) + this._ctx.canvas.width * (this._sizePercentage) / 200 + this._rowOffset * (i + 1);
            const y = j * (this._imgSizeY + this._iconEdgeOffset * 2) + this._spawnStartY + 2 * this._iconEdgeOffset + this._imgSizeY;

            this._ctx.fillStyle = fill;
            this._ctx.strokeStyle = stroke;
            this._ctx.fillRect(x - 6, y - 6, this._imgSizeX + 12, this._imgSizeY + 12);
            this._ctx.strokeRect(x - 6, y - 6, this._imgSizeX + 12, this._imgSizeY + 12);
          }
        }
      }
    }

    this._ctx.restore();
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
      Icons.forEach((icon) => {
        icon.progress += this._velocitys[reelIndex] * dt;
      });
    }
    
    Icons.forEach((icon) => {
      this._ctx.drawImage(
        this._images[icon.img],
        xPosition,
        this._spawnStartY + icon.progress,
        this._imgSizeX,
        this._imgSizeY
      );
    });
    
  }

  drawEdge(sizePercentage: number)
  {
    const width = this._ctx.canvas.width;
    const height = this._ctx.canvas.height;
    let x1 = width * sizePercentage / 200;
    let y1 = height *  sizePercentage / 200;
    let y2 = height * (200 - sizePercentage) / 200;
    let x2 = width * (200 - sizePercentage) / 200;


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
    this._ctx.fill();
    this._ctx.strokeStyle = color;
    this._ctx.lineWidth = 1;
    this._ctx.lineJoin = 'miter';
    this._ctx.miterLimit = 2;
    this._ctx.stroke();

  }



  drawCosts()
  {
    const px = 100;
    const string = "Kosten: 10"
    this._ctx.fillStyle = "yellow"
    this._ctx.font = `italic small-caps bold ${px}px arial`
    this._ctx.fillText(
      string,
      this._ctx.canvas.width / 2 - this._ctx.measureText(string).width / 2 - px,
      this._ctx.canvas.height * this._sizePercentage / 400 + px / 3);  
    this._ctx.drawImage(
      this._images["/images/fox/fox-coin.png"],
      this._ctx.canvas.width / 2 + this._ctx.measureText(string).width / 2 - px + 10,
      this._ctx.canvas.height * this._sizePercentage / 400 - px / 2,
      px,
      px
    )
  }

drawWon()
{
  const string = `Gewinn:`;
  const px = 50;
  this._ctx.fillStyle = "yellow"
  this._ctx.font = `italic small-caps bold ${px}px arial`;
  this._ctx.fillText(
    string,
    this._ctx.canvas.width * this._sizePercentage / 400 - this._ctx.measureText(string).width / 2,
    this._ctx.canvas.height / 2
  )
  this._ctx.fillText(
    this._won + "",
    this._ctx.canvas.width * this._sizePercentage / 400 - this._ctx.measureText(this._won + "").width / 2,
    this._ctx.canvas.height / 2 + px
  )

}

}
