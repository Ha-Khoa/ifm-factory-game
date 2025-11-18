
export interface GameField {
    fieldSize: number;
    cols: number;
    rows : number;
    readonly grid: readonly FieldObjects[][];
}

export interface FieldObjects {
    objects: Field[];
}

export interface Field {
    name: string;
    img: string; 
    x: number;
    y: number;
    isWalkable: boolean;
}