import { RenderObject } from '../rendering/render-object';
import { Hitbox } from '../../interfaces/hitbox';
import { Coordinates } from '../coordinates/coordinates';
import { Product } from './product';
import { Package } from '../package/package';
import { Collision } from '../collision/collision';
import { Gamefield } from '../gamefield/gamefield';

/**
 * Products-Klasse: Verwaltet alle Produkte im Spiel (statisch).
 * Enthält die Master-Liste aller verfügbaren Produkte sowie die aktuell im Spiel existierenden Instanzen.
 */
export class Products {

  /**
   * A list of products available in the game. Each product is
   * represented as an instance of the `Product` class containing details such as
   * its ID, name, pricing, stock, dependencies, availability, and image path.
   *
   * Structure of each product:
   * - ID: A unique identifier for the product.
   * - Name: The name of the product.
   * - Stock Level: Quantity of the product available in inventory.
   * - Pricing:
   *   - Cost Price: The raw cost of acquiring or manufacturing the product.
   *   - Selling Price: The retail price at which the product is sold.
   * - Dependencies: A list of dependent products (if any), specifying the `productId`
   *   and required `quantity` to manufacture or produce the product.
   * - Availability: A boolean value indicating if the product is currently
   *   available for sale.
   * - Image Path: The file path for the image representation of the product.
   */
  private static productsList: Product[] = [
    new Product(1, "Raw Plastic", 5, 15, 2, true, "/images/Products/raw-plastic.png"),
    new Product(2, "Raw Silicon", 10, 20, 5, true, "/images/Products/raw-silicon.png"),
    new Product(3, "Copper Wire", 15, 22, 15, true, "/images/Products/copper-wire.png"),
    new Product(4, "Plastic Case", 50, 50, [{productId: 1, quantity: 3}], true, "/images/Products/plastic-case.png"),
    new Product(5, "Circuit Board", 120, 150, [{productId: 2, quantity: 1}, {productId: 3, quantity: 1}], true, "/images/Products/circuit-board.png"),
    new Product(6, "Basic Sensor", 250, 65, [{productId: 4, quantity: 1}, {productId: 2, quantity: 1}, {productId: 5, quantity: 1}], true, "/images/Products/basic-sensor.png")
  ]

  /**
   * A list containing existing generated products, which can be either individual products
   * or product packages. Each item in the array is of type `Product` or `Package`.
   *
   * This array is typically used to store or process items resulting from
   * product generation workflows or operations.
   *
   * The list is initialized as an empty array and can be populated dynamically
   * based on specific generation logic or requirements.
   *
   * @type {(Product | Package)[]}
   */
  public static generatedProducts: (Product | Package)[] = [];

  /**
   * Retrieves a product from the list by its unique identifier.
   *
   * @param {number} id - The unique identifier of the product.
   * @return {Product | undefined} The product that matches the provided ID, or undefined if no match is found.
   */
  public static getProductById(id: number): Product | undefined {
    return this.productsList.find(product => product.id === id);
  }

