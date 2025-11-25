import { Coordinates } from "../models/coordinates/coordinates";

// Hitbox als Klasse mit Coordinates für Position
export class Hitbox {
    private _position: Coordinates;
    private _width: number;
    private _height: number;

    constructor(position: Coordinates, width: number, height: number) {
        this._position = position;
        this._width = width;
        this._height = height;
    }

    get position(): Coordinates { return this._position; }
    set position(v: Coordinates) { this._position = v; }

    get x(): number { return this._position.x; }
    set x(v: number) { this._position.x = v; }

    get y(): number { return this._position.y; }
    set y(v: number) { this._position.y = v; }

    get width(): number { return this._width; }
    set width(v: number) { this._width = v; }

    get height(): number { return this._height; }
    set height(v: number) { this._height = v; }
}
