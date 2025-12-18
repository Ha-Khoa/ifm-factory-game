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
import {HudStateService} from '../../components/hud/HudStateService';

/**
 * MachineManager-Klasse: Verwaltet alle Maschinen im Spiel.
 * Handhabt Unlock-Status, Interaktions-Checks und visuelle Feedback-Effekte.
 */
export class InteractableManager {
    private _gamefield: Gamefield;
    private ui: UIService;
    private hud: HudStateService;
    private _inputs: Record<string, boolean> = {};
    private machines: Machine[] = [
      // Sensor-Maschine (benötigt Raw Silicon + Circuit Board)
      new Machine(Gamefield.fieldsize * 4, Gamefield.fieldsize * 4, Gamefield.fieldsize, Gamefield.fieldsize, "Machine: Basic Sensor", "/images/wall.png", "/images/wall.png",
                  [Direction.DOWN], Products.getProductById(6)!),
      // Plastic Case-Maschine (benötigt Raw Plastic)
      new Machine(Gamefield.fieldsize * 4, Gamefield.fieldsize * 8, Gamefield.fieldsize, Gamefield.fieldsize, "Machine: Plastic Case", "/images/wall.png", "/images/wall.png",
                  [Direction.UP], Products.getProductById(4)!, 10000),
      new Machine(Gamefield.fieldsize * 8, Gamefield.fieldsize * 4, Gamefield.fieldsize, Gamefield.fieldsize, "Machine: Circuit Board", "/images/wall.png", "/images/wall.png",
                  [Direction.DOWN], Products.getProductById(5)!)
    ];

    private submissionArea:SubmissionArea;

  constructor(_gamefield: Gamefield, ui: UIService, inputs: Record<string, boolean>, hud: HudStateService) {
    this._gamefield = _gamefield;
    this.ui = ui;
    this.hud = hud;
    this._inputs = inputs;
    this.submissionArea = new SubmissionArea(
      new Coordinates(Gamefield.fieldsize * 29, Gamefield.fieldsize * 5),
      Gamefield.fieldsize,
      2 * Gamefield.fieldsize,
      this.hud
    );
    // Standard-Maschinen freischalten
    this.updateUnlockedMachine(0);
    this.updateUnlockedMachine(1);
    this.updateUnlockedMachine(2);
    this.machines.forEach((machine) => {
      this.generateInteractionField(machine)
      this.addParticleField(machine)
    })
    this.generateInteractionField(this.submissionArea)
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


  checkMachineNeedsProduct(player: Player) {
    if(!player.inventory || !(player.inventory instanceof Product)) { return }
    for(let machine of this.machines) {
      for(let productRequirements of machine.inputRequirements) {
        let name = productRequirements.product.name;
        if(name === player.inventory.name) {
          let needsProduct = true;
          for(let inv of machine.inventory) {
            if(machine.getQuantityOfThisMissingProduct(inv.product) === 0) {
              needsProduct = false;
              break;
            }
          }
          if(needsProduct) {
            this.enableParticleField(machine);
          }
        }
      }
    }
  }

  resetParticleFields()
  {
    for(let machine of this.machines)
    {
      for (let particleRenderObject of machine.particleRenderObjects)
      {
        particleRenderObject.render = false
      }
    }
  }

  enableParticleField(machine: Machine)
  {
    for (let particleRenderObject of machine.particleRenderObjects)
    {
      particleRenderObject.render = true;
    }
  }

  addParticleField(machine: Machine)
  {
    for (let particleRenderObject of machine.particleRenderObjects)
    {
      particleRenderObject.render = false;
      RenderingService.instance().addRenderObject(particleRenderObject)
    }
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
      const interactionX = direction === Direction.RIGHT ? interactableObject.position.x + Gamefield.fieldsize :
                           direction === Direction.LEFT ? interactableObject.position.x - Gamefield.fieldsize : interactableObject.position.x;
      const interactionY = direction === Direction.DOWN ? interactableObject.position.y + Gamefield.fieldsize :
                           direction === Direction.UP ? interactableObject.position.y - Gamefield.fieldsize : interactableObject.position.y;

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

      if (product && !Products.checkItemOnTable(machine.renderObject, product) && !machine.isProducing && !player.hasPicked()) {
        console.log(`The user has the product ${product.name} and wants to add it to the machine ${machine.name}.
The product is not already on the machine and the machine is not currently producing.`);
        result = await machine.addProduct(product);

        console.log(`The result of ading the product ${product.name} to the machine ${machine.name} is:`, result)
      }
      else {
        console.log(`The user has the product ${product.name} and wants to add it to the machine ${machine.name}.
The product is ${Products.checkItemOnTable(machine.renderObject, product) ? '' : 'not ' }already on the machine and the machine is currently ${machine.isProducing ? '' : 'not '}producing.`);
        result = false;
      }
      // Produktion abgeschlossen
      if (result instanceof Object ) {
        const produced = result as Product;
        product.destroy();
        console.log("Produkt produziert:", produced.name);
        produced.z = machine.z;
        Products.addProduct(produced, new Coordinates(machine.x + Gamefield.fieldsize / 2 - produced.size / 2, machine.y + Gamefield.fieldsize / 2 - produced.size / 2 ));
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

  generateInteractionField(interactionObject: InteractableObject)
  {
    const size = Gamefield.fieldsize;
    const base = interactionObject.position;

    interactionObject.directions.forEach((direction, idx) => {
      const x = direction === Direction.RIGHT
        ? base.x + interactionObject.width
        : direction === Direction.LEFT
        ? base.x - size
        : base.x;

      const y = direction === Direction.DOWN
        ? base.y + interactionObject.height
        : direction === Direction.UP
        ? base.y - size
        : base.y;

      const interactionHeight = direction === Direction.DOWN || direction === Direction.UP ? size : interactionObject.height;
      const interactionWidth = direction === Direction.RIGHT || direction === Direction.LEFT ? size : interactionObject.width;
      const name = `interaction-${interactionObject.renderObject.name}-${Direction[direction]}-${idx}`;
      const ro = new RenderObject(
        name,
        "img",
        x,
        y  ,
        0,
        interactionWidth,
        interactionHeight,
        100,
        "/images/interaction-field.png",
        undefined,
        undefined,
        undefined
      );

      RenderingService.instance().addRenderObject(ro);
    });
  }

  updateSubmissionAreaOnInteraction(player: Player) {
      this.submissionArea.renderObject.rectColor = "#9c0e0eff";
      if (this._inputs["e"] === true && player.inventory instanceof Package && !player.hasPicked()) {

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
        console.log("falsche Bestellung");
      }
    }
  }

  resetSubmissionAreaOnInteraction() {
    this.submissionArea.renderObject.rectColor = "#7D0A0A"
  }
  }

