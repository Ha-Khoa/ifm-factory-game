import { RenderObject } from "../models/rendering/render-object"
import { Injectable } from "@angular/core";
import { Direction } from "../enums/direction";
import { RenderType } from "../enums/render-type";
import { ParticleRenderingService } from "./particle-rendering.service";
import { ParticleRenderObject } from "../models/rendering/particle-render-object";
import { Camera } from "../models/camera/camera";
import { Gamefield } from "../models/gamefield/gamefield";
import { SlotMachine } from "../models/slot-machine/slot-machine";
import { SlotMachineService } from "./slot-machine.service";
import { PrepMachine } from "../models/preProcess/prep-machine";


/**
 * Rendering-Klasse: Verwaltet alle Objekte im Rendering-Buffer und zeichnet sie auf das Canvas.
 * Sortiert Objekte nach Z-Koordinate, Priorität und Y-Position für korrekte Überlappung.
 */
@Injectable({
  providedIn: 'root'
})
export class RenderingService {

  // Buffer mit allen zu rendernden Objekten
  private _renderingBuffer: RenderObject[] = [];
  // Vorgeladene Bilder für Texturen
  private _images!: { [key: string]: HTMLImageElement };
  // Canvas-Kontext zum Zeichnen
  private _ctx!: CanvasRenderingContext2D;
  // Winkel für isometrische Projektion
  private _angle!: number;

  private _fps!: number;

  private _lastFrameTime!: number;

  private _deltaTime!: number;

  private _xOffset: number = 0;
  private _yOffset: number = 0;

  private _fov!: number;
  private _gameFov: number = 2.5;

  private _camera!: Camera;

  private _rotationZ: number = 0;

  // Singleton support
  private static _instance: RenderingService | null = null;


  static instance(): RenderingService {
    if (!this._instance) {
      this._instance = new RenderingService();
    }
    return this._instance;
  }

  constructor() { }

  init(ctx: CanvasRenderingContext2D, images: { [key: string]: HTMLImageElement }, angle: number) {
    this._ctx = ctx;
    this._images = images;
    this._angle = angle;
    ParticleRenderingService.instance().init(ctx, angle, this._xOffset, this._yOffset, this._fov);
  }
  /**
   * Fügt ein einzelnes RenderObject zum Buffer hinzu und sortiert neu.
   * @param renderObject Das hinzuzufügende Objekt
   */
  addRenderObject(renderObject: RenderObject) {
    this._renderingBuffer.push(renderObject);
    this.sortRenderingBuffer();
  }

  addRenderObjects(renderObjects: RenderObject[]) {
    renderObjects.forEach((obj) => {
      this._renderingBuffer.push(obj);
    });
    this.sortRenderingBuffer();
  }

  updateRenderingObject(name: string, renderObject: RenderObject) {
    const index = this._renderingBuffer.findIndex(Obj => Obj.name === name);
    if (index === -1) {
      this.addRenderObject(renderObject);
    } else {
      this._renderingBuffer[index] = renderObject;
      this.sortRenderingBuffer();
    }
  }

  sortRenderingBuffer() {
    this._renderingBuffer.sort((a, b) => (a.y * 10 + a.z * 20 + a.priority * 5) - (b.y * 10 + b.z * 20 + b.priority * 5));
  }

  convertToCameraPOV(camera: Camera): void
  {
    this._rotationZ = this._ctx.canvas.height / 2 - this._ctx.canvas.height / 2 * Math.cos(this._angle) + camera.position.z * Math.sin(this._angle) * this._fov;
    this._xOffset = this._ctx.canvas.width / 2 - camera.position.x * this._fov;
    this._yOffset = this._ctx.canvas.height / 2 - camera.position.y * this._fov;
    if(!this._camera)
    {
      this._camera = camera
      this._fov = camera.fov
    }

    ParticleRenderingService.instance().xOffset = this._xOffset;
    ParticleRenderingService.instance().yOffset = this._yOffset;
    ParticleRenderingService.instance().fov = this._fov
  }

