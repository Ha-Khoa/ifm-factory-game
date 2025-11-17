import { Injectable } from '@angular/core';
import { Gamefield } from '../models/gamefield/gamefield';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private GameRunning!: boolean;
  private ctx! : CanvasRenderingContext2D
  private gamefield!: Gamefield;
  private fieldSize!: number;
  constructor() { }


  init(ctx: CanvasRenderingContext2D)
  {
    this.ctx = ctx;
    this.gamefield = new Gamefield();
    this.fieldSize = this.gamefield.gamefield.fieldSize;
  }


  startGame()
  {
    this.GameRunning = true;

    const loop = async () => {
      if(!this.GameRunning) return;

      this.renderGameField();
      

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  renderGameField()
  {
    for (let i = 0; i < this.gamefield.gamefield.cols; i++)
    {
      for (let j = 0; j < this.gamefield.gamefield.rows; j++)
      {
        this.renderField(i, j);
      }
    }
  }
  
  renderField(x: number, y : number)
  {
    let type = this.gamefield.gamefield.grid[x][y];
    if (type == 0 && (x + y )% 2 == 0)
    {
    this.ctx.fillStyle = "gray";
    this.ctx.fillRect(x * this.fieldSize, y * this.fieldSize, this.fieldSize, this.fieldSize);
    }
    else if (type == 0 && (x + y )% 2 == 1)
    {
      this.ctx.fillStyle = "brown";
      this.ctx.fillRect(x * this.fieldSize, y * this.fieldSize, this.fieldSize, this.fieldSize);
    }
  }

}
