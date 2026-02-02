import { Coordinates } from "../coordinates/coordinates";
import { RenderObject } from "../rendering/render-object";
import { RenderingService } from "../../services/rendering.service";
import { Gamefield } from "../gamefield/gamefield"
import {Products} from './products';
import { RenderType } from "../../enums/render-type";
// Removed import of Products to avoid circular dependency with products.ts

export class Product {

  private static lastInstanceId: number = 0; // Eindeutige ID für jede Instanz
  private _instanceId: number;
  private _id: number;
  private _name: string;
  private _position!: Coordinates;
  private _requires: {productId: number, quantity:number}[] = [];
  private _costs: number = 0;
  private _grants: number = 0; /* The value that u get when the product will be served */
  private _reward: number = 0;
  private _unlocked: boolean = false;
  _img?: string;
  private _renderObject!: RenderObject;
  private _size: number;
  private _z : number;

  constructor(id: number, name: string,grants: number, reward: number, costs: number, unlocked?:boolean, img? :string, z?: number, size?: number);
  constructor(id: number, name: string, grants: number, reward: number, requires: {productId: number, quantity:number}[], unlocked?:boolean, img? :string, z?: number,size?: number);

  constructor(id: number, name: string, grants: number, reward: number, arg5: number | {productId: number, quantity:number}[], unlocked:boolean = false, img? :string, z?: number, size?: number) {

    // Check what type of constructor was called
    if (typeof arg5 === "number") {
      // Variante mit costs
      this._costs = arg5;
    } else if (Array.isArray(arg5)) {
      // Variante mit requires
      this._requires = arg5;
    }

    this._instanceId = Product.lastInstanceId++;
    this._id = id;
    this._name = name;
    this._img = img;
    this._position = new Coordinates(0, 0);
    this._size = !size ? 2/5 * Gamefield.fieldsize : size; // Standardgröße für Produkte
    this._z = z !== undefined ? z : 0;
    this._grants = grants;
    this._reward = reward;
    this._unlocked = unlocked;
    this._renderObject = new RenderObject(
      `product:${this._name}:${this._instanceId}`,
      RenderType.IMG,
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
    if(this._requires.length > 0)
      return new Product(this._id, this._name, this._grants, this._reward, this._requires, this._unlocked, this._img, this._z, this._size);
    return new Product(this._id, this._name, this._grants, this._reward, this._costs, this._unlocked, this._img, this._z, this._size);
  }

  destroy() {
    RenderingService.instance().deleteRenderingObjektByName(this._renderObject.name);
    Products.deleteGeneratedProduct(this);
  }

  unlock() { this.unlocked = true; }

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
      RenderingService.instance().updateRenderingObject(this._renderObject.name, this._renderObject)
    }
  }
  get img(): string | undefined { return this._img; }
  set img(v: string | undefined) { this._img = v; }
  get renderObject(): RenderObject { return this._renderObject; }
  set renderObject(v: RenderObject) { this._renderObject = v
  }
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

  get costs(): number {
    if(this._requires.length > 0){
      let sum = 0;
      this._requires.forEach(requirement => {
        let product = Products.getProductById(requirement.productId);
        sum += product !== undefined ? product.costs * requirement.quantity: 0;
      });
      return sum;
    }
    return this._costs;
  }
  set costs(value: number) { this._costs = value; }
  get grants(): number { return this._grants; }
  set grants(value: number) { this._grants = value; }
  get reward(): number { return this._reward; }
  set reward(value: number) { this._reward = value; }
  get requires(): {productId: number, quantity:number}[] { return this._requires; }
  set requires(value: {productId: number, quantity:number}[]) { this._requires = value; }
  get unlocked(): boolean { return this._unlocked; }
  private set unlocked(value: boolean) { this._unlocked = value; }
}
