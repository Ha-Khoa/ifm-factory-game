import { EnvironmentInjector } from "@angular/core";
import { Field } from "../../interfaces/field";

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
