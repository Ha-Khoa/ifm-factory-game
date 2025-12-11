
import { Machine } from "../machine/machine";
import { RenderObject } from "../rendering/render-object";
import { RenderingService } from "../../services/rendering.service";
import { ConveyorBelt } from "../conveyor-belt/conveyor-belt";

/**
 * Gamefield-Klasse: Verwaltet das Spielfeld mit Umgebungsobjekten und interaktiven Objekten.
 * Generiert Böden, Wände und Maschinen.
 */
export class Gamefield {
    
    // Umgebungsobjekte (Böden)
    environmetObjects!: RenderObject[];
    // Interaktive Objekte (Wände, Maschinen)
    interactableObjects!: RenderObject[];
    // Größe eines einzelnen Feldes in Pixeln
    fieldsize!: number;
    // Anzahl der Reihen
    rows!: number;
    // Anzahl der Spalten
    cols!: number;

    
    constructor()
    {
        this.environmetObjects = [];
        this.interactableObjects = [];
        this.fieldsize = 64;
        this.cols = 30;
        this.rows = 19;
        this.generateEnvironment();
        this.generateInteractableObjects();

    }

    /**
     * Fügt alle Spielfeld-Objekte zum Rendering-Buffer hinzu.
     */
    addGameFieldToRenderingBuffer()
  {
    // Erst Umgebungsobjekte (Böden) hinzufügen
    for (let i = 0; i < this.environmetObjects.length; i++) {
      this.renderField(i, false);
    }
    // Dann interaktive Objekte (Wände, Maschinen) hinzufügen
    for (let i = 0; i < this.interactableObjects.length; i++) {
      this.renderField(i, true);
    }
  }

  /**
   * Rendert ein einzelnes Feld (Umgebung oder interaktives Objekt) auf das Canvas.
   * @param x Index des Objekts
   * @param interactable true für interaktive Objekte, false für Umgebung
   */
  renderField(x: number, interactable: boolean) {
    let Obj;
    // Wähle das richtige Objekt-Array
    if (interactable) {
      Obj = this.interactableObjects[x];
    } else {
      Obj = this.environmetObjects[x];
    }
    RenderingService.instance().addRenderObject(Obj);
  }

  addToInteractableObjects(obj: RenderObject)
  {
    this.interactableObjects.push(obj);
  }

    /**
     * Generiert die Umgebung (Boden) als ein großes Rechteck.
     */
    generateEnvironment()
    {
        for(let i = 0; i < this.rows + 1; i++)
        {
            for(let j = 0; j < this.cols; j++)
            {
                this.environmetObjects.push(new RenderObject(
                    `floor-${i}-${j}`,
                    "rect",
                    j * this.fieldsize,
                    i * this.fieldsize,
                    0,
                    this.fieldsize,
                    this.fieldsize,
                    -1000,
                    "/images/Metal_16-512x512.png",
                    undefined,
                    "#000000aa",
                    []
                ))
            }
        }
        for(let i = 0; i < (this.rows + 1) * 8; i++)
        {
            for(let j = 0; j < this.cols; j++)
            {
                this.environmetObjects.push(new RenderObject(
                    `floor2-${i}-${j}`,
                    "rect",
                    j * this.fieldsize,
                    i * this.fieldsize / 8,
                    0,
                    this.fieldsize,
                    0.1,
                    -1000,
                    "/images/Metal_16-512x512.png",
                    undefined,
                    "#686767aa",
                    []
                ))
            }
        }
    }

    /**
     * Generiert alle interaktiven Objekte (Wände) auf dem Spielfeld.
     * Erstellt verschiedene Wandsegmente an festen Positionen.
     */
    generateInteractableObjects()
    {
    const rectColor = "#FFE797";
    const layerColors = ["#FCB53B","#aa6a17ff"]
            
        
    for(let i = 0; i < 10; i++)
    {
        this.interactableObjects.push(new RenderObject(
            `table-${i}`,
            "rect",
            i * this.fieldsize,
            10 * this.fieldsize,
            50,
            this.fieldsize,
            this.fieldsize,
            0,
            undefined,
            undefined,
            rectColor,
            layerColors
        ))
    }
    for(let i = 0; i < 7; i++)
    {
        this.interactableObjects.push(new RenderObject(
            `table-${i}-2`,
            "rect",
            10 * this.fieldsize,
            (i + 4) * this.fieldsize,
            50,
            this.fieldsize,
            this.fieldsize,
            0,
            undefined,
            undefined,
            rectColor,
            layerColors
        ))
    }

    }

    updateConveyorBelts(conveyorBelts: ConveyorBelt[]): void {
        //Entfernt alte Förderbänder aus den interaktiven Objekten
        this.interactableObjects = this.interactableObjects.filter (obj => !obj.name.startsWith('conveyor-'));

        //Fügt die aktuellen Förderbänder hinzu
        conveyorBelts.forEach(conveyor =>{
            this.interactableObjects.push(conveyor)
            // Stelle sicher, dass neue Förderbänder auch im Renderer landen
            if (!RenderingService.instance().getRenderingObjektByName(conveyor.name)) {
                RenderingService.instance().addRenderObject(conveyor);
            }
        });
    }
}
