export class Coordinates{
  static readonly ZERO = new Coordinates(0, 0);

    _x!: number;
    _y!: number;
  constructor(x: number, y: number){
    this._x = x;
    this._y = y;
  }


  add(x:number, y:number):Coordinates;
  add(coordinates: Coordinates):Coordinates;

  add(a:any, b?:any):this {
    if(a instanceof Coordinates){
      this._x += a._x;
      this._y += a._y;
    } else if(typeof a === "number" && b!==null && typeof b === "number"){
      this._x += a;
      this._y += b;
    }
    return this;
  }

  addX(x: number) {
    this._x += x;
  }

  addY(y: number) {
    this._y += y;
  }

  get x(): number{return this._x}
  set x(v: number){ this._x = v;}

  get y(): number{return this._y}
  set y(v: number){ this._y = v;}

  get clone():Coordinates{
    return new Coordinates(this._x, this._y);
  }
}