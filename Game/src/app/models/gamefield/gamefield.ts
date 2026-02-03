
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
    static rows: number = 30;
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
        this.environmetObjects.push(new RenderObject(
                    `plant-1`,
                    RenderType.IMG,
                    1.1 * Gamefield.fieldsize,
                    25.4 * Gamefield.fieldsize,
                    0,
                    0.7 * Gamefield.fieldsize,
                    1.5 * Gamefield.fieldsize,
                    -500, // Draw priority
                    "/images/temp/plant.png",
                    undefined
                ));
        this.environmetObjects.push(new RenderObject(
                    `plant-2`,
                    RenderType.IMG,
                    4.2 * Gamefield.fieldsize,
                    25.4 * Gamefield.fieldsize,
                    0,
                    0.7 * Gamefield.fieldsize,
                    1.5 * Gamefield.fieldsize,
                    -500, // Draw priority
                    "/images/temp/plant.png",
                    undefined
                ));
        // Generate procedural floor with a checkerboard pattern
        for(let i = 0; i < Gamefield.rows + 1; i++)
        {
            for(let j = -1; j < Gamefield.cols; j++)
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
                    -30000, // Draw priority
                    undefined, // No image path
                    undefined,
                    tileColor, // Assign procedural color
                    []
                ));
            }
        }

        const lineColor = '#2a2a2a'; // Dark color for the "seams"

        // Generate horizontal grid lines
        for(let i = -1; i < Gamefield.rows + 1; i++)
        {
            this.environmetObjects.push(new RenderObject(
                `line-h-${i}`,
                RenderType.RECT,
                0,
                i * Gamefield.fieldsize,
                1, // z-index slightly above the floor to ensure visibility
                Gamefield.cols * Gamefield.fieldsize,
                2, // Line thickness
                -2000,
                undefined,
                undefined,
                lineColor,
                []
            ));
        }

        // Generate vertical grid lines
        for(let j = -1; j < Gamefield.cols + 1; j++)
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
                    "#202020",
                    ["#181818"]
                ));
        }
        const linecolor = "#dddda9ff";
        this.environmetObjects.push(new RenderObject(
            `line-1`,
            RenderType.RECT,
            9 * Gamefield.fieldsize,
            28 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 10,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            9 * Gamefield.fieldsize,
            25 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize * 7,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            9 * Gamefield.fieldsize,
            25 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize * 7,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            16 * Gamefield.fieldsize-4,
            15 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 10,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            15 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 13 + 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            15 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 10,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            13 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize * 10,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            13 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize * 10,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            13 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize * 10,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            9 * Gamefield.fieldsize,
            15 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 7,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            9 * Gamefield.fieldsize,
            15 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 2,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            8 * Gamefield.fieldsize - 4,
            15 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 2 + 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            8 * Gamefield.fieldsize,
            17 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize + 4,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            6 * Gamefield.fieldsize,
            15 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            9 * Gamefield.fieldsize,
            11 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 2,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            8 * Gamefield.fieldsize - 4,
            11 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 2 + 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            8 * Gamefield.fieldsize,
            11 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize + 4,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            6 * Gamefield.fieldsize,
            13 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            9 * Gamefield.fieldsize,
            13 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize * 7,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            6 * Gamefield.fieldsize,
            15 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 6,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize,
            21 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 4 + 4,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize - 4,
            20 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize + 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize - 4,
            20 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            4 * Gamefield.fieldsize - 4,
            16 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))


        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize,
            16 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize - 4,
            15 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize + 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize - 4,
            15 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            4 * Gamefield.fieldsize - 4,
            11 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))


        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize,
            11 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize - 4,
            10 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize + 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize - 4,
            10 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            4 * Gamefield.fieldsize - 4,
            6 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))


        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize - 4,
            6 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize - 4,
            5 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize + 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize - 4,
            5 * Gamefield.fieldsize - 4,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))

        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            6 * Gamefield.fieldsize,
            4 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 9,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            4 * Gamefield.fieldsize - 4,
            4 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize,
            4 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            6 * Gamefield.fieldsize,
            4 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            8 * Gamefield.fieldsize - 4,
            4 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 2,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            9 * Gamefield.fieldsize,
            4 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 2 + 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            8 * Gamefield.fieldsize - 4,
            6 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize + 4,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            9 * Gamefield.fieldsize,
            4 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 7,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            16 * Gamefield.fieldsize - 4,
            4 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 9,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            4 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            8 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 5,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            8 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 3,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            5 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 3,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            4 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            19 * Gamefield.fieldsize,
            4 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 2,
            4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            21 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 2 + 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            20 * Gamefield.fieldsize - 4,
            2 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize ,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            20 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            15 * Gamefield.fieldsize,
            3 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 5,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))


        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            14 * Gamefield.fieldsize - 4,
            2 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            15 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize ,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            14 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))

        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            10 * Gamefield.fieldsize - 4,
            2 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            11 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize ,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            10 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            11 * Gamefield.fieldsize,
            3 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 3,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))


        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            6 * Gamefield.fieldsize - 4,
            2 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            7 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize ,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            6 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            7 * Gamefield.fieldsize,
            3 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 3,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))


        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize - 4,
            2 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 2 + 4,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            3 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize ,
            0,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            2 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            3 * Gamefield.fieldsize,
            3 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 3,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))

        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            22 * Gamefield.fieldsize - 4,
            1 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            22 * Gamefield.fieldsize - 4,
            8 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            22 * Gamefield.fieldsize,
            1 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 6,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            22 * Gamefield.fieldsize - 4,
            12 * Gamefield.fieldsize,
            0,
            Gamefield.fieldsize * 6 + 4,
            4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))
        this.environmetObjects.push(new RenderObject(
            `line`,
            RenderType.RECT,
            28 * Gamefield.fieldsize,
            1 * Gamefield.fieldsize,
            0,
            4,
            Gamefield.fieldsize * 11 + 4,
            -100,
            undefined,
            undefined,
            linecolor,
            []
        ))
        

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

        this.interactableObjects.push(new RenderObject(
            `tisch`,
            RenderType.THREE_D_IMG,
            2 * Gamefield.fieldsize,
            27 * Gamefield.fieldsize,
            50,
            2 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            priority,
            "/images/tisch.png",
            undefined
        ))
        this.interactableObjects.push(new RenderObject(
            `sofa`,
            RenderType.THREE_D_IMG,
            2 * Gamefield.fieldsize,
            25.8 * Gamefield.fieldsize,
            50,
            2 * Gamefield.fieldsize,
            1 * Gamefield.fieldsize,
            priority,
            "/images/sofa.png",
            undefined
        ))
        this.environmetObjects.push(new RenderObject(
            `chef`,
            RenderType.CARD_BOARD,
            6.5 * Gamefield.fieldsize,
            0 * Gamefield.fieldsize,
            80,
            0.8 * Gamefield.fieldsize,
            1.2 * Gamefield.fieldsize,
            0,
            "/images/chef.png",
            undefined
        ))
        this.environmetObjects.push(new RenderObject(
            `chef2`,
            RenderType.CARD_BOARD,
            7.6 * Gamefield.fieldsize,
            0 * Gamefield.fieldsize,
            80,
            0.8 * Gamefield.fieldsize,
            1.2 * Gamefield.fieldsize,
            0,
            "/images/chef2.png",
            undefined
        ))
        this.environmetObjects.push(new RenderObject(
            `cocain`,
            RenderType.CARD_BOARD,
            6.5 * Gamefield.fieldsize,
            0 * Gamefield.fieldsize,
            63,
            0.3 * Gamefield.fieldsize,
            0.3 * Gamefield.fieldsize,
            100,
            "/images/cocain.png",
            undefined
        ))
        this.environmetObjects.push(new RenderObject(
            `cocain`,
            RenderType.CARD_BOARD,
            7.9 * Gamefield.fieldsize,
            0 * Gamefield.fieldsize,
            62,
            0.9 * Gamefield.fieldsize,
            0.4 * Gamefield.fieldsize,
            100,
            "/images/joint.png",
            undefined
        ))


    for(let i = 15; i < Gamefield.rows; i++)
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
    for(let i = 0; i < 13; i++)
    {
        this.interactableObjects.push(new RenderObject(
            `table-${i}-4`,
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
    for(let i = 0; i < 9; i++)
    {
        this.interactableObjects.push(new RenderObject(
            `table-${i}-1`,
            RenderType.RECT,
            i * Gamefield.fieldsize,
            23  * Gamefield.fieldsize,
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
    for(let i = 28; i < 30; i++)
    {
        this.interactableObjects.push(new RenderObject(
            `table`,
            RenderType.RECT,
            8 * Gamefield.fieldsize,
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
    for(let i = 23; i < 25; i++)
    {
        this.interactableObjects.push(new RenderObject(
            `table`,
            RenderType.RECT,
            8 * Gamefield.fieldsize,
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
    for(let i = 0; i < 5; i++)
    {
    this.interactableObjects.push(new RenderObject(
            `server`,
            RenderType.THREE_D_IMG,
            (11 + i) * Gamefield.fieldsize,
            12 * Gamefield.fieldsize,
            80,
            Gamefield.fieldsize,
            Gamefield.fieldsize,
            0,
            "/images/temp/server.png"
        ))
    }

    this.interactableObjects.push(new RenderObject(
            `robotArm`,
            RenderType.THREE_D_IMG,
            19.5 * Gamefield.fieldsize,
            10 * Gamefield.fieldsize,
            200,
            Gamefield.fieldsize * 2,
            Gamefield.fieldsize,
            -550,
            "/images/temp/robotArm.png"
        ))
    this.interactableObjects.push(new RenderObject(
            `robotArm`,
            RenderType.THREE_D_IMG,
            6.5 * Gamefield.fieldsize,
            19 * Gamefield.fieldsize,
            200,
            Gamefield.fieldsize * 2,
            Gamefield.fieldsize,
            -550,
            "/images/temp/robotArm.png"
        ))

    this.interactableObjects.push(new RenderObject(
            `car`,
            RenderType.THREE_D_IMG,
            3.75 * Gamefield.fieldsize,
            2 * Gamefield.fieldsize,
            50,
            Gamefield.fieldsize * 1.75,
            Gamefield.fieldsize * 0.75,
            100,
            "/images/temp/car.png"
        ))
     this.interactableObjects.push(new RenderObject(
            `toolBox`,
            RenderType.THREE_D_IMG,
            20.15 * Gamefield.fieldsize,
            4.4 * Gamefield.fieldsize,
            35,
            Gamefield.fieldsize * 0.8,
            Gamefield.fieldsize * 0.4,
            150,
            "/images/temp/toolBox.png"
        ))
    this.interactableObjects.push(new RenderObject(
            `tischUndStuehle`,
            RenderType.THREE_D_IMG,
            23 * Gamefield.fieldsize,
            25 * Gamefield.fieldsize,
            50,
            Gamefield.fieldsize * 2,
            Gamefield.fieldsize * 1,
            150,
            "/images/temp/tischUndStuhl.png"
        ))
    this.interactableObjects.push(new RenderObject(
            `tischUndStuehle`,
            RenderType.THREE_D_IMG,
            23 * Gamefield.fieldsize,
            20 * Gamefield.fieldsize,
            50,
            Gamefield.fieldsize * 2,
            Gamefield.fieldsize * 1,
            150,
            "/images/temp/tischUndStuhl.png"
        ))
    
    this.interactableObjects.push(new RenderObject(
            `lampe`,
            RenderType.THREE_D_IMG,
            18.7 * Gamefield.fieldsize,
            19.7 * Gamefield.fieldsize,
            100,
            Gamefield.fieldsize * 1,
            Gamefield.fieldsize * 1,
            150,
            "/images/temp/lamp.png"
        ))


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


