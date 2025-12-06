import { Gamefield } from "../gamefield/gamefield";
import { Machine } from "../machine/machine";
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
import { SubmissionArea } from "../submission-area/submission-area";
import { InteractableObject } from "./interactable-object";
import { Package } from "../package/package";

/**
 * MachineManager-Klasse: Verwaltet alle Maschinen im Spiel.
 * Handhabt Unlock-Status, Interaktions-Checks und visuelle Feedback-Effekte.
 */
export class InteractableManager {
    private _gamefield: Gamefield;
    private ui: UIService;
    private _inputs: Record<string, boolean> = {};
    private machines: Machine[] = [
      // Sensor-Maschine (benötigt Raw Silicon + Circuit Board)
      new Machine(600, 400, 50, 50, "Sensor", "/images/wall.png", "/images/wall.png", 
                  [Direction.DOWN, Direction.UP], Products.getProductByName("Basic Sensor")!, 
                  [Products.getProductByName("Raw Silicon")!, Products.getProductByName("Circuit Board")!]),
      // Plastic Case-Maschine (benötigt Raw Plastic)
      new Machine(500, 450, 50, 50, "Plastic Case", "/images/wall.png", "/images/wall.png", 
                  [Direction.LEFT], Products.getProductByName("Plastic Case")!, 
                  [Products.getProductByName("Raw Plastic")!])
    ];

    private submissionArea: SubmissionArea = new SubmissionArea(
      new Coordinates(950, 200),
      50,
      100
    );
  
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
      this._gamefield.interactableObjects.push(this.submissionArea.renderObject);
    });
  }


  /**
   * Prüft ob der Spieler mit einer Maschine interagieren kann.
   * Berechnet Interaktionszonen basierend auf der accessDirection der Maschine.
   */
  checkForInteraction(player: Player) {
    let collision = false;
    // Kiollision mit Maschinen prüfen
    for (let machine of this.machines) {
      collision = this.interactionObject(machine, player);
      if (collision) {
        this.updateMachineOnInteraction(machine, player);
        break;
      }
    }
    if (!collision) {
      this.resetMachineOnInteraction();
    }

    // Kollision mit Submission Area prüfen
    if (this.interactionObject(this.submissionArea, player))
    {
      this.updateSubmissionAreaOnInteraction(player);
    }
    else
    {
      this.resetSubmissionAreaOnInteraction();
    }
  }


  interactionObject(interactableObject: InteractableObject, player: Player) : boolean
  {
    for (let direction of interactableObject.directions)
    {
      const interactionX = direction === Direction.RIGHT ? interactableObject.position.x + this._gamefield.fieldsize :
                           direction === Direction.LEFT ? interactableObject.position.x - this._gamefield.fieldsize : interactableObject.position.x;
      const interactionY = direction === Direction.DOWN ? interactableObject.position.y + this._gamefield.fieldsize :
                           direction === Direction.UP ? interactableObject.position.y - this._gamefield.fieldsize : interactableObject.position.y;

      const interactionHitbox: Hitbox = new Hitbox(
        new Coordinates(interactionX, interactionY), 
        interactableObject.width, 
        interactableObject.height
      );
      const collision = Collision.checkCollision(player.hitbox, interactionHitbox);
      if (collision) {
        return true;
      }
    }
    return false;
    }
  
  /**
   * Behandelt die Interaktion des Spielers mit einer Maschine.
   * - Färbt die Maschine grün
   * - Verarbeitet Produkteingabe wenn E gedrückt
   * - Zeigt UI-PopUp mit Maschinen-Infos
   */
  async updateMachineOnInteraction(machine: Machine, player: Player) {
    // Produkt-Eingabe nur wenn E gedrückt, Maschine freigeschaltet und Spieler trägt was
    if (this._inputs["e"] === true && machine.unlocked && player.inventory instanceof Product) {
      const product: Product = player.inventory;
      let result;
      
      if (product) {
        result = await machine.addProduct(product);
      }

      // Produktion abgeschlossen
      if (result instanceof Object) {
        const produced = result as Product;
        console.log("Produkt produziert:", produced.name);
        Products.addProduct(produced, new Coordinates(machine.x + this._gamefield.fieldsize / 2 - 10, machine.y + this._gamefield.fieldsize / 2 - 10  ));
      } 
      // Zutat erfolgreich hinzugefügt, warte auf weitere
      else if (result === true) {
        // Remove product visuals and from global pool
        product.destroy();
        Products.deleteGeneratedProduct(product);
        player.inventory = null;
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

  updateSubmissionAreaOnInteraction(player: Player) {
      this.submissionArea.renderObject.rectColor = "rgba(81, 255, 81, 1)";
      if (this._inputs["e"] === true && player.inventory instanceof Package) {
      const packObj : Package = player.inventory;

      let result = this.submissionArea.addPackage(packObj);

      packObj.destroy();
      
      player.inventory = null;
      
      // Zutat erfolgreich hinzugefügt, warte auf weitere
      if (result === true) {
        console.log("abgegeben");
      } 
      // Zutat nicht benötigt, zurücklegen
      else if (result === false) {
        console.log("falsches Bestellung");
      }
    }
  }

  resetSubmissionAreaOnInteraction() {
    this.submissionArea.renderObject.rectColor = "rgba(255, 122, 240, 1)";
  }


    
  }

