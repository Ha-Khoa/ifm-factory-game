import { RenderingService } from "../../services/rendering.service";
import { Coordinates } from "../coordinates/coordinates";
import { Product } from "../product/product";
import { RenderObject } from "../rendering/render-object";
import { Products } from "../product/products";

export class Package {

    private static _lastId: number = 0;
    private _name: string = "package";
    private _id: number;
    private _position: Coordinates;
    private _size: number;
    private _img: string;
    private _products: Product[] = [];
    private _renderObject: RenderObject;
    private _z: number;

    constructor(position: Coordinates) {
        this._id = Package._lastId++;
        this._position = position;
        this._size = 4/5 * 64;
        this._img = '/images/package.png';
        this._z = 50;
        this._renderObject = new RenderObject(
            `package-${this._id}`,
            'img',
            this._position.x,
            this._position.y,
            this._z,
            this._size,
            this._size,
            220,
            this._img,
            undefined,
            'brown',
            []
        );
        RenderingService.instance().addRenderObject(this._renderObject);
    }


    addProduct(product: Product) {
        this._products.push(product);
    }

    destroy() {
        RenderingService.instance().deleteRenderingObjektByName(this._renderObject.name);
        this._products.forEach(product => product.destroy());
        Products.deleteGeneratedProduct(this);
    }

    get id(): number { return this._id; }

    get position(): Coordinates { 
        this._renderObject.x = this._position.x;
        this._renderObject.y = this._position.y;
        return this._position;
     }

    get name(): string { return this._name; }
    set position(v: Coordinates) { this._position = v;
        this._renderObject.x = v.x;
        this._renderObject.y = v.y;
     }
    get size(): number { return this._size; }
    set size(v: number) { this._size = v; }
    set img(v: string) { this._img = v; }
    get img(): string { return this._img; }
    get products(): Product[] { return this._products; }
    get renderObject(): RenderObject { return this._renderObject; }
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
