
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
    // PrepMachines
    private prepMachinesList: PrepMachine[] = [];
    // Größe eines einzelnen Feldes in Pixeln
    static fieldsize: number = 50;
    // Anzahl der Reihen
    static rows: number = 19;
    // Anzahl der Spalten
    static cols: number = 35;



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

    generateEnvironment()
    {
        // Generate procedural floor with a checkerboard pattern
        for(let i = 0; i < Gamefield.rows + 1; i++)
        {
            for(let j = 0; j < Gamefield.cols; j++)
            {
                // Use two slightly different shades of grey for a subtle tile effect
                const tileColor = (i + j) % 2 === 0 ? '#3a3a3a' : '#404040';
                this.environmetObjects.push(new RenderObject(
                    `floor-${i}-${j}`,
                    RenderType.RECT,
                    j * Gamefield.fieldsize,
                    i * Gamefield.fieldsize,
                    0, // z-index for the floor
                    Gamefield.fieldsize,
                    Gamefield.fieldsize,
                    -1000, // Draw priority
                    undefined, // No image path
                    undefined,
                    tileColor, // Assign procedural color
                    []
                ));
            }
        }

        const lineColor = '#2a2a2a'; // Dark color for the "seams"

        // Generate horizontal grid lines
        for(let i = 0; i < Gamefield.rows + 1; i++)
        {
            this.environmetObjects.push(new RenderObject(
                `line-h-${i}`,
                RenderType.RECT,
                0,
                i * Gamefield.fieldsize,
                1, // z-index slightly above the floor to ensure visibility
                Gamefield.cols * Gamefield.fieldsize,
                2, // Line thickness
                -999,
                undefined,
                undefined,
                lineColor,
                []
            ));
        }

        // Generate vertical grid lines
        for(let j = 0; j < Gamefield.cols + 1; j++)
        {
            this.environmetObjects.push(new RenderObject(
                `line-v-${j}`,
                RenderType.RECT,
                j * Gamefield.fieldsize,
                0,
                1, // z-index slightly above the floor
                2, // Line thickness
                (Gamefield.rows + 1) * Gamefield.fieldsize,
                -999,
                undefined,
                undefined,
                lineColor,
                []
            ));
        }

        // Generate the back wall without an image
        for(let i = 0; i < Gamefield.cols; i++)
        {
            this.environmetObjects.push(new RenderObject(
                    `wall-${i}`,
                    RenderType.RECT,
                    i * Gamefield.fieldsize,
                    0,
                    600,
                    Gamefield.fieldsize,
                    0.1,
                    -2280,
                    undefined, // No image
                    undefined,
                    "#202020", // Dark solid color for the wall
                    ["#181818"]
                ));
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
    for(let i = 0; i < 10; i++)
    {
        this.interactableObjects.push(new RenderObject(
            `table-${i}-3`,
            RenderType.RECT,
            30 * Gamefield.fieldsize,
            i * Gamefield.fieldsize,
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
    for(let i = 12; i < Gamefield.rows; i++)
    {
        this.interactableObjects.push(new RenderObject(
            `table-${i}-3`,
            RenderType.RECT,
            30 * Gamefield.fieldsize,
            i * Gamefield.fieldsize,
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
            const newObjs = conveyor.renderParts
            for(let obj of newObjs)
            {
                this.interactableObjects.push(obj)
            }
        });
        console.log(this.interactableObjects.length)
    }

    updatePrepMachines(prepMachines: PrepMachine[]): void {
        //Store the PrepMachines for later access
        this.prepMachinesList = prepMachines;
        
        //Entfernt alte PrepMachines aus den interaktiven Objekten
        this.interactableObjects = this.interactableObjects.filter (obj => !(obj instanceof PrepMachine));

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

    public getPrepMachines(): PrepMachine[] {
        return this.prepMachinesList;
    }

    public getAllRenderObjects(): RenderObject[] {
        return [...this.environmetObjects, ...this.interactableObjects];
    }


}
 

