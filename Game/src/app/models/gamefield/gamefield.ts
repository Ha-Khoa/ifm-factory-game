import { Field } from "../../interfaces/field";

export class Gamefield {

    readonly gamefield : Field = 
        {
            fieldSize: 50,
            rows: 3,
            cols: 3,
            grid: [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ]

        }
}