  getRenderingObjektByID(id: number): RenderObject | undefined {
    return this._renderingBuffer.find((obj) => obj.id === id);
  }

  getRenderingObjektByName(name: string): RenderObject | undefined {
    return this._renderingBuffer.find((obj) => obj.name === name);
  }

  deleteRenderingObjektByID(id: number): void {
    this._renderingBuffer = this._renderingBuffer.filter((obj) => obj.id !== id);
  }

  deleteRenderingObjektByName(name: string): void {
    this._renderingBuffer = this._renderingBuffer.filter((obj) => obj.name !== name);
  }

  /**
   * Rendert alle Objekte im Buffer auf das Canvas.
   * Wendet isometrische Projektion an und zeichnet Rechtecke mit 3D-Tiefeneffekt oder Bilder
   */
  render(): void {
    if (!this._ctx) return;
    this._renderingBuffer.forEach((Obj) => {
      if(!Obj.render) return;
      // Berechne isometrische Projektion
      // Rechtecke mit Canvas
      const zTransform = this._fov * Obj.z * Math.sin(this._angle)
      const yProjection = this._fov * (Obj.y + this._yOffset / this._fov) * Math.cos(this._angle) - zTransform + this._rotationZ;
      const xObj = this._fov * Obj.x + this._xOffset;
      const objHeight = this._fov * Obj.height;
      const objWidth = this._fov * Obj.width
      // Alle Objekte außerhalb des Sichtfeldes werden nicht gerendert
      if(xObj + objWidth < 0 || xObj > this._ctx.canvas.width || this._fov * (Obj.y + this._yOffset / this._fov) * Math.cos(this._angle) + objHeight * Math.cos(this._angle) + this._rotationZ < 0 || yProjection > this._ctx.canvas.height) return;
      if ((Obj.type === RenderType.RECT)) {
        const layers = Obj.rectLayers!.length;
        for (let i = 0; i < layers; i++) {
          this._ctx.beginPath();
          this._ctx.fillStyle = Obj.rectLayers![i];
          this._ctx.rect(
            Math.round(xObj),
            this._fov * ( (Obj.y + this._yOffset / this._fov + Obj.height) * Math.cos(this._angle) - (Obj.z / layers) * (layers - i) * Math.sin(this._angle) ) + this._rotationZ,
            Math.round(objWidth + 1),
            this._fov * (Obj.z / layers) * Math.sin(this._angle) + 1
          );
          this._ctx.fill();
        }
        this._ctx.beginPath();
        this._ctx.fillStyle = Obj.rectColor!;
        this._ctx.fillRect(
          Math.round(xObj),
          yProjection,
          Math.round(objWidth + 1),
          objHeight * Math.cos(this._angle) + 1
        );
        this._ctx.fill();
      }
      // Bild mit Wand
      else if (Obj.type === RenderType.IMG) {
        let mirror = 1;
          this._ctx.save();
          if (Obj.animationDirection === Direction.LEFT) {
            mirror = -1;
            this._ctx.scale(-1, 1);
          }
        this._ctx.drawImage(
          this._images[Obj.img!],
          mirror * Math.round(xObj),
          yProjection,
          mirror * objWidth,
          objHeight * Math.cos(this._angle)
        );
        if (Obj.imgWall) {
          this._ctx.drawImage(
            this._images[Obj.imgWall!],
            mirror * Math.round(xObj),
            yProjection + Obj.height * Math.cos(this._angle) * this._fov,
            mirror * objWidth,
            this._fov * Obj.z * Math.sin(this._angle)
          );
        }
        this._ctx.restore();
        
        // Render Produkt auf PrepMachine
        if (Obj instanceof PrepMachine) {
          const prepMachine = Obj as PrepMachine;
          const visualState = prepMachine.getVisualState();
          
          if ((visualState.isActive || visualState.hasOutput) && prepMachine.prepNextFrame) {
            //Zeichen das Animationsbild
            const frameImage = this._images[prepMachine.prepNextFrame];
            if (frameImage) {
              //Berechne Position und Größe der Animation
              const animWidth = objWidth * 0.2;     //Mache die Animation 40% der Prepmachine
              const animHeight = animWidth * Math.cos(this._angle); // Behalte das quadratische Seitenverhältnis bei
              const xCenter = Math.round(xObj + (objWidth - animWidth) / 2);
              const yCenter = yProjection + (objHeight * Math.cos(this._angle) * 0.35);
              
              this._ctx.drawImage(
                frameImage,
                xCenter,
                yCenter,
                animWidth,
                animHeight
              );
            }
          }
        }
      }
      else if (Obj.type === RenderType.CARD_BOARD) {
        let mirror = 1;
          this._ctx.save();
          if (Obj.animationDirection === Direction.LEFT) {
            mirror = -1;
            this._ctx.scale(-1, 1);
          }
          if (Obj.img) {
            this._ctx.drawImage(
              this._images[Obj.img!],
              mirror * Math.round(xObj),
              yProjection,
              mirror * objWidth,
              this._fov * Obj.height * Math.sin(this._angle)
            );
          }
          this._ctx.restore();
      }
      // Slot Machine Rendering
      else if (Obj.type === RenderType.SLOT_MACHINE) {
        this._ctx.save();
        SlotMachineService.instance().render(xObj, yProjection, objWidth, objHeight * Math.sin(this._angle));
        this._ctx.restore();
      }
      //Animation
      else if (Obj.type === RenderType.GIF) {
        if (Obj.frames && Obj.framesPerSecond && Obj.nextFrame) {
          let mirror = 1;
          this._ctx.save();
          if (Obj.animationDirection === Direction.LEFT) {
            mirror = -1;
            this._ctx.scale(-1, 1);
          }
          const maxOneFrame = Math.round(this._fps / Obj.framesPerSecond)
          if (maxOneFrame < Obj.singleFrameCount) {
            Obj.nextFrame = Obj.frames[(Obj.frameNumber + 1) % Obj.frames.length]
            Obj.frameNumber++;
            Obj.singleFrameCount = 0;
          }
          Obj.singleFrameCount++;
          this._ctx.drawImage(
            this._images[Obj.nextFrame!],
            mirror * Math.round(xObj),
            yProjection,
            objWidth * mirror,
            this._fov * Obj.height * Math.sin(this._angle)
          )
          this._ctx.restore();

        }
      }
      //Partikel
      else if (Obj instanceof ParticleRenderObject && Obj.type === RenderType.PARTICLE && Obj.render)
      {

        ParticleRenderingService.instance().render((Obj as ParticleRenderObject).particles, this._deltaTime);
      }
      //3D Bild
      else if (Obj.type === RenderType.THREE_D_IMG) {
        let mirror = 1;
          this._ctx.save();
          if (Obj.animationDirection === Direction.LEFT) {
            mirror = -1;
            this._ctx.scale(-1, 1);
          }
        this._ctx.drawImage(
          this._images[Obj.img!],
          mirror * Math.round(xObj),
          yProjection,
          objWidth * mirror,
          this._fov * Obj.height * Math.cos(this._angle) + this._fov * Obj.z * Math.sin(this._angle)
        );
        this._ctx.restore();
      }
      //Flat GIF
      else if (Obj.type === RenderType.FLAT_GIF)
      {
        if (Obj.frames && Obj.framesPerSecond && Obj.nextFrame) {
          let mirror = 1;
          this._ctx.save();
          if (Obj.animationDirection === Direction.LEFT) {
            mirror = -1;
            this._ctx.scale(-1, 1);
          }
          const maxOneFrame = Math.round(this._fps / Obj.framesPerSecond)
          if (maxOneFrame < Obj.singleFrameCount) {
            Obj.nextFrame = Obj.frames[(Obj.frameNumber + 1) % Obj.frames.length]
            Obj.frameNumber++;
            Obj.singleFrameCount = 0;
          }
          Obj.singleFrameCount++;
          this._ctx.drawImage(
            this._images[Obj.nextFrame],
            mirror * Math.round(xObj),
            yProjection,
            objWidth * mirror,
            this._fov * Obj.height * Math.cos(this._angle) + 3
          )
          this._ctx.restore();

        }
      }
    }
    );
  }