  /**
   * Retrieves a product from the list by its name. The search is case-insensitive.
   *
   * @param name The name of the product to search for.
   * @return The product object if a match is found, or undefined if no product matches the given name.
   */
  public static getProductByName(name: string): Product | undefined {
    return this.productsList.find(product => product.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Retrieves a list of all products available.
   *
   * @return {Product[]} An array containing all product objects.
   */
  public static getAllProducts(): Product[] {
    return this.productsList;
  }



  /**
   * Checks whether a product or package is on a table among a list of objects.
   * It analyzes potential collisions, adjusts product position if necessary,
   * and returns a status code based on its findings.
   *
   * @param {Product | Package} product - The product or package to check for placement on a table.
   * @param {RenderObject[]} objects - The list of renderable objects to check for collisions.
   * @return {number} Returns 2 if no collisions are detected, 1 if the object is properly placed on a table,
   *         and 0 if adjustments were made to place it correctly on the nearest table.
   */
  public static checkOnTable(product: Product | Package, objects: RenderObject[]): number {
    let collision;
    let collisions = [];
    let returnvalue = 2;
    for (let interactionObject of objects) {

      collision = Collision.checkCollision(new Hitbox(product.position, product.size, product.size), new Hitbox(new Coordinates(interactionObject.x, interactionObject.y), interactionObject.width, interactionObject.height))
      if (collision && !interactionObject.name.startsWith("conveyor")) {

        if (!this.checkItemOnTable(interactionObject, product)) {
          collisions.push(interactionObject)
          continue;

        }
        returnvalue = 1;
      }
    }
    if (collisions.length > 0) {
      const shortestTable = this.findShortestDistanceTable(collisions, product);
      if (shortestTable) {
        returnvalue = 0
        product.z = shortestTable.object.z;
        product.x = shortestTable.object.x + shortestTable.object.width / 2 - product.size / 2;
        product.y = shortestTable.object.y + shortestTable.object.height / 2 - product.size / 2;
      }
    }
    return returnvalue;
  }

  /**
   * Calculates and finds the shortest distance between a given product or package
   * and a list of render objects. Returns the render object with the shortest distance.
   *
   * @param {RenderObject[]} objects - An array of render objects to calculate distances to.
   * @param {(Product|Package)} product - The product or package for which distances are calculated.
   * @return {{ distance: number, object: RenderObject } | undefined} The render object with the shortest distance
   *         and the associated distance value, or undefined if the distances array is empty.
   */
  private static findShortestDistanceTable(objects: RenderObject[], product: Product | Package): { distance: number; object: RenderObject; } | undefined {
    let distances: { distance: number, object: RenderObject }[] = [];
    for (let interactionObject of objects) {
      const distance = Math.sqrt(
        Math.pow((product.position.x + product.size / 2 - (interactionObject.x + interactionObject.width / 2)), 2) +
        Math.pow((product.position.y + product.size / 2 - (interactionObject.y + interactionObject.height / 2)), 2)
      );
      distances.push({ distance: distance, object: interactionObject });
    }
    const min = Math.min(...distances.map(d => d.distance));
    return distances.find(d => d.distance === min);
  }

  /**
   * Checks if a given object is on the table, while optionally excluding a specified product or package.
   * @param {RenderObject} object - The object to check for presence on the table. Contains position and dimensions.
   * @param {Product | Package} [excludeProduct] - An optional product or package to exclude from the collision check.
   * @return {boolean} Returns true if the object is on the table (not counting excluded products), otherwise false.
   */
  public static checkItemOnTable(object: RenderObject, excludeProduct?: Product | Package): boolean {
    for (let obj of this.generatedProducts) {
      if (excludeProduct && obj == excludeProduct) continue;
      if (Collision.checkCollision(new Hitbox(obj.position, obj.size, obj.size), new Hitbox(new Coordinates(object.x, object.y), object.width, object.height))) {
        return true;
      }

    }
    return false;
  }

  /**
   * Checks if there is an interaction between the player and the closest product or package.
   *
   * @param {Hitbox} player - The player's hitbox used to determine proximity to interactable objects.
   * @return {Product | Package | null} The product or package being interacted with, or null if no interaction is detected.
   */
  public static checkForInteraction(player: Hitbox): Product | Package | null {
    const productToInteract = this.shortestProductDistance(player);
    if (productToInteract && productToInteract.distance <= Gamefield.fieldsize) {
      return productToInteract.product;
    }
    return null;
  }

  /**
   * Deletes a given product or package from the list of generated products.
   *
   * @param {Product | Package} product - The product or package to be removed from the generated products list.
   * @return {void} No return value.
   */
  public static deleteGeneratedProduct(product: Product | Package) {
    this.generatedProducts = this.generatedProducts.filter(p => p != product);
  }

  /**
   * Adds a product to the list of generated products at the specified position.
   *
   * @param {Product} product - The product to be added.
   * @param {Coordinates} position - The coordinates where the product should be initialized.
   * @return {void} This method does not return a value.
   */
  public static addProduct(product: Product, position: Coordinates): void {
    let copy = product.copy();
    copy.init(position);
    this.generatedProducts.push(copy);
  }

  /**
   * Adds a package object to the list of generated products.
   *
   * @param {Package} packageObj - The package object to add to the generated products list.
   * @return {void} This method does not return a value.
   */
  public static addPackage(packageObj: Package): void {
    this.generatedProducts.push(packageObj);
  }

  /**
   * Generates and initializes a set of products and packages with specific coordinates.
   * The generated items are added to the `generatedProducts` list.
   *
   * @remarks Only for debugging purposes.
   *
   * @return {void} This method does not return a value.
   */
  public static generateProducts(): void {
    /*
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
    let pack3 = new Package(new Coordinates(750, 150))
    this.generatedProducts.push(pack3);*/
  }

  /**
   * Calculates the shortest distance between the player hitbox and a list of generated products,
   * and returns the closest product along with its computed distance.
   *
   * @param {Hitbox} player - The player's hitbox containing position and dimensions.
   * @return {{ distance: number, product: Product | Package } | undefined} An object containing the shortest distance to a product
   * and the product itself, or `undefined` if no products are available.
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

  /**
   * Retrieves a random product ID from the products list. The selected product
   * must be unlocked to be considered valid. If the initially selected product
   * is locked, the method recursively selects another random product ID.
   *
   * @return {number} A valid and unlocked product ID from the products list.
   */
  static getRandomProductId(): number {
    const randomIndex = Math.floor(Math.random() * this.productsList.length) + 1;
    if(!this.getProductById(randomIndex)?.unlocked) {
      return this.getRandomProductId();
    }

    return this.productsList[randomIndex-1].id;
  }

  /**
   * Generates and returns a random product from the available products list.
   * Ensures that the selected product is unlocked before returning.
   * If the randomly selected product is locked, the method recursively attempts to find an unlocked product.
   *
   * @return {Product} A randomly selected, unlocked product from the products list.
   */
  static generateRandomProduct(): Product {
    const randomIndex = Math.floor(Math.random() * this.productsList.length);
    if(!this.getProductById(randomIndex)?.unlocked) {
      return this.generateRandomProduct();
    }
    return this.productsList[randomIndex];
  }
}
