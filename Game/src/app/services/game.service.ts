import { Injectable } from '@angular/core';
import { Gamefield } from '../models/gamefield/gamefield';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private GameRunning!: boolean;
  private ctx!: CanvasRenderingContext2D
  private gamefield!: Gamefield;
  private fieldSize!: number;
  private inputs: Record<string, boolean> = {};
  private images: { [key: string]: HTMLImageElement } = {};
  private playerSize!: number;
  private playerX!: number;
  private playerY!: number;
  private velocity!: number;
  private kollisionOffset: number = 1;
  constructor() { }


  async init(ctx: CanvasRenderingContext2D) {
    this.playerSize = 40;
    this.inputs['w'] = false;
    this.inputs['a'] = false;
    this.inputs['s'] = false;
    this.inputs['d'] = false;
    this.velocity = 10;
    this.playerX = 100;
    this.playerY = 100;
    this.ctx = ctx;
    this.gamefield = new Gamefield();
    this.fieldSize = this.gamefield.gamefield.fieldSize;
    await this.preloadImages(["/images/StoneFloorTexture.png", "/images/wall.png"]);
  }





//Biler laden
  async preloadImages(srcs: string[]) {
    const promises = srcs.map(src => this.loadImage(src).then(img => this.images[src] = img));
    await Promise.all(promises);
  }

  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image from ${src}`));
      img.src = src;
    });
  }






  startGame() {
    this.GameRunning = true;

    const loop = () => {
      if (!this.GameRunning) return;

      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);


      this.updatePlayer();

      this.renderGameField();
      this.renderPlayer();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stopGame() {
    this.GameRunning = false;
  }





  updatePlayer() {
    if (!this.checkBorder() && !this.checkObject()) { // normale Bewegung wenn nichts im Weg
      if (this.inputs['s']) {
        this.playerY += this.velocity;
      }
      else if (this.inputs['w']) {
        this.playerY -= this.velocity;
      }
      else if (this.inputs['d']) {
        this.playerX += this.velocity;
      }
      else if (this.inputs['a']) {
        this.playerX -= this.velocity;
      }
    }
    else{
      if (this.inputs['s']) { //Falls Objekt oder Boarder im Weg, Setze Spieler direkt an Grenze
        this.playerY = Math.floor(this.playerY/this.fieldSize) * this.fieldSize + (this.fieldSize - this.playerSize/2) - this.kollisionOffset;
      }
      else if (this.inputs['w']) {
        this.playerY = Math.floor(this.playerY/this.fieldSize) * this.fieldSize +  this.playerSize/2 + this.kollisionOffset;
      }
      else if (this.inputs['d']) {
        this.playerX = Math.floor(this.playerX/this.fieldSize) * this.fieldSize + (this.fieldSize - this.playerSize/2) - this.kollisionOffset;
      }
      else if (this.inputs['a']) {
        this.playerX= Math.floor(this.playerX/this.fieldSize) * this.fieldSize + this.playerSize/2 + this.kollisionOffset;
      }
    }
  }


  // Prüft ob ein einzelner Punkt kollidiert
  checkPoint(x: number, y: number): boolean {
    const grid = this.gamefield.gamefield.grid;
    const rows = this.gamefield.gamefield.rows;
    const cols = this.gamefield.gamefield.cols;
    const gridX = (x - 0.5) / this.fieldSize; // welche Gridfeld ist der Spieler 
    const gridY = (y - 0.5) / this.fieldSize; // runter gerundet
    let nextGridX = 0;
    let nextGridY = 0;


    //Wo ist der Spieler im nächsten Frame
    if (this.inputs['s']) {
      nextGridY = (y + this.velocity - 0.5) / this.fieldSize;
    } else if (this.inputs['w']) {
      nextGridY = (y - this.velocity - 0.5) / this.fieldSize;
    } else if (this.inputs['d']) {
      nextGridX = (x + this.velocity - 0.5) / this.fieldSize;
    } else if (this.inputs['a']) {
      nextGridX = (x - this.velocity - 0.5) / this.fieldSize;
    }

    //Kontrolliert ob nächster Frame Out of Bounds wäre
    if (nextGridY < 0 || nextGridY >= rows || nextGridX < 0 || nextGridX >= cols) {
      return true; 
    }
    // Prüfe ob ein Feld walkable
      if ((this.inputs['s'] || this.inputs['w']) && gridY != nextGridY) {
        return grid[Math.floor(gridX)][Math.floor(nextGridY)].objects.some(obj => !obj.isWalkable)
      } else if ((this.inputs['d'] || this.inputs['a']) && gridX != nextGridX) {
        return grid[Math.floor(nextGridX)][Math.floor(gridY)].objects.some(obj => !obj.isWalkable)
      }
  return false;
}

  // Prüft Kollision mit vollständiger Hitbox
  checkObject(): boolean {

    // Hitbox Ecken
    const halfSize = this.playerSize / 2;
    const top = this.playerY - halfSize;
    const bottom = this.playerY + halfSize;
    const left = this.playerX - halfSize;
    const right = this.playerX + halfSize;

    
    // Prüfe relevante Ecken in Bewegungsrichtung
    if (this.inputs['s']) {
      return this.checkPoint(left, bottom) || this.checkPoint(right, bottom);
    } else if (this.inputs['w']) {
      return this.checkPoint(left, top) || this.checkPoint(right, top);
    } else if (this.inputs['d']) {
      return this.checkPoint(right, top) || this.checkPoint(right, bottom);
    } else if (this.inputs['a']) {
      return this.checkPoint(left, top) || this.checkPoint(left, bottom);
    }

    return false;
  }

  checkBorder(): string | null {
    const rows = this.gamefield.gamefield.rows;
    const cols = this.gamefield.gamefield.cols;

    let nextX = this.playerX;
    let nextY = this.playerY;
    let collision = null;

    if (this.inputs['s']) {
      nextY = this.playerY + this.velocity;
    }
    else if (this.inputs['w']) {
      nextY = this.playerY - this.velocity;
    }
    else if (this.inputs['d']) {
      nextX = this.playerX + this.velocity;
    }
    else if (this.inputs['a']) {
      nextX = this.playerX - this.velocity;
    }


    if (nextX - this.playerSize / 2 < 0) {
      collision = "left"
    }
    else if (nextX + this.playerSize / 2 > cols * this.fieldSize) {
      collision = "right";
    }


    if (nextY - this.playerSize / 2 < 0) {
      collision = "up";
    }
    else if (nextY + this.playerSize / 2 > rows * this.fieldSize) {
      collision = "down";
    }

    return collision;
  }


  renderPlayer() {
    const radius = this.playerSize;
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.rect(this.playerX - this.playerSize / 2, this.playerY - this.playerSize / 2, this.playerSize, this.playerSize)
    this.ctx.fill();
  }

  renderGameField() {
    // Canvas lösche   
    for (let i = 0; i < this.gamefield.gamefield.cols; i++) {
      for (let j = 0; j < this.gamefield.gamefield.rows; j++) {
        this.renderField(i, j);
      }
    }
  }

  renderField(x: number, y: number) {
    const fieldObj = this.gamefield.gamefield.grid[x][y];
    const xPos = x * this.gamefield.gamefield.fieldSize;
    const yPos = y * this.gamefield.gamefield.fieldSize;


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


  setInput(key: string, pressed: boolean) {
    this.inputs[key] = pressed;
  }
}