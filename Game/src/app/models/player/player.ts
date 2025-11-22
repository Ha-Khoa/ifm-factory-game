import { Product } from "../../interfaces/product";

export class Player {

    private _x: number;
    private _y: number;
    private _img: string;
    private _width: number;
    private _height: number;
    private _velocity: number;
    private _inventory: Product | null = null;
    
    constructor(x: number, y: number, img: string, width: number, height: number, velocity: number)
    {
        this._x = x;
        this._y = y;
        this._img = img;
        this._width = width;
        this._height = height;
        this._velocity = velocity;
    }

    pickUpProduct(product: Product)
    {
        this._inventory = product;
    }
    
    dropProduct(): Product | null
    {
        const droppedProduct = this._inventory;
        this._inventory = null;
        return droppedProduct;
    }

    // Getters / Setters - only add setters where it makes sense
    get x(): number { return this._x; }
    set x(v: number) { this._x = v; }

    get y(): number { return this._y; }
    set y(v: number) { this._y = v; }

    get img(): string { return this._img; }
    set img(v: string) { this._img = v; }

    // width/height are considered fixed for a player instance -> read-only
    get width(): number { return this._width; }

    get height(): number { return this._height; }

    get velocity(): number { return this._velocity; }
    set velocity(v: number) { this._velocity = v; }

    get inventory(): Product | null { return this._inventory; }
    set inventory(v: Product | null) { this._inventory = v; }

}
