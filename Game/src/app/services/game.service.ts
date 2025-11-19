import { Injectable } from '@angular/core';
import { Gamefield } from '../models/gamefield/gamefield';
import { Field } from '../interfaces/field';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private GameRunning!: boolean;
  private ctx!: CanvasRenderingContext2D
  private gamefield!: Gamefield;
  private inputs: Record<string, boolean> = {};
  private images: { [key: string]: HTMLImageElement } = {};
  private playerSize!: number;
  private playerX!: number;
  private playerY!: number;
  private velocity!: number;
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
 
/*
    //für Diagonale bewegung

    let countPressed = 0;
    let calculatedVelocity
    for (const key of Object.keys(this.inputs)) {
      if ((key === 'w' || key === 's' || key === 'd' || key === 'a') && this.inputs[key]) {
        countPressed++;
      }
    }
    if(countPressed === 2)
    {
      calculatedVelocity = this.velocity / Math.sqrt(2);
    }
    else{
      calculatedVelocity = this.velocity;
    }
    */
    let Obj = this.checkObject(); // Das Objekt mit dem Kollidiert wurde (null | Field)

    if (!this.checkBorder() && !Obj) { // normale Bewegung wenn nichts im Weg
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
    else {
      if (this.inputs['s'] ) { //Falls Objekt oder Boarder im Weg, setze Spieler direkt an Grenze
        if(Obj){
          this.playerY = Obj.y - this.playerSize / 2;
        }
        else{
          this.playerY = this.gamefield.rows * this.gamefield.fieldsize - this.playerSize / 2;
        }
         
      }
      else if (this.inputs['w']) {
        if (Obj)
        {
        this.playerY = Obj.y + Obj.height + this.playerSize / 2;
        }
        else
        {
          this.playerY = this.playerSize / 2
        }
      }
      else if (this.inputs['d']) {
        if (Obj){
          this.playerX = Obj.x - this.playerSize / 2;
        }
        else
        {
          this.playerX = this.gamefield.cols * this.gamefield.fieldsize - this.playerSize / 2
        }
      }
      else if (this.inputs['a']) {
        if (Obj){
          this.playerX = Obj.x + Obj.width + this.playerSize / 2;
        }
        else {
          this.playerX = this.playerSize / 2;
        }
      }
    }
  } 


  // Prüft ob ein einzelner Punkt kollidiert
  checkPoint(x: number, y: number): Field | null {

    const Objects = this.gamefield.interactableObjects;

    let nextX = x;
    let nextY = y;
    let collidedObject = null;


    if (this.inputs['s']) {
      nextY = y + this.velocity;
    }
    else if (this.inputs['w']) {
      nextY = y - this.velocity;
    }
    else if (this.inputs['d']) {
      nextX = x+ this.velocity;
    }
    else if (this.inputs['a']) {
      nextX = x - this.velocity;
    }
 
    Objects.forEach(Obj => // gibt Objekt zurückt, welches im nächsten Frame Kollidieren würde
    {
        if (Obj.y < nextY   && nextY  < Obj.y + Obj.height && Obj.x < nextX && nextX < Obj.x + Obj.width)
          {
            collidedObject = Obj;
          }
    }
    )
    return collidedObject;
}


  // Prüft Kollision mit vollständiger Hitbox
  checkObject(): Field | null {

    // Hitbox Ecken
    const halfSize = this.playerSize / 2;
    const top = this.playerY - halfSize;
    const bottom = this.playerY + halfSize;
    const left = this.playerX - halfSize;
    const right = this.playerX + halfSize;

    const leftbot  = this.checkPoint(left,bottom);
    const rightbot = this.checkPoint(right, bottom);
    const lefttop = this.checkPoint(left, top);
    const righttop = this.checkPoint(right, top)
    
    // Prüfe relevante Ecken in Bewegungsrichtung
    if (this.inputs['s'] ) {
      if(leftbot)
      {
          return leftbot
      }
      else if(rightbot)
      {
        return rightbot
      }
    } else if (this.inputs['w']) {
      if(lefttop)
        {
            return lefttop
        }
        else if(righttop)
        {
          return righttop
        }
    } else if (this.inputs['d']) {
      if(rightbot)
        {
            return rightbot
        }
        else if(righttop)
        {
          return righttop
        }
    } else if (this.inputs['a']) {
      if(leftbot)
        {
            return leftbot
        }
        else if(lefttop)
        {
          return lefttop
        }
    }

    return null;
  }

  checkBorder(): boolean {
    const rows = this.gamefield.rows;
    const cols = this.gamefield.cols;

    let nextX = this.playerX;
    let nextY = this.playerY;
    let collision = false;



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
      collision = true;
    }
    else if (nextX + this.playerSize / 2 > cols * this.gamefield.fieldsize) {
      collision = true;
    }


    if (nextY - this.playerSize / 2 < 0) {
      collision = true;
    }
    else if (nextY + this.playerSize / 2 > rows * this.gamefield.fieldsize) {
      collision = true;
    }
    return collision;
  }


  renderPlayer() {
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.rect(this.playerX - this.playerSize / 2, this.playerY - this.playerSize / 2, this.playerSize, this.playerSize)
    this.ctx.fill();
  }

  renderGameField() {

    for (let i = 0; i < this.gamefield.environmetObjects.length; i++) {
      this.renderField(i, false);
    }
    for (let i = 0; i < this.gamefield.interactableObjects.length; i++)
    {
      
      this.renderField(i, true);
    }
  }

  renderField(x: number, interactable: boolean) {
    let Obj;

    if (interactable)
    {
      Obj = this.gamefield.interactableObjects[x];
    }
    else
    {
      Obj = this.gamefield.environmetObjects[x]
    }

    const img = this.images[Obj.img];

    if (img)
    {
      this.ctx.drawImage(
        img,
        Obj.x,
        Obj.y,
        Obj.width,
        Obj.height
      )
    }
  }


  setInput(key: string, pressed: boolean) {
    this.inputs[key] = pressed;
  }
}