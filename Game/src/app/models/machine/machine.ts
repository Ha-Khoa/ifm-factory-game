import { timeInterval } from "rxjs/internal/operators/timeInterval";
import { Product } from "../../interfaces/product";
import { input } from "@angular/core";
import { Direction } from "../../enums/direction";

/**
 * Machine-Klasse: Repräsentiert eine Produktionsmaschine im Spiel.
 * Verarbeitet Input-Produkte und produziert Output-Produkte nach festgelegter Zeit.
 */
export class Machine {

    // Statisches Array aller Maschinen
    public static Machines: Machine[] = [

    ];

    // Statischer Zähler für eindeutige IDs
    static lastID: number = 0;
    // Eindeutige ID der Maschine
    private _id: number;
    // Ist die Maschine freigeschaltet?
    private _unlocked: boolean = false;
    // Bild für freigeschaltete Maschine
    private _imgUnlocked!: string;
    // Bild für gesperrte Maschine
    private _imgLocked!: string;
    // Level der Maschine (für Upgrades)
    private _level: number = 1;
    // X-Position in Weltkoordinaten
    private _x: number;
    // Y-Position in Weltkoordinaten
    private _y: number;
    // Breite in Pixeln
    private _width!: number;
    // Höhe in Pixeln
    private _height!: number;
    // Name der Maschine
    private _name!: string;
    // Produktionsrate in Millisekunden
    private _productionRate!: number;
    // Richtung von der aus Interaktion möglich ist
    private _accessDirection!: Direction;
    // Aktuelles Inventar der Maschine
    private _inventory: Product[] = [];
    // Benötigte Input-Produkte für Produktion
    private _inputRequirements: Product[] = [];
    // Output-Produkt das produziert wird
    private _outputProduct!: Product;

    constructor(x: number, y: number, width: number, height: number, name: string, imgUnlocked: string, imgLocked: string, accessDirection: Direction, outputProduct: Product, inputRequirements: Product[])
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

  


    /**
     * Produziert ein Produkt nach der festgelegten Produktionszeit.
     * @returns Promise mit dem produzierten Produkt
     */
    private async produce(): Promise<Product> {
       return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this._outputProduct);
            }, this._productionRate);
    });
    }

    /**
     * Fügt ein Produkt zur Maschine hinzu und startet Produktion wenn alle Inputs vorhanden.
     * @param Product Das hinzuzufügende Produkt
     * @returns Promise mit true (erfolgreich hinzugefügt), false (nicht benötigt) oder produziertem Produkt
     */
    async addProduct(Product: Product): Promise<boolean | Product> {
        return new Promise((resolve) => {
        if (this._inputRequirements.find(req => req.name === Product.name) 
            && this._inventory.find(inv => inv.name === Product.name) === undefined) {
            this._inventory.push(Product);
            if(this._inventory.length === this._inputRequirements.length) {
            resolve(this.produce());
            }
            else
            {
                resolve(true);
            }
        } 
        else {
            resolve(false);
        }
        
        });
    }

    

    /**
     * Schaltet die Maschine frei.
     */
    unlockMachine() {
        this._unlocked = true;
    }

    // Getters / Setters
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

    get accessDirection(): Direction { return this._accessDirection; }

    get inventory(): Product[] { return this._inventory; }

    get inputRequirements(): Product[] { return this._inputRequirements; }

    get outputProduct(): Product { return this._outputProduct; }
    set outputProduct(v: Product) { this._outputProduct = v; }
}
