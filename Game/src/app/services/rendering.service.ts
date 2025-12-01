import { Hitbox } from "../interfaces/hitbox";
import { RenderObject } from "../models/rendering/render-object"
import { Projection } from "../interfaces/projection";
import { Collision } from "../models/collision/collision";
import { Coordinates } from "../models/coordinates/coordinates";
import { Injectable } from "@angular/core";


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

    // Singleton support
    private static _instance: RenderingService | null = null;


    static instance(): RenderingService {
        if (!this._instance) {
            this._instance = new RenderingService();
        }
        return this._instance;
    }

    

    constructor() {}

    init(ctx: CanvasRenderingContext2D , images: { [key:string]: HTMLImageElement }, angle: number) {
        this._ctx = ctx;
        this._images = images;
        this._angle = angle;
    }

    /**
     * Fügt ein einzelnes RenderObject zum Buffer hinzu und sortiert neu.
     * @param renderObject Das hinzuzufügende Objekt
     */
    addRenderObject(renderObject: RenderObject) {
        this._renderingBuffer.push(renderObject);
        this.sortRenderingBuffer();
    }

    /**
     * Fügt mehrere RenderObjects zum Buffer hinzu und sortiert neu.
     * @param renderObjects Array von hinzuzufügenden Objekten
     */
    addRenderObjects(renderObjects: RenderObject[]) {
        renderObjects.forEach((obj) => {
            this._renderingBuffer.push(obj);
        });
        this.sortRenderingBuffer();
        
    }

    /**
     * Aktualisiert ein bestehendes RenderObject anhand des Namens.
     * @param name Name des zu aktualisierenden Objekts
     * @param renderObject Das neue RenderObject
     */
    updateRenderingObject(name: string, renderObject: RenderObject)
    {
        const index = this._renderingBuffer.findIndex(Obj => Obj.name === name);
        if (index === -1) {
            // Fallback: wenn Objekt nicht existiert, füge es hinzu statt den Buffer zu korrupten
            this.addRenderObject(renderObject);
        } else {
            this._renderingBuffer[index] = renderObject;
            this.sortRenderingBuffer();
        }
    }

    sortRenderingBuffer() {
        this._renderingBuffer.sort((a, b) => (a.y * 10 + a.z * 20 + a.priority * 5) - (b.y * 10 + b.z * 20 + b.priority * 5) );

    }


    /**
     * Sucht ein RenderObject anhand seiner ID.
     * @param id Die ID des gesuchten Objekts
     * @returns Das gefundene Objekt oder undefined
     */
    getRenderingObjektByID(id: number): RenderObject | undefined {
        return this._renderingBuffer.find((obj) => obj.id === id);
    }

    /**
     * Sucht ein RenderObject anhand seines Namens.
     * @param name Der Name des gesuchten Objekts
     * @returns Das gefundene Objekt oder undefined
     */
    getRenderingObjektByName(name: string): RenderObject | undefined {
        return this._renderingBuffer.find((obj) => obj.name === name);
    }

    /**
     * Löscht ein RenderObject anhand seiner ID.
     * @param id Die ID des zu löschenden Objekts
     */
    deleteRenderingObjektByID(id: number): void {
        console.log(this._renderingBuffer.length);
        this._renderingBuffer = this._renderingBuffer.filter((obj) => obj.id !== id);
        console.log(this._renderingBuffer.length);
    }

    /**
     * Löscht ein RenderObject anhand seines Namens.
     * @param name Der Name des zu löschenden Objekts
     */
    deleteRenderingObjektByName(name: string): void {
        this._renderingBuffer = this._renderingBuffer.filter((obj) => obj.name !== name);
    }

    /**
     * Rendert alle Objekte im Buffer auf das Canvas.
     * Wendet isometrische Projektion an und zeichnet Rechtecke mit 3D-Tiefeneffekt oder Bilder.
     */
    render(): void {
        if (!this._ctx) return;
        this._renderingBuffer.forEach((Obj) => {
            // Berechne isometrische Projektion
            const zTransform = Obj.z * Math.sin(this._angle)
            const yProjection = Obj.y * Math.cos(this._angle) - zTransform
            if(Obj.type === "rect")
            {  
                const layers = Obj.rectLayers!.length;
                for (let i = 0; i < layers; i++)
                {
                    this._ctx.beginPath();
                    this._ctx.fillStyle = Obj.rectLayers![i];
                    this._ctx.rect(
                        Obj.x,
                        (Obj.y + Obj.height) * Math.cos(this._angle) - (Obj.z / layers) * (layers - i) * Math.sin(this._angle),
                        Obj.width,
                        (Obj.z / layers) * (layers - i) * Math.sin(this._angle)
                    );
                    this._ctx.fill();
                }
                this._ctx.beginPath();
                this._ctx.fillStyle = Obj.rectColor!;
                this._ctx.fillRect(
                    Obj.x, 
                    yProjection,
                    Obj.width,
                    Obj.height  * Math.cos(this._angle) + 1
                );
                this._ctx.fill();
            
            }
            else if (Obj.type === "img")
            {
                this._ctx.drawImage(
                    this._images[Obj.img!],
                    Obj.x,
                    yProjection,
                    Obj.width,
                    Obj.height * Math.cos(this._angle)
                );
                if (Obj.imgWall)
                {
                this._ctx.drawImage( 
                    this._images[Obj.imgWall!],
                    Obj.x,
                    yProjection + Obj.height * Math.cos(this._angle),
                    Obj.width,
                    Obj.z * Math.sin(this._angle)
                );
            }
            }
    });
    }


      /**
   * Erhöht den Winkel für die Projektion.
   */
  async rotateMap()
  {
        // Incrementiere den Winkel leicht pro Frame ohne Timer-Flut
        const max = 30/360*2*Math.PI;
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


    get renderingBuffer()
    {
        return this._renderingBuffer;
    }

    set angle(value: number) {
        this._angle = value;
    }

    get angle(): number {
        return this._angle;
    }
}