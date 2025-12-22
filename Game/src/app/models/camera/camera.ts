import { RedirectCommand } from "@angular/router";
import { RenderingService } from "../../services/rendering.service";
import { Coordinates } from "../coordinates/coordinates";
import { Gamefield } from "../gamefield/gamefield"


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

    set x(v: number) { 
        // Kamera out of Bounds prüfung
        if(v < window.innerWidth / (this._fov * 2))
        {
            this.position.x = window.innerWidth / (this._fov * 2)
        }
        else if(v > Gamefield.fieldsize * Gamefield.cols - window.innerWidth/ (this._fov * 2)) 
        {
            this.position.x = Gamefield.fieldsize * Gamefield.cols - window.innerWidth/ (this._fov * 2)
        }
        else
        {
        this._position.x =  v
        }
     }
    
    set y(v: number) { 
        // Kamera out of Bounds prüfung
        if(v < window.innerHeight/ (this._fov * 2) + RenderingService.instance().rotationZ / 2)
        {
            this.position.y = window.innerHeight / (this._fov * 2) + RenderingService.instance().rotationZ / 2
        }
        else if(v > Gamefield.fieldsize * Gamefield.rows * Math.cos(30 / 360 * Math.PI) - window.innerHeight/ (this._fov * 2 * Math.cos(30 / 360 * Math.PI)) - RenderingService.instance().rotationZ / 2)
        {
            this.position.y = Gamefield.fieldsize * Gamefield.rows * Math.cos(30 / 360 * Math.PI) -  window.innerHeight/ (this._fov * 2 * Math.cos(30 / 360 * Math.PI)) - RenderingService.instance().rotationZ / 2
        }
        else
        {
        this._position.y =  v
        }
     }

}