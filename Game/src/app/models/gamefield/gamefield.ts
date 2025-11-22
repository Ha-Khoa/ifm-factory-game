
import { Machine } from "../machine/machine";
import { RenderObject } from "../rendering/render-object";

export class Gamefield {
    
    environmetObjects!: RenderObject[];
    interactableObjects!: RenderObject[];
    fieldsize!: number;
    rows!: number;
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


    updateMachines(machines: Machine[])
    {
        this.interactableObjects = [];
        this.generateInteractableObjects();
        machines.forEach(machine => {
            const imgMachine = machine.unlocked ? machine.imgUnlocked : machine.imgLocked;
            this.interactableObjects.push(new RenderObject(
                machine.name,
                "img",
                machine.x,
                machine.y,
                50,
                this.fieldsize,
                this.fieldsize,
                imgMachine,
                imgMachine
            ));
        });
    }

    generateEnvironment()
    {
        for(let i = 0; i < this.cols; i++)
        {
            for (let j = 0; j < this.rows; j++)
            {
                this.environmetObjects.push(new RenderObject(
                    `floor-${i}-${j}`,
                    "img",
                    i * this.fieldsize,
                    j * this.fieldsize,
                    -1,
                    this.fieldsize,
                    this.fieldsize,
                    "/images/Concrete-Floor-Tile.png"
                ))

            }
        }
    }

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
            undefined,
            undefined,
            "#dddddd",
            ["#b0b0b0","gray","#555555", "#3f3f3fff","#000000"]
        ))
    }
}
