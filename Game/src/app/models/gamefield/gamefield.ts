
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
                "rect",
                machine.x,
                machine.y,
                50,
                this.fieldsize,
                this.fieldsize,
                0,
                undefined,
                undefined,
                "rgba(200, 206, 255, 1)",
                ["#a0c0ffff", "#8299ffff", "#546effff", "#2b39ffff", "#0000ffff"]
            ));
        });
    }

    generateEnvironment()
    {
        this.environmetObjects.push(new RenderObject(
            `floor`,
            "rect",
            0,
            0,
            0,
            this.fieldsize * this.cols,
            this.fieldsize * this.rows,
            0,
            undefined,
            undefined,
            "#494949ff",
            []
        ))
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
    }
}