  rotateInSlotMachine(slotMachine: SlotMachine)
  {
    const angle = 90 / 360 * 2 * Math.PI;
    const zoom = this._ctx.canvas.width / slotMachine.width;
    const y = slotMachine.y + slotMachine.height / 2;
    const z = Gamefield.fieldsize - 9 / 16 * slotMachine.width / 2;
    const x = slotMachine.x + slotMachine.width / 2;
    if(this._camera.x > x - 1 && this._camera.x < x + 1)
    {
      this._camera.x = x;
    }
    else if(this._camera.x + 5 < x)
    {
      this._camera.x += 5;
    }
    else if(this._camera.x - 5 > x)
    {
      this._camera.x -= 5;
    }
    else{
      this._camera.x = x
    }
    if(this._angle < angle)
    {
      this._angle += this._angle * 0.011;
    }
    else if(this._angle > angle)
    {
      this._angle = angle;
    }
    if(this._fov < zoom)
    {
      this._fov += this._fov * 0.01;
    }
    else
    {
      slotMachine.priority = 10000;
    }
    if(this._camera.y > y - 1 && this._camera.y < y + 1)
    {
      this._camera.y = y;
    }
    else if(this._camera.y < y)
    {
      this._camera.y += 2;
    }
    else if(this._camera.y > y)
    {
      this._camera.y -= 2;
    }

    if(this._camera.position.z > z - 0.3 && this._camera.position.z < z + 0.3)
    {
      this._camera.position.z = z;
    }
    else if(this._camera.position.z < z)
    {
      this._camera.position.z += 0.2;
    }
    else if(this._camera.position.z > z)
    {
      this._camera.position.z -= 0.2;
    }
  }

