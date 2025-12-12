import { RenderingService } from "../../services/rendering.service";
import { Coordinates } from "../coordinates/coordinates";

export class Camera {

    private _position: Coordinates; // Koordinaten vom mittelpunkt der kamera zu Weltkoordinaten
    private _fov: number;

    constructor(position: Coordinates, fov: number) {
        this._position = position;
        this._fov = fov;
    }

    get position(): Coordinates { return this._position;}

    set position(v: Coordinates) {this._position = v;}

    get fov(): number { return this._fov;}

    set fov(v: number) { this._fov = v}

    get x(): number { return this._position.x}
    
    get y(): number { return this._position.y }

    set x(v: number) { this._position.x =  v }
    
    set y(v: number) { this._position.y = v }

}