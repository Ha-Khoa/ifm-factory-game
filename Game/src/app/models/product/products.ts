
import { RenderingService } from '../../services/rendering.service';
import { RenderObject } from '../rendering/render-object';
import { Hitbox } from '../../interfaces/hitbox';
import { Coordinates } from '../coordinates/coordinates';
import { Product } from './product';
import { Package } from '../package/package';
import { Collision } from '../collision/collision';
import { Gamefield } from '../gamefield/gamefield';
import { producerUpdateValueVersion } from '@angular/core/primitives/signals';

/**
 * Products-Klasse: Verwaltet alle Produkte im Spiel (statisch).
 * Enthält die Master-Liste aller verfügbaren Produkte sowie die aktuell im Spiel existierenden Instanzen.
 */
export class Products {

  // Master-Liste aller verfügbaren Produkttypen
  private static simple_productsList: Product[] = [
    new Product(1, "Raw Plastic", "/images/Previews/box-small.png"),
    new Product(2, "Raw Silicon", "/images/Previews/box-small.png"),
    new Product(3, "Copper wire", "/images/Previews/box-small.png"),
    new Product(4, "Plastic Case", "/images/Previews/box-small.png"),
    new Product(5, "Circuit Board", "/images/Previews/box-small.png"),
    new Product(6, "Basic Sensor", "/images/Previews/box-small.png")
  ]

  // Aktuell im Spiel existierende Produkt-Instanzen
  public static generatedProducts: (Product | Package)[] = [];


  /** Gibt ein Produkt anhand seiner ID zurück */
  public static getProductById(id: number): Product | undefined {
    return this.simple_productsList.find(product => product.id === id);
  }

  /** Gibt ein Produkt anhand seines Namens zurück */
  public static getProductByName(name: string): Product | undefined {
    return this.simple_productsList.find(product => product.name === name);
  }

  /** Gibt alle verfügbaren Produkttypen zurück */
  public static getAllProducts(): Product[] {
    return this.simple_productsList;
  }



  /**
   * Prüft ob ein Produkt auf einem Tisch/Objekt platziert werden kann
   * @param product Das zu platzierende Produkt
   * @param objects Liste der RenderObjects in der Welt
   * @returns 0 wenn platzierbar, 1 wenn Tisch belegt, 2 wenn kein Objekt getroffen  
   */
  public static checkOnTable(product: Product | Package, objects: RenderObject[]): number
  {
    let collision;
    for (let interactionObject of objects)
    {
      product.renderObject.priority = 30
      collision = Collision.checkCollision(new Hitbox(product.position, product.size, product.size), new Hitbox(new Coordinates(interactionObject.x, interactionObject.y), interactionObject.width, interactionObject.height))
      if(collision && !interactionObject.name.startsWith("conveyor"))
      {
      if(!this.checkItemOnTable(interactionObject, product))
      {
      
        
        product.z = interactionObject.z;
        product.x = interactionObject.x + interactionObject.width / 2 - product.size / 2;
        product.y = interactionObject.y + interactionObject.height / 2 - product.size / 2;
        product.renderObject.priority = 100;
        return 0;
        
      }
      return 1;
      }
    }
    return 2;
  }

  private static checkItemOnTable(object: RenderObject, excludeProduct?: Product | Package): boolean
  {
    for(let obj of this.generatedProducts){
      if(excludeProduct && obj == excludeProduct) continue; 
      if(Collision.checkCollision(new Hitbox(obj.position, obj.size, obj.size), new Hitbox(new Coordinates(object.x, object.y), object.width, object.height)))
      {
        return true;
      }
      
    }
    return false;
  }
  /**
   * Prüft ob der Spieler nahe genug an einem Produkt ist, um es aufzunehmen.
   * @returns Das nächste Produkt wenn in Reichweite (55px), sonst null
   */
  public static checkForInteraction(player: Hitbox): Product | Package | null {
    const productToInteract = this.shortestProductDistance(player);
    if (productToInteract && productToInteract.distance <= 55) {
      return productToInteract.product;
    }
    return null;
  }

