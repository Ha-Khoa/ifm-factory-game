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
  private ArrowUp: boolean = false;
  private ArrowDown: boolean = false;
  private ArrowLeft: boolean = false;
  private ArrowRight: boolean = false;
  private images: { [key: string]: HTMLImageElement } = {};
  constructor() { }


  async init(ctx: CanvasRenderingContext2D)
  {
    this.ctx = ctx;
    this.gamefield = new Gamefield();
    this.fieldSize = this.gamefield.gamefield.fieldSize;
    await this.preloadImages(["/images/StoneFloorTexture.png"]);
  }






  async preloadImages(srcs: string[])
  {
     const promises = srcs.map(src => this.loadImage(src).then(img => this.images[src] = img));
    await Promise.all(promises);
  }
  
  loadImage(src: string): Promise<HTMLImageElement>
  {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image from ${src}`));
      img.src = src;
    });
  }






  startGame()
  {
    this.GameRunning = true;

    const loop = () => {
      if(!this.GameRunning) return;

      this.renderGameField();
      

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stopGame()
  {
    this.GameRunning = false;
  }



  renderGameField()
  {
    // Canvas löschen
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
   
    for (let i = 0; i < this.gamefield.gamefield.cols; i++)
    {
      for (let j = 0; j < this.gamefield.gamefield.rows; j++)
      {
        this.renderField(i, j);
      }
    }
  }
  

  renderField(x : number, y : number)
  {
    const fieldObj = this.gamefield.gamefield.grid[y][x];
    const xPos = x * this.gamefield.gamefield.fieldSize;
    const yPos = y * (this.gamefield.gamefield.fieldSize-8) ;


    for (const obj of fieldObj.objects) {
      if (obj.img) {
        const img = this.images[obj.img];
        if (img) {
          this.ctx.drawImage(
            img,
            xPos,
            yPos,
            this.gamefield.gamefield.fieldSize,
            this.gamefield.gamefield.fieldSize
          );
        }
      }
    }
  }


  setInput(key: string, pressed: boolean)
  {
  
    if (pressed)
    {
      switch(key)
      {
        case "w":
          this.ArrowUp = true;break;
        case "s":
          this.ArrowDown = true; break;
        case "a":
          this.ArrowLeft = true; break;
        case "d":
          this.ArrowRight = true; break;
      }
    }

    else
    {
      this.ArrowUp = false;
      this.ArrowDown = false;
      this.ArrowLeft = false;
      this.ArrowRight = false;
    }
  }
}