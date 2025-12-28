
import { Machine } from "../machine/machine";
import { RenderObject } from "../rendering/render-object";
import { RenderingService } from "../../services/rendering.service";
import { ConveyorBelt } from "../conveyor-belt/conveyor-belt";
import { RenderType } from "../../enums/render-type";
import { PrepMachine } from "../preProcess/prep-machine";

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
    static fieldsize: number = 50;
    // Anzahl der Reihen
    static rows: number = 19;
    // Anzahl der Spalten
    static cols: number = 30;


    
    constructor()
    {
      console.log(window.innerHeight)
        this.environmetObjects = [];
        this.interactableObjects = [];
        //Gamefield.fieldsize = Math.round(window.innerWidth / this.cols);
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
        for(let i = 0; i < Gamefield.rows + 1; i++)
        {
            for(let j = 0; j < Gamefield.cols; j++)
            {
                this.environmetObjects.push(new RenderObject(
                    `floor-${i}-${j}`,
                    RenderType.RECT,
                    j * Gamefield.fieldsize,
                    i * Gamefield.fieldsize,
                    0,
                    Gamefield.fieldsize,
                    Gamefield.fieldsize,
                    -1000,
                    "/images/Metal_16-512x512.png",
                    undefined,
                    "#464646ff",
                    []
                ))
            }
        }
        for(let i = 0; i < (Gamefield.rows + 1) * 8; i++)
        {

                this.environmetObjects.push(new RenderObject(
                    `floor2-${i}`,
                    RenderType.RECT,
                    0,
                    i * Gamefield.fieldsize / 8,
                    0,
                    Gamefield.cols * Gamefield.fieldsize,
                    0.1,
                    -1000,
                    "/images/Metal_16-512x512.png",
                    undefined,
                    "#686767ff",
                    []
                ))
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
    const priority = 90;
        
    for(let i = 0; i < 10; i++)
    {
        this.interactableObjects.push(new RenderObject(
            `table-${i}`,
            RenderType.RECT,
            i * Gamefield.fieldsize,
            10 * Gamefield.fieldsize,
            Gamefield.fieldsize,
            Gamefield.fieldsize,
            Gamefield.fieldsize,
            priority,
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
            RenderType.RECT,
            10 * Gamefield.fieldsize,
            (i + 4) * Gamefield.fieldsize,
            Gamefield.fieldsize,
            Gamefield.fieldsize,
            Gamefield.fieldsize,
            priority,
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

    updatePrepMachines(prepMachines: PrepMachine[]): void {
        //Entfernt alte PrepMachines aus den interaktiven Objekten
        this.interactableObjects = this.interactableObjects.filter (obj => !obj.name.startsWith('PrepMachine_'));

        //Fügt die aktuellen PrepMachines hinzu
        prepMachines.forEach(machine =>{
            console.log('Adding PrepMachine to gamefield:', machine.name, 'color:', machine.rectColor);
            this.interactableObjects.push(machine)
            // Stelle sicher, dass neue PrepMachines auch im Renderer landen
            if (!RenderingService.instance().getRenderingObjektByName(machine.name)) {
                console.log('Adding PrepMachine to renderer:', machine.name);
                RenderingService.instance().addRenderObject(machine);
            } else {
                console.log('PrepMachine already in renderer:', machine.name);
            }
        });
        console.log('Total interactable objects:', this.interactableObjects.length);
    }

    
}
 
}
