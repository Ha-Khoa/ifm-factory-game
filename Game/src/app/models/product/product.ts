import { Coordinates } from "../coordinates/coordinates";
import { RenderObject } from "../rendering/render-object";
import { RenderingService } from "../../services/rendering.service";
import { Gamefield } from "../gamefield/gamefield"
// Removed import of Products to avoid circular dependency with products.ts

export class Product {

  private static lastInstanceId: number = 0; // Eindeutige ID für jede Instanz
  private _instanceId: number;
  private _id: number;
  private _name: string;
  private _position!: Coordinates;
  private _img?: string;
  private _renderObject!: RenderObject;
  private _size: number;
  private _z : number;

  constructor(id: number, name: string, img?: string, z?: number) {
    this._instanceId = Product.lastInstanceId++;
    this._id = id;
    this._name = name;
    this._img = img;
    this._position = new Coordinates(0, 0);
    this._size = 2/5 * Gamefield.fieldsize; // Standardgröße für Produkte
    this._z = z !== undefined ? z : 0;  
    this._renderObject = new RenderObject(
      `product:${this._name}:${this._instanceId}`,
      "img",
      this._position.x,
      this._position.y,
      this._z,
      this._size,
      this._size,
      100,
      this._img,
      undefined,
      "blue",
      []
    );
  }

  init(position: Coordinates) {
    this._position = position;
    this._renderObject.x = position.x;
    this._renderObject.y = position.y;

    RenderingService.instance().addRenderObject(this._renderObject);
  }

  copy(): Product {
    return new Product(this._id, this._name, this._img, this._z);
  }


  destroy() {
    RenderingService.instance().deleteRenderingObjektByName(this._renderObject.name);

  }

  // Getters / Setters
  get id(): number { return this._id; }
  get name(): string { return this._name; }
  get position(): Coordinates { return this._position; }
  set position(v: Coordinates) {
    this._position = v;
    // Automatisch das RenderObject aktualisieren, wenn es existiert
    if (this._renderObject) {
      this._renderObject.x = v.x;
      this._renderObject.y = v.y;
    }
  }
  get img(): string | undefined { return this._img; }
  set img(v: string | undefined) { this._img = v; }
  get renderObject(): RenderObject { return this._renderObject; }
  set renderObject(v: RenderObject) { this._renderObject = v; }
  get size(): number { return this._size; }
  set size(v: number) { this._size = v; }
  get z(): number { return this._renderObject.z; }
  set z(v: number) {
    this._renderObject.z = v;
    this._z = v;
  }
  set x(v: number){
    this._renderObject.x = v;
    this._position.x = v;
  }
  set y(v: number){
    this._renderObject.y = v;
    this._position.y = v;
  }
}
