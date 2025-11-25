import { Hitbox } from "../../interfaces/hitbox";

/**
 * RenderObject-Klasse: Repräsentiert ein zu renderndes Objekt mit Position, Größe und Darstellungsinformationen.
 * Kann entweder als Rechteck (mit 3D-Tiefeneffekt) oder als Bild gerendert werden.
 */
export class RenderObject {

    // Statischer Zähler für eindeutige IDs
    private static lastID: number = 0;
    // Eindeutige ID des Objekts
    private _id!: number;
    // Name des Objekts (z.B. "player", "wall-1-2")
    private _name!: string;
    // Typ: "rect" oder "img"
    private _type!: string;
    // X-Position in Weltkoordinaten
    private _x!: number;
    // Y-Position in Weltkoordinaten
    private _y!: number;
    // Z-Position (Höhe) in Weltkoordinaten
    private _z!: number;
    // Render-Priorität (höher = später gerendert = im Vordergrund)
    private _priority!: number;
    // Breite in Pixeln
    private _width!: number;
    // Höhe in Pixeln
    private _height!: number;
    // Bild-Pfad (für type="img")
    private _img!: string | void;
    // Wand-Bild-Pfad (für 3D-Effekt bei type="img")
    private _imgWall!: string | void;
    // Rechteck-Farbe (für type="rect")
    private _rectColor!: string | void;
    // Layer-Farben für 3D-Tiefeneffekt (für type="rect")
    private _rectLayers!: string[] | void;

    constructor(name: string, type: string, x: number, y: number, z: number, width: number, height: number, priority: number, img?: string, imgWall?: string, rectColor?: string, rectLayers?: string[])
    {
        this._id = RenderObject.lastID++;
        this._name = name;
        this._type = type;
        this._x = x;
        this._y = y;
        this._z = z;
        this._width = width;
        this._height = height;
        this._img = img;
        this._imgWall = imgWall;
        this._rectColor = rectColor;
        this._rectLayers = rectLayers;
        this._priority = priority;
    }

    // get / set Methoden
    get id(): number { return this._id; }

    get name(): string { return this._name; }
    set name(v: string) { this._name = v; }

    get type(): string { return this._type; }
    set type(v: string) { this._type = v; }

    get x(): number { return this._x; }
    set x(v: number) { this._x = v; }

    get y(): number { return this._y; }
    set y(v: number) { this._y = v; }

    get z(): number { return this._z; }
    set z(v: number) { this._z = v; }

    get width(): number { return this._width; }
    set width(v: number) { this._width = v; }

    get height(): number { return this._height; }
    set height(v: number) { this._height = v; }

    get img(): string | void { return this._img; }
    set img(v: string | void) { this._img = v; }

    get imgWall(): string | void { return this._imgWall; }
    set imgWall(v: string | void) { this._imgWall = v; }

    get rectColor(): string | void { return this._rectColor; }
    set rectColor(v: string | void) { this._rectColor = v; }

    get rectLayers(): string[] | void { return this._rectLayers; }
    set rectLayers(v: string[] | void) { this._rectLayers = v; } 

    get priority(): number { return this._priority }
    set priority(v: number) { this._priority = v; }
}
