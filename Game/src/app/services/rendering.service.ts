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

  private _particleRenderingService!: ParticleRenderingService;

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
    this._particleRenderingService = new ParticleRenderingService();
    this._particleRenderingService.init(ctx, angle);
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
   * Jetzt mit Schatten-Logik! 🌑
   */
  render(): void {
    if (!this._ctx) return;
    this._renderingBuffer.forEach((Obj) => {
      /*
      // Zeichnet einen Schatten unter alles, was eine Höhe hat (z > 0)
      // --- NEU: Verbesserte Schatten-Logik (Smart Shadows 🧠) ---
      if (Obj.z > 0) {
        this._ctx.save();
        
        // Position am Boden berechnen (Basis-Y projiziert)
        const shadowBaseY = (Obj.y + Obj.height) * Math.cos(this._angle);
        
        this._ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // Schattenfarbe (etwas dunkler für besseren Kontrast)

        if (Obj.type === 'rect') {
            // --- Rechteckiger Schatten für Blöcke/Maschinen ---
            // Zeichnet exakt die Grundfläche des Blocks am Boden nach
            this._ctx.fillRect(
                Obj.x, 
                shadowBaseY, 
                Obj.width, 
                Obj.height * Math.cos(this._angle) // Perspektivisch korrekte Tiefe
            );
        } else {
            // --- Runder Schatten für Spieler & Items ---
            const centerX = Obj.x + Obj.width / 2;
            
            this._ctx.translate(centerX, shadowBaseY);
            this._ctx.beginPath();
            this._ctx.ellipse(
                0, 0,
                Obj.width / 1.6,   // Breite Ellipse
                Obj.width / 3.5,   // Flache Ellipse (wegen Perspektive)
                0, 0, 2 * Math.PI
            );
            this._ctx.fill();
        }
        
        this._ctx.restore();
      }*/
      // ---------------------------------------------------------


      // Berechne isometrische Projektion
      const zTransform = Obj.z * Math.sin(this._angle)
      const yProjection = Obj.y * Math.cos(this._angle) - zTransform
      if ((Obj.type === "rect")) {
        const layers = Obj.rectLayers!.length;
        for (let i = 0; i < layers; i++) {
          this._ctx.beginPath();
          this._ctx.fillStyle = Obj.rectLayers![i];
          this._ctx.rect(
            Obj.x,
            (Obj.y + Obj.height) * Math.cos(this._angle) - (Obj.z / layers) * (layers - i) * Math.sin(this._angle),
            Obj.width,
            (Obj.z / layers) * Math.sin(this._angle) + 1
          );
          this._ctx.fill();
        }
        this._ctx.beginPath();
        this._ctx.fillStyle = Obj.rectColor!;
        this._ctx.fillRect(
          Obj.x,
          yProjection,
          Obj.width,
          Obj.height * Math.cos(this._angle) + 1
        );
        this._ctx.fill();

      }
      else if (Obj.type === "img") {
        this._ctx.drawImage(
          this._images[Obj.img!],
          Obj.x,
          yProjection,
          Obj.width,
          Obj.height * Math.cos(this._angle)
        );
        if (Obj.imgWall) {
          this._ctx.drawImage(
            this._images[Obj.imgWall!],
            Obj.x,
            yProjection + Obj.height * Math.cos(this._angle),
            Obj.width,
            Obj.z * Math.sin(this._angle)
          );
        }
      }
      else if (Obj.type === "static Img")
      {
        if (Obj.img) {
          this._ctx.drawImage(
            this._images[Obj.img!],
            Obj.x,
            yProjection + Obj.height * Math.cos(this._angle),
            Obj.width,
            Obj.z * Math.sin(this._angle)
          );
        }
      }
      else if (Obj.type === "gif"){
        if(Obj.frames && Obj.framesPerSecond && Obj.nextFrame)
        { 
          let mirror = 1;
          this._ctx.save();
          if(Obj.animationDirection === Direction.LEFT)
          {
            mirror = -1;
            this._ctx.scale(-1,1);
          }
          const maxOneFrame = Math.round(this._fps / Obj.framesPerSecond)
          if(maxOneFrame < Obj.singleFrameCount)
          {
            Obj.nextFrame = Obj.frames[(Obj.frameNumber + 1) % Obj.frames.length]
            Obj.frameNumber++;
            Obj.singleFrameCount = 0;
          }
          Obj.singleFrameCount++;
          this._ctx.drawImage(
            this._images[Obj.nextFrame],
            mirror * Obj.x,
            yProjection + Obj.height * Math.cos(this._angle),
            Obj.width * mirror,
            Obj.z * Math.sin(this._angle)
            )
            this._ctx.restore();

        }
      }
      else if (Obj.type === "particle")
      {
        this._particleRenderingService.render((Obj as ParticleRenderObject).particles, this._deltaTime);
      }
    }
    );
  }

  async rotateMap() {
    const max = 30 / 360 * 2 * Math.PI;
    if (this._angle < max) {
      this._angle += 0.0005;
      if (this._angle > max) this._angle = max;
    }

    /*
        if(this.renderer.angle <= 90/360*2*Math.PI && !this.rotationDirection)
        {
        this.renderer.angle+=0.003;
        return;
        }
        else{
          this.rotationDirection = true;
        }
        if(this.renderer.angle >= 0/360*2*Math.PI && this.rotationDirection)
        {
          this.renderer.angle-=0.003;
        }
        else{
          this.rotationDirection = false;
        }
        */
  }

  updateFPS()
  {
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
}