  rotateMap() {
    if(this._angle < 0) this._angle = 0.001
    const max = 30 / 360 * 2 * Math.PI;
    if(this._camera.position.z !== 0)
    {
      this._camera.position.z -= this._camera.position.z * 0.05;
    }
    if(this._angle > max - 0.01 && this._angle < max + 0.01)
    {
      this._angle = max;
    }
    else{
      this._angle -= (this._angle - max) * 0.005 / Math.abs(this._angle -max);
    }

  }

  zoomOut() : boolean
  {
    if(this._fov - 0.1 > this._gameFov || this.fov  + 0.1 < this._gameFov)
    {
      let dt = 1;
      if(!this._deltaTime) dt = 1;
      else if(this._deltaTime > 50) dt = 50;
      else dt = this._deltaTime
    const df = (this._fov - this._gameFov) * 0.01 / Math.abs(this._fov - this._gameFov) * Math.abs(this._fov) * dt / 5
    console.log(this._fov)
    if(this._fov - df < 0) this._fov = 0.1
    else this._fov -= df
    this._camera.fov = this._fov
    }
    else
    {
      this._fov = this._gameFov
      this._camera.fov = this._gameFov
      return true;
    }
    return false;

  }

  updateFPS() {
    const now = performance.now();
       this._deltaTime = now - this._lastFrameTime;
       this._lastFrameTime = now;
       if (this._deltaTime === 0) {
           this._deltaTime = 1; // Vermeidet Division durch 0 bei sehr schnellen Frames
       }
       this._fps = 1000 / this._deltaTime;
  }


  get renderingBuffer() {
    return this._renderingBuffer;
  }

  set angle(value: number) {
    this._angle = value;
  }

  get angle(): number {
    return this._angle;
  }

  get xOffset(): number {return this._xOffset}
  get yOffset(): number {return this._yOffset}

  get fov(): number {return this._fov}
  set gameFov(value: number) {
    this._gameFov = value;
  }
  get gameFov(): number {return this._gameFov}

  get deltaTime(): number {return this._deltaTime}

  get rotationZ(): number {return this._rotationZ}

  get fps(): number {return this._fps }

  get camera(): Camera { return this._camera }

}