  /** Entfernt ein Produkt aus der Welt (z.B. nach Aufnahme durch Spieler) */
  public static deleteGeneratedProduct(product: Product | Package) {
    this.generatedProducts = this.generatedProducts.filter(p => p != product);
  }

  /**
   * Erstellt eine neue Produkt-Instanz an der angegebenen Position.
   * Das Produkt wird kopiert, initialisiert und zur Welt hinzugefügt.
   */
  public static addProduct(product: Product, position: Coordinates) {
    let copy = product.copy();
    copy.init(position);
    this.generatedProducts.push(copy);
  }

  public static addPackage(packageObj: Package) {
    this.generatedProducts.push(packageObj);
  }

  /**
   * Generiert Test-Produkte für die Spielwelt (Entwicklungs-/Debug-Funktion).
   */
  public static generateProducts(): void {
    let newProduct = Products.getProductByName("Raw Plastic");
    if (newProduct) {
      let copy1 = newProduct.copy();
      copy1.init(new Coordinates(100, 200));
      this.generatedProducts.push(copy1);

      let copy2 = newProduct.copy();
      copy2.init(new Coordinates(300, 400));
      this.generatedProducts.push(copy2);

      let copy3 = newProduct.copy();
      copy3.init(new Coordinates(500, 150));
      this.generatedProducts.push(copy3);

      newProduct = Products.getProductByName("Raw Silicon");
      let copy4 = newProduct!.copy();
      copy4.init(new Coordinates(700, 300));
      this.generatedProducts.push(copy4);

      newProduct = Products.getProductByName("Circuit Board");
      let copy5 = newProduct!.copy();
      copy5.init(new Coordinates(600, 300));
      this.generatedProducts.push(copy5);
    }
    let pack = new Package(new Coordinates(800, 100))
    this.generatedProducts.push(pack);
    let pack2 = new Package(new Coordinates(850, 150))
    this.generatedProducts.push(pack2);
  }

  /**
   * Findet das nächstgelegene Produkt zum Spieler.
   * @returns Objekt mit Distanz und Produkt, oder undefined wenn keine Produkte vorhanden
   */
  private static shortestProductDistance(player: Hitbox): { distance: number, product: Product | Package } | undefined {
    let productsDistances: { distance: number, product: Product | Package }[] = [];

    this.generatedProducts.forEach(generatedProduct => {
      // Distanz vom Spieler-Zentrum zum Produkt berechnen
      const distance = Math.sqrt(
        Math.pow((player.x + player.width / 2 - (generatedProduct.position.x + generatedProduct.size / 2)), 2) +
        Math.pow((player.y + player.height / 2 - (generatedProduct.position.y + generatedProduct.size / 2)), 2)
      );
      productsDistances.push({ distance: distance, product: generatedProduct });
    });

    const min = Math.min(...productsDistances.map(prod => prod.distance));
    return productsDistances.find(prod => prod.distance === min);
  }

  // Utility-Methoden

  /** Gibt eine zufällige Produkt-ID zurück */
  static getRandomProductId(): number {
    const randomIndex = Math.floor(Math.random() * this.simple_productsList.length);
    return this.simple_productsList[randomIndex].id;
  }

  /** Gibt ein zufälliges Produkt zurück */
  static generateRandomProducts(): Product {
    const randomIndex = Math.floor(Math.random() * this.simple_productsList.length);
    return this.simple_productsList[randomIndex];
  }

  /**
   * Berechnet den Gesamtpreis für eine Liste von Produkten.
   * TODO: Preis-Property in Product-Klasse hinzufügen
   */
  static calculateProductPrice(items: { productId: number, quantity: number }[]): number {
    let totalPrice = 0;
    for (const item of items) {
      const product = this.getProductById(item.productId);
      if (product) {
        totalPrice += 0 * item.quantity; // Placeholder - Preis noch nicht implementiert
      }
    }
    return totalPrice;
  }
}
