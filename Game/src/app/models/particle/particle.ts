import { Coordinates } from "../coordinates/coordinates";

export class Particle {

    private static lastId : number = 0;
    private _id : number;
    private _x : number;
    private _y : number;
    private _z : number;
    private _vx : number;
    private _vy : number;
    private _vz : number;
    private _lifeTime: number;
    private _age: number;
    private _size: number;
    private _color: string;
    private _type: string;
    private _worldCoordinates: Coordinates;
    
    constructor(x: number, y: number, z: number,
                vx: number, vy: number, vz: number,
                lifeTime: number, size: number,
                color: string, type: string) 
    {
        this._id = Particle.lastId++;
        this._x = x;
        this._y = y;
        this._z = z;
        this._vx = vx;
        this._vy = vy;
        this._vz = vz;
        this._lifeTime = lifeTime;
        this._age = 0;
        this._size = size;
        this._color = color;
        this._type = type;
        this._worldCoordinates = new Coordinates(x, y)
    }

    get id(): number { return this._id; }
    get x(): number { return this._x; }
    get y(): number { return this._y; }
    get z(): number { return this._z; }
    get vx(): number { return this._vx; }
    get vy(): number { return this._vy; }
    get vz(): number { return this._vz; }
    get lifeTime(): number { return this._lifeTime; }
    get age(): number { return this._age; }
    get size(): number { return this._size; }
    get color(): string { return this._color; }
    get type(): string { return this._type; }
    get worldCoordinates(): Coordinates { return this._worldCoordinates }
    set worldCoordinates(v: Coordinates) { this._worldCoordinates = v; }

    set x(v: number) { this._x = v; }
    set y(v: number) { this._y = v; }
    set z(v: number) { this._z = v; }
    set vx(v: number) { this._vx = v; }
    set vy(v: number) { this._vy = v; }
    set vz(v: number) { this._vz = v; }
    set lifeTime(v: number) { this._lifeTime = v; }
    set age(v: number) { this._age = v; }
    set size(v: number) { this._size = v; }
    set color(v: string) { this._color = v; }
    set type(v: string) { this._type = v; } 

}
