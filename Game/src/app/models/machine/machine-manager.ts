import { Gamefield } from "../gamefield/gamefield";
import { Machine } from "./machine";
import { Products } from "../product/products";
import { Product } from "../product/product";
import { Hitbox } from "../../interfaces/hitbox";
import { Collision } from "../collision/collision";
import { RenderingService} from "../../services/rendering.service";
import { RenderObject } from "../rendering/render-object";
import { Direction } from "../../enums/direction";
import { Coordinates } from "../coordinates/coordinates";
import { UIService } from "../../services/ui.service";
import { Player } from "../player/player";

/**
 * MachineManager-Klasse: Verwaltet alle Maschinen im Spiel.
 * Handhabt Unlock-Status, Interaktions-Checks und visuelle Feedback-Effekte.
 */
export class MachineManager {
    private _gamefield: Gamefield;
    private ui: UIService;
    private _inputs: Record<string, boolean> = {};
    private machines: Machine[] = [
      // Sensor-Maschine (benötigt Raw Silicon + Circuit Board)
      new Machine(600, 400, 50, 50, "Sensor", "/images/wall.png", "/images/wall.png", 
                  Direction.DOWN, Products.getProductByName("Basic Sensor")!, 
                  [Products.getProductByName("Raw Silicon")!, Products.getProductByName("Circuit Board")!]),
      // Plastic Case-Maschine (benötigt Raw Plastic)
      new Machine(500, 450, 50, 50, "Plastic Case", "/images/wall.png", "/images/wall.png", 
                  Direction.LEFT, Products.getProductByName("Plastic Case")!, 
                  [Products.getProductByName("Raw Plastic")!])
    ];
  
  constructor(_gamefield: Gamefield, ui: UIService, inputs: Record<string, boolean>) {
    this._gamefield = _gamefield;
    this.ui = ui;
    this._inputs = inputs;
    // Standard-Maschinen freischalten
    this.updateUnlockedMachine(0);
    this.updateUnlockedMachine(1);
  }

  /** Gibt alle Maschinen zurück */
  getMachines(): Machine[] {
    return this.machines;
  }

  /** Schaltet eine Maschine frei */
  updateUnlockedMachine(id: number) {
    this.machines[id].unlocked = true;
  }

  /** Fügt alle Maschinen als interagierbare Objekte zum Spielfeld hinzu */
  addToInteractableObjects() {
    this.machines.forEach(machine => {
      this._gamefield.interactableObjects.push(machine.renderObject);
    });
  }


  /**
   * Prüft ob der Spieler mit einer Maschine interagieren kann.
   * Berechnet Interaktionszonen basierend auf der accessDirection der Maschine.
   */
  checkForInteraction(player: Player) {
    for (let machine of this.machines) {
      // Interaktionszone je nach Zugangsrichtung berechnen
      const accessDirection = machine.accessDirection;
      const interactionX = accessDirection === Direction.RIGHT ? machine.x + this._gamefield.fieldsize :
                           accessDirection === Direction.LEFT ? machine.x - this._gamefield.fieldsize : machine.x;
      const interactionY = accessDirection === Direction.DOWN ? machine.y + this._gamefield.fieldsize :
                           accessDirection === Direction.UP ? machine.y - this._gamefield.fieldsize : machine.y;

      const interactionHitbox: Hitbox = new Hitbox(
        new Coordinates(interactionX, interactionY), 
        this._gamefield.fieldsize, 
        this._gamefield.fieldsize
      );

      // Prüfen ob Spieler in Interaktionszone ist
      const collision = Collision.checkCollision(player.hitbox, interactionHitbox);
      if (collision) {
        this.updateMachineOnInteraction(machine, player);
        return;
      }
    }
    this.resetMachineOnInteraction();
  }


  /**
   * Behandelt die Interaktion des Spielers mit einer Maschine.
   * - Färbt die Maschine grün
   * - Verarbeitet Produkteingabe wenn E gedrückt
   * - Zeigt UI-PopUp mit Maschinen-Infos
   */
  async updateMachineOnInteraction(machine: Machine, player: Player) {
    // Produkt-Eingabe nur wenn E gedrückt, Maschine freigeschaltet und Spieler trägt was
    if (this._inputs["e"] === true && machine.unlocked && player.inventory) {
      const product: Product | null = player.inventory;
      let result;
      
      if (product) {
        result = await machine.addProduct(product);
      }

      // Produktion abgeschlossen
      if (result instanceof Object) {
        Products.deleteGeneratedProduct(product);
        product.destroy();
        const produced = result as Product;
        console.log("Produkt produziert:", produced.name);
        Products.addProduct(produced, new Coordinates(machine.x + this._gamefield.fieldsize / 2 - 10, machine.y + this._gamefield.fieldsize / 2 - 10  ));
      } 
      // Zutat erfolgreich hinzugefügt, warte auf weitere
      else if (result === true) {
        Products.deleteGeneratedProduct(product);
        product.destroy();
        console.log("Zutat hinzugefügt, wartet auf weitere Inputs");
      } 
      // Zutat nicht benötigt, zurücklegen
      else if (result === false) {
        if (product && product.position) {
          //Products.addProduct(product, product.position);
        }
        console.log("Zutat nicht benötigt, zurückgelegt");
      }
    }
    
    // Visuelles Feedback: Maschine grün färben
    machine.renderObject.rectColor = "rgba(81, 255, 81, 1)";
    machine.renderObject.rectLayers = ["#08db08ff", "#03b603ff", "#009900", "#006600", "#003300"];
    this.ui.drawMachinePopUp(machine);
  }

  /**
   * Setzt alle Maschinen auf ihre normale Farbe zurück und schließt das UI-PopUp.
   */
  resetMachineOnInteraction() {
    this.getMachines().forEach(machine => {
      machine.renderObject.rectColor = "rgba(226, 229, 255, 1)";
      machine.renderObject.rectLayers = ["#a0c0ffff", "#8299ffff", "#546effff", "#2b39ffff", "#0000ffff"];
    });
    
    this.ui.clearMachinePopUp();
  }
}
