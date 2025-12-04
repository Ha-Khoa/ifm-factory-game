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

    constructor(position: Coordinates) {
        this._id = Package._lastId++;
        this._position = position;
        this._size = 30;
        this._img = '';
        this._renderObject = new RenderObject(
            `package-${this._id}`,
            'rect',
            this._position.x,
            this._position.y,
            50,
            this._size,
            this._size,
            1000,
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
}
