import { Hitbox } from "../interfaces/hitbox";
import { RenderObject } from "../models/rendering/render-object"
import { Projection } from "../interfaces/projection";
import { Collision } from "../models/collision/collision";
import { Coordinates } from "../models/coordinates/coordinates";
import { Injectable } from "@angular/core";
import { Direction } from "../enums/direction";
import { ParticleRenderingService } from "./particle-rendering.service";
import { Particles } from "../models/particle/particles";
import { ParticleRenderObject } from "../models/rendering/particle-render-object";
import { Camera } from "../models/camera/camera";
import { Particle } from "../models/particle/particle";


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
  private _cameraRenderingBuffer: RenderObject[] = [];
  // Vorgeladene Bilder für Texturen
  private _images!: { [key: string]: HTMLImageElement };
  // Canvas-Kontext zum Zeichnen
  private _ctx!: CanvasRenderingContext2D;
  // Winkel für isometrische Projektion
  private _angle!: number;

  private _fps!: number;

  private _lastFrameTime!: number;

  private _deltaTime!: number;

  private _particleRenderingService!: ParticleRenderingService;

  private _xOffset: number = 0;
  private _yOffset: number = 0;

  private _fov!: number;

  private _camera!: Camera;

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
      // Berechne isometrische Projektion
      // Rechtecke mit Canvas
      const zTransform = this._fov * Obj.z * Math.sin(this._angle)
      const yProjection = this._fov * (Obj.y + this._yOffset / this._fov) * Math.cos(this._angle) - zTransform
      const xObj = this._fov * Obj.x + this._xOffset;
      const objHeight = this._fov * Obj.height;
      const objWidth = this._fov * Obj.width
      if ((Obj.type === "rect")) {
        const layers = Obj.rectLayers!.length;
        for (let i = 0; i < layers; i++) {
          this._ctx.beginPath();
          this._ctx.fillStyle = Obj.rectLayers![i];
          this._ctx.rect(
            Math.round(xObj),
            this._fov * ( (Obj.y + this._yOffset / this._fov + Obj.height) * Math.cos(this._angle) - (Obj.z / layers) * (layers - i) * Math.sin(this._angle) ),
            Math.round(objWidth + 0.49),
            this._fov * (Obj.z / layers) * Math.sin(this._angle) + 1
          );
          this._ctx.fill();
        }
        this._ctx.beginPath();
        this._ctx.fillStyle = Obj.rectColor!;
        this._ctx.fillRect(
          Math.round(xObj),
          yProjection,
          Math.round(objWidth + 0.5),
          objHeight * Math.cos(this._angle) + 1
        );
        this._ctx.fill();

      }
      // Bild mit Wand
      else if (Obj.type === "img") {
        this._ctx.drawImage(
          this._images[Obj.img!],
          Math.round(xObj),
          yProjection,
          objWidth,
          objHeight * Math.cos(this._angle)
        );
        if (Obj.imgWall) {
          this._ctx.drawImage(
            this._images[Obj.imgWall!],
            Math.round(xObj),
            yProjection + Obj.height * Math.cos(this._angle),
            objWidth,
            this._fov * Obj.z * Math.sin(this._angle)
          );
        }
      }
      // Einfaches Bild
      else if (Obj.type === "static Img") {
        if (Obj.img) {
          this._ctx.drawImage(
            this._images[Obj.img!],
            Math.round(xObj),
            yProjection + this._fov *  Obj.height * Math.cos(this._angle),
            objWidth,
            this._fov * Obj.z * Math.sin(this._angle)
          );
        }
      }
      //Animation
      else if (Obj.type === "gif") {
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
            yProjection + this._fov * Obj.height * Math.cos(this._angle),
            objWidth * mirror,
            this._fov * Obj.z * Math.sin(this._angle)
          )
          this._ctx.restore();

        }
      }
      //Partikel
      else if (Obj instanceof ParticleRenderObject && Obj.type === "particle" && Obj.render)
      {

        ParticleRenderingService.instance().render((Obj as ParticleRenderObject).particles, this._deltaTime);
      }
    }
    );
  }

  async rotateMap() {
    await new Promise(r => setTimeout(r, 1000));
    const max = 30 / 360 * 2 * Math.PI;
    if (this._angle < max) {
      this._angle += 0.0012;
      if (this._angle > max) this._angle = max;
    }
  }

  async zoomOut()
  {
    if(this._fov > 2.5)
    {
    const df = Math.sqrt(this._fov) * 0.02
    this._camera.fov -= df
    this._fov -= df
    // Prüft hier ob Kamera Out Of Bounds
    this._camera.x = this._camera.x;
    this._camera.y = this._camera.y;
    }

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

  get deltaTime(): number {return this._deltaTime}
}
