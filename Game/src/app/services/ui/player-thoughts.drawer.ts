import {Rect} from './rect.interface';
import {RenderingService} from '../rendering.service';
import {Coordinates} from '../../models/coordinates/coordinates';
import {Gamefield} from '../../models/gamefield/gamefield';

export class PlayerThoughtsDrawer {

  constructor(
    private ctx: CanvasRenderingContext2D,
    private images: { [key: string]: HTMLImageElement }
  ) {}


  public drawNotEnoughMoney(playerPosition: Coordinates, offsetCamera: [number, number], fov: number): Rect[]{
    // console.log("drawNotEnoughMoney")
    const drawnRects: Rect[] = [];
    const isometricAngle = RenderingService.instance().angle;

    let size = Gamefield.fieldsize * fov / 2;
    let radius = size;
    let img = this.images['/images/fox/no-fox-coin.png'!];

    let x = playerPosition.x * fov + offsetCamera[0] + Gamefield.fieldsize * 2;
    let y = playerPosition.y * Math.cos(isometricAngle) * fov + offsetCamera[1] * Math.cos(isometricAngle) - 20 * fov - Gamefield.fieldsize * 2;

    // Big bubble
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, size, size, size);
    this.ctx.fill();
    drawnRects.push({x, y, width: size, height: size, radius: radius});

    if (img) {
      this.ctx.drawImage(img, x + (size - (size * .75))/2 , y + (size - (size * .75))/2, size * .75, size * .75);
    }


    // smaller bubbles
    for(let i = 0; i < 2; i++) {
      x -= 10;
      y += size;
      size /= 2;
      radius /= 2;

      this.ctx.beginPath()
      this.ctx.fillStyle = '#ffffff';
      this.ctx.roundRect(x,y, size, size, radius);
      this.ctx.fill();
      drawnRects.push({x: x, y: y, width: size, height: size, radius: radius});
    }

    this.ctx.restore();

    return drawnRects;
  }
}


export enum PlayerThoughtsType {
  NONE = 'NONE',
  NOT_ENOUGH_MONEY = 'NOT_ENOUGH_MONEY'
}
