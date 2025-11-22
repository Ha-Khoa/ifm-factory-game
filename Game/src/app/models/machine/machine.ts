import { timeInterval } from "rxjs/internal/operators/timeInterval";
import { Product } from "../../interfaces/product";
import { input } from "@angular/core";

export class Machine {


    public static Machines: Machine[] = [

    ];


    static lastID: number = 0;
    private _id: number;
    private _unlocked: boolean = false;
    private _imgUnlocked!: string;
    private _imgLocked!: string;
    private _level: number = 1;
    private _x: number;
    private _y: number;
    private _width!: number;
    private _height!: number;
    private _name!: string;
    private _productionRate!: number;
    private _accessDirection!: string;
    private _inventory: Product[] = [];
    private _inputRequirements: Product[] = [];
    private _outputProduct!: Product; //hier muss noch mit Product Klasse ersetzt werden

    constructor(x: number, y: number, width: number, height: number, name: string, imgUnlocked: string, imgLocked: string, accessDirection: string, outputProduct: Product, inputRequirements: Product[])
    {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._id = Machine.lastID++;
        this._name = name;
        this._accessDirection = accessDirection;
        this._inputRequirements = inputRequirements;
        this._outputProduct = outputProduct;
        this._productionRate = 5000; 
        this._imgLocked = imgLocked;
        this._imgUnlocked = imgUnlocked;
    }

    //Produziert ein Produkt nach der Produktionszeit
    private async produce(): Promise<Product> {
       return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this._outputProduct);
            }, this._productionRate);
    });
    }

    //Fügt eine Produkt der Maschiene hinzu und überprüft ob die Maschine produzieren kann
    async addProduct(Product: Product): Promise<boolean | Product> {
        return new Promise((resolve) => {
        if (this._inputRequirements.find(req => req.name === Product.name) 
            && this._inventory.find(inv => inv.name === Product.name) === undefined) {
            this._inventory.push(Product);
            resolve(true);
        } 
        else {
            resolve(false);
        }
        if(this._inventory.length === this._inputRequirements.length) {
            resolve(this.produce());
        }
        });
    }

    

    unlockMachine() {
        this._unlocked = true;
    }

    // Getters / Setters - only expose setters where it makes sense
    // id should not be changed after construction -> getter only
    get id(): number { return this._id; }

    get unlocked(): boolean { return this._unlocked; }
    set unlocked(v: boolean) { this._unlocked = v; }

    get imgUnlocked(): string { return this._imgUnlocked; }
    set imgUnlocked(v: string) { this._imgUnlocked = v; }

    get imgLocked(): string { return this._imgLocked; }
    set imgLocked(v: string) { this._imgLocked = v; }

    get level(): number { return this._level; }
    set level(v: number) { this._level = v; }

    get x(): number { return this._x; }
    set x(v: number) { this._x = v; }

    get y(): number { return this._y; }
    set y(v: number) { this._y = v; }

    // width/height are usually fixed for a machine; expose read-only getters
    get width(): number { return this._width; }

    get height(): number { return this._height; }

    get name(): string { return this._name; }

    get productionRate(): number { return this._productionRate; }
    set productionRate(v: number) { this._productionRate = v; }

    get accessDirection(): string { return this._accessDirection; }

    get inventory(): Product[] { return this._inventory; }

    get inputRequirements(): Product[] { return this._inputRequirements; }

    get outputProduct(): Product { return this._outputProduct; }
    set outputProduct(v: Product) { this._outputProduct = v; }
}
