import { Product } from "../product/product";
import { Direction } from "../../enums/direction";
import { RenderingService } from "../../services/rendering.service";
import { Products } from "../product/products";
import { InteractableObject } from "../interactableObject/interactable-object";
import { Coordinates } from "../coordinates/coordinates";
import { Gamefield } from "../gamefield/gamefield";

/**
 * Machine-Klasse: Repräsentiert eine Produktionsmaschine im Spiel.
 * Verarbeitet Input-Produkte und produziert nach einer festgelegten Zeit ein Output-Produkt.
 */
export class Machine extends InteractableObject {

  // Statische Eigenschaften
  public static Machines: Machine[] = [];
  static lastID: number = 0;

  // Identifikation & Status
  private _id: number;
  private _name!: string;
  private _unlocked: boolean = false;
  private _level: number = 1;
  private _upgradable: boolean = true;

  // Visuelle Darstellung
  private _imgUnlocked!: string;
  private _imgLocked!: string;
  // RenderObject now inherited from InteractableObject

  // Position & Größe via InteractableObject (_position, _width, _height)

  // Produktionslogik
  private _productionRate!: number;
  private _productionTimer: number;
  // accessDirection handled via InteractableObject directions (first entry)
  private _inventory: Product[] = [];
  private _inputRequirements: Product[] = [];
  private _outputProduct!: Product;
  private _producting: boolean = false;

  /**
   * Erstellt eine neue Maschine
   *
   * @param x X-Position in Weltkoordinaten
   * @param y Y-Position in Weltkoordinaten
   * @param width Breite der Maschine in Pixeln
   * @param height Höhe der Maschine in Pixeln
   * @param name Name/Typ der Maschine
   * @param imgUnlocked Bild-Pfad für freigeschalteten Zustand
   * @param imgLocked Bild-Pfad für gesperrten Zustand
   * @param accessDirection Richtung für Spieler-Interaktion
   * @param outputProduct Das zu produzierende Endprodukt
   * @param inputRequirements Liste der benötigten Input-Produkte
   */
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    name: string,
    imgUnlocked: string,
    imgLocked: string,
    accessDirection: Direction[],
    outputProduct: Product,
    inputRequirements: Product[]
  ) {
    // Initialize InteractableObject: position, size, z, img, allowed directions
    super(
      name,
      new Coordinates(x, y),
      width,
      height,
      Gamefield.fieldsize,
      accessDirection,
      "rect",
      undefined,
      undefined,
      "rgba(200, 206, 255, 1)",
      ["#a0c0ffff", "#8299ffff", "#546effff", "#2b39ffff", "#0000ffff"]
    );

    // ID und Grundeinstellungen
    this._id = Machine.lastID++;
    this._name = name;
    this._width = width;
    this._height = height;

    // Produktionslogik initialisieren
    this._inputRequirements = inputRequirements;
    this._outputProduct = outputProduct;
    this._productionRate = 5000; // 5 Sekunden Standard-Produktionszeit
    this._productionTimer = this._productionRate / 1000; // Timer in Sekunden

    // Bilder setzen
    this._imgLocked = imgLocked;
    this._imgUnlocked = imgUnlocked;


    // Maschine zum RenderingService hinzufügen
    RenderingService.instance().addRenderObject(this._renderObject);
  }




  /**
   * Startet die Produktion und gibt das fertige Produkt nach Ablauf der Zeit zurück.
   * Zählt jede Sekunde den Timer herunter und leert danach das Inventar.
   */
  private async produce(): Promise<Product> {
    this._producting = true;
    const stepSize = 0.01; // Schrittgröße in Sekunden
    const intervalMs = 10; // Intervall in Millisekunden

    return new Promise(async (resolve) => {
      const interval = setInterval(() => {
        this._productionTimer -= stepSize;
        if (this._productionTimer <= 0) {
          clearInterval(interval);
          this._productionTimer = this._productionRate / 1000;
          this._inventory = [];
          this._producting = false;
          resolve(this._outputProduct);
        }
      }, intervalMs);
    });
  }
  /**
   * Fügt ein Produkt zur Maschine hinzu. Wenn alle benötigten Inputs vorhanden sind,
   * startet die Produktion automatisch.
   *
   * @returns true = Produkt hinzugefügt, false = nicht benötigt, Product = Produktion abgeschlossen
   */
  async addProduct(Product: Product): Promise<boolean | Product> {
    return new Promise((resolve) => {
      const isRequired = this._inputRequirements.find(req => req.id === Product.id);
      const alreadyInInventory = this._inventory.find(inv => inv.id === Product.id);

      if (isRequired && alreadyInInventory === undefined) {
        this._inventory.push(Product);

        // Alle Inputs vorhanden? Starte Produktion
        if (this._inventory.length === this._inputRequirements.length) {

          this._inventory.forEach(prod => {
            prod.destroy();
            Products.deleteGeneratedProduct(prod);
          });
          resolve(this.produce());
        } else {
          resolve(true);
        }
        // Removed stray destroy call on parameter

      } else {
        resolve(false);
      }
    });
  }

  /**
   * Upgradet die Maschine: Erhöht das Level und verringert die Produktionszeit um 1 Sekunde.
   */
  upgrade(): void {
    if (this._upgradable) {
      this._level += 1;
      this._productionRate -= 1000;
      console.log(`${this._name} upgraded auf Level ${this._level}!`);
    }
  }

  get isProducing(): boolean {
    return this._producting;
  }
  // Getters & Setters

  /** Eindeutige ID der Maschine (read-only) */
  get id(): number { return this._id; }

  /** Ist die Maschine freigeschaltet? */
  get unlocked(): boolean { return this._unlocked; }
  set unlocked(v: boolean) { this._unlocked = v; }

  /** Bild für freigeschalteten Zustand */
  get imgUnlocked(): string { return this._imgUnlocked; }
  set imgUnlocked(v: string) { this._imgUnlocked = v; }

  /** Bild für gesperrten Zustand */
  get imgLocked(): string { return this._imgLocked; }
  set imgLocked(v: string) { this._imgLocked = v; }

  /** Aktuelles Level der Maschine */
  get level(): number { return this._level; }
  set level(v: number) { this._level = v; }

  /** Kann die Maschine upgegradet werden? */
  get upgradable(): boolean { return this._upgradable; }
  set upgradable(b: boolean) { this._upgradable = b; }

  /** X-Position in Weltkoordinaten */
  get x(): number { return this.position.x; }
  set x(v: number) { this.position = new Coordinates(v, this.position.y); }

  /** Y-Position in Weltkoordinaten */
  get y(): number { return this.position.y; }
  set y(v: number) { this.position = new Coordinates(this.position.x, v); }

  /** Name/Typ der Maschine (read-only) */
  get name(): string { return this._name; }

  /** Produktionsrate in Millisekunden */
  get productionRate(): number { return this._productionRate; }
  set productionRate(v: number) { this._productionRate = v; }

  /** Richtung für Spieler-Interaktion (read-only) */
  get accessDirection(): Direction { return this._directions[0]; }

  /** Produktions Timer */
  get productionTimer(): number { return this._productionTimer; }
  set productionTimer(v: number) { this._productionTimer = v; }

  get inventory(): Product[] { return this._inventory; }
  set inventory(v: Product[]) { this._inventory = v; }

  get inputRequirements(): Product[] { return this._inputRequirements; }
  set inputRequirements(v: Product[]) { this._inputRequirements = v; }

  get outputProduct(): Product { return this._outputProduct; }

  get z(): number { return this._renderObject.z }
}
