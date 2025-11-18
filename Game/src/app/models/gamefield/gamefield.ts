import { Field, GameField, FieldObjects } from "../../interfaces/field";

export class Gamefield {
    gamefield: GameField;

    constructor()
    {
        const cols = 10;
        const rows = 15;
        const fieldSize = 50;
        

        const grid: FieldObjects[][] = [];
        for (let i = 0; i < cols; i++)
        {
            grid[i] = [];
            for(let j = 0; j < rows; j++)
            {
                grid[i][j] = {  // jede Gridposition enthält ein Array an Objekten
                    objects: [{
                        name: "floor", 
                        img: "/images/StoneFloorTexture.png", 
                        x: i, 
                        y: j,
                        isWalkable: true
                    }]
                };
            }
            
        }

        grid[5][5].objects = [
            {
                name: "wall",
                img: "/images/wall.png",
                x: 5,
                y: 5,
                isWalkable: false
            }
        ]

        grid[6][5].objects = [
            {
                name: "wall",
                img: "/images/wall.png",
                x: 6,
                y: 5,
                isWalkable: false
            }
        ]

        grid[2][8].objects = [
            {
                name: "wall",
                img: "/images/wall.png",
                x: 2,
                y: 8,
                isWalkable: false
            }
        ]
        
        this.gamefield = {
            fieldSize: fieldSize,
            cols: cols,
            rows: rows,
            grid: grid
        };
    }

}
