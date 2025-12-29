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
        this._position.x = v;
     }
    
    set y(v: number) { 
        this._position.y = v;
     }

    /**
     * Prüft, ob ein übergebener X-Wert innerhalb des Spielfelds liegt.
     */
    isXInBounds(v: number): boolean {
        const minX = window.innerWidth / (this._fov * 2);
        const maxX = Gamefield.fieldsize * Gamefield.cols - minX;
        return v >= minX && v <= maxX;
    }

    /**
     * Prüft, ob ein übergebener Y-Wert innerhalb des Spielfelds liegt.
     */
    isYInBounds(v: number): boolean {
        const minY = window.innerHeight / (this._fov * 2) / Math.cos(RenderingService.instance().angle);
        const maxY = Gamefield.fieldsize * Gamefield.rows
          - window.innerHeight / (this._fov * 2) / Math.cos(RenderingService.instance().angle)
        return v >= minY && v <= maxY;
    }

    setCameraInBounds() {
        if (!this.isXInBounds(this._position.x)) {
            if (this._position.x < window.innerWidth / (this._fov * 2)) {
                this._position.x = window.innerWidth / (this._fov * 2);
            } else {
                this._position.x = Gamefield.fieldsize * Gamefield.cols - window.innerWidth / (this._fov * 2);
            }
        }

        if (!this.isYInBounds(this._position.y)) {
            if ((this._position.y < window.innerHeight / (this._fov * 2) / Math.cos(RenderingService.instance().angle))) {
                (this._position.y = window.innerHeight / (this._fov * 2) / Math.cos(RenderingService.instance().angle));
            } else {
                this._position.y = Gamefield.fieldsize * Gamefield.rows
                - window.innerHeight / (this._fov * 2) / Math.cos(RenderingService.instance().angle)
            }
        }
    }

}