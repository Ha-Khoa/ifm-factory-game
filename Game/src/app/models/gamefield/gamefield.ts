
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
        this.fieldsize = 50;
        this.cols = 20;
        this.rows =15;
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
        for(let i = 0; i < this.rows; i++)
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
                    0,
                    undefined,
                    undefined,
                    "#494949ff",
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
        
        
    for (let i = 0; i < 4; i++)
        {
        this.interactableObjects.push(new RenderObject(
            `wall-${4}-${i}`,
            "rect",
            4 * this.fieldsize,
            i * this.fieldsize,
            50,
            this.fieldsize,
            this.fieldsize,
            0,
            undefined,
            undefined,
            "#dddddd",
            ["#b0b0b0","gray","#555555", "#3f3f3fff","#000000"]
        ))
    }
    for (let i = 0; i < 5; i++)
        {
        this.interactableObjects.push(new RenderObject(
            `wall-${i+4}-5`,
            "rect",
            (i + 4)* this.fieldsize,
            5 * this.fieldsize,
            50,
            this.fieldsize,
            this.fieldsize,
            0,
            undefined,
            undefined,
            "#dddddd",
            ["#b0b0b0","gray","#555555", "#3f3f3fff","#000000"]
        ))
    }
    
    this.interactableObjects.push(new RenderObject(
        `wall-7-6`,
        "rect",
        7 * this.fieldsize,
        6 * this.fieldsize,
        50,
        this.fieldsize,
        this.fieldsize,
        0,
        undefined,
        undefined,
        "#dddddd",
        ["#b0b0b0","gray","#555555", "#3f3f3fff","#000000"]
    ))
  
    for (let i = 0; i < 8; i++)
        {
        this.interactableObjects.push(new RenderObject(
            `wall-${i}-8`,
            "rect",
            i * this.fieldsize,
            8 * this.fieldsize,
            50,
            this.fieldsize,
            this.fieldsize,
            0,
            undefined,
            undefined,
            "#dddddd",
            ["#b0b0b0","gray","#555555", "#3f3f3fff","#000000"]
        ))
        }
        this.interactableObjects.push(new RenderObject(
            `wall-5-11`,
            "rect",
            5* this.fieldsize ,
            11 * this.fieldsize,
            50,
            this.fieldsize,
            this.fieldsize,
            0,
            undefined,
            undefined,
            "#dddddd",
            ["#b0b0b0","gray","#555555", "#3f3f3fff","#000000"]
        ))
        this.interactableObjects.push(new RenderObject(
            `wall-a`,
            "rect",
            10 * this.fieldsize,
            11 * this.fieldsize,
            50,
            this.fieldsize,
            this.fieldsize,
            0,
            undefined,
            undefined,
            "#dddddd",
            ["#b0b0b0","gray","#555555", "#3f3f3fff","#000000"]
        ))
        this.interactableObjects.push(new RenderObject(
            `wall-b`,
            "rect",
            10 * this.fieldsize,
            10 * this.fieldsize,
            50,
            this.fieldsize,
            this.fieldsize,
            0,
            undefined,
            undefined,
            "#dddddd",
            ["#b0b0b0","gray","#555555", "#3f3f3fff","#000000"]
        ))
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
