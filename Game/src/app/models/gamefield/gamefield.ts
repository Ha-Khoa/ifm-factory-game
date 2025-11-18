import { Field, GameField, FieldObjects } from "../../interfaces/field";

export class Gamefield {
    gamefield: GameField;

    constructor()
    {
        const cols = 10;
        const rows = 20;
        const fieldSize = 50;
        

        const grid: FieldObjects[][] = [];
        for (let i = 0; i < rows; i++)
        {
            grid[i] = [];
            for(let j = 0; j < cols; j++)
            {
                grid[i][j] = {
                    objects: [{
                        name: "floor", 
                        img: "/images/StoneFloorTexture.png", 
                        x: j, 
                        y: i
                    }]
                };
            }
        }
        
        this.gamefield = {
            fieldSize: fieldSize,
            cols: cols,
            rows: rows,
            grid: grid
        };
    }

}
