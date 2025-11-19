import { EnvironmentInjector } from "@angular/core";
import { Field, GameField, FieldObjects } from "../../interfaces/field";

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
        this.cols = 10;
        this.rows =15;
        this.generateEnvironment();
        this.generateInteractableObjects();

    }

    generateEnvironment()
    {
        let floor;
        for(let i = 0; i < this.cols; i++)
        {
            for (let j = 0; j < this.rows; j++)
            {
                this.environmetObjects.push({
                    name: "floor",
                    img: "/images/StoneFloorTexture.png",
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
        this.interactableObjects.push(
             {
                name: "wall",
                img: "/images/wall.png",
                x: 5 * this.fieldsize,
                y: 5 * this.fieldsize,
                width: this.fieldsize,
                height: this.fieldsize
             }
        )
        this.interactableObjects.push(
            {
                name: "wall",
                img: "/images/wall.png",
                x: 6 * this.fieldsize + 10,
                y: 5 * this.fieldsize + 10,
                width: this.fieldsize,
                height: this.fieldsize
            }
        )
        this.interactableObjects.push(
            {
                name: "wall",
                img: "/images/wall.png",
                x: 3 * this.fieldsize + 10,
                y: 3 * this.fieldsize + 30,
                width: this.fieldsize - 10,
                height: this.fieldsize - 10
            }
        )
        for (let i = 0; i < 5; i++)
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
    }
}
