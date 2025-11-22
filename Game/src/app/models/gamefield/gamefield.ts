
import { Field } from "../../interfaces/field";
import { Machine } from "../machine/machine";

export class Gamefield {
    
    environmetObjects!: Field[];
    interactableObjects!: Field[];
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
            this.interactableObjects.push(
                {
                    name: machine.name,
                    img: imgMachine,
                    x: machine.x,
                    y: machine.y,
                    width: this.fieldsize,
                    height: this.fieldsize
                }
            )
        });
    }

    generateEnvironment()
    {
        for(let i = 0; i < this.cols; i++)
        {
            for (let j = 0; j < this.rows; j++)
            {
                this.environmetObjects.push({
                    name: "floor",
                    img: "/images/Concrete-Floor-Tile.png",
                    x: i * this.fieldsize,
                    y: j * this.fieldsize,
                    width: this.fieldsize,
                    height: this.fieldsize
                })

            }
        }
    }

    generateInteractableObjects()
    {
        
        
    for (let i = 0; i < 5; i++)
        {
        this.interactableObjects.push(
            {
                name: "wall",
                img: "/images/wall.png",
                x: 4 * this.fieldsize,
                y: i * this.fieldsize,
                width: this.fieldsize ,
                height: this.fieldsize 
            }
        )
    }
    for (let i = 0; i < 5; i++)
        {
        this.interactableObjects.push(
            {
                name: "wall",
                img: "/images/wall.png",
                x: (i + 4)* this.fieldsize,
                y: 5 * this.fieldsize,
                width: this.fieldsize ,
                height: this.fieldsize 
            }
        )
    }
    
    this.interactableObjects.push(
        {
            name: "wall",
            img: "/images/wall.png",
            x: 7 * this.fieldsize,
            y: 6 * this.fieldsize,
            width: this.fieldsize ,
            height: this.fieldsize 
        }
    )
  
    for (let i = 0; i < 8; i++)
        {
        this.interactableObjects.push(
            {
                name: "wall",
                img: "/images/wall.png",
                x: i * this.fieldsize,
                y: 8 * this.fieldsize,
                width: this.fieldsize ,
                height: this.fieldsize 
            }
        )
        }
        this.interactableObjects.push(
            {
                name: "wall",
                img: "/images/wall.png",
                x: 5* this.fieldsize ,
                y: 11 * this.fieldsize,
                width: this.fieldsize ,
                height: this.fieldsize 
            }
        )
    }
}
