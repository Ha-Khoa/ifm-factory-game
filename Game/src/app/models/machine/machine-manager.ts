import { Gamefield } from "../gamefield/gamefield";
import { Machine } from "./machine";
import { Products } from "../product/products";
import { Product } from "../../interfaces/product";
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
 * Handhabt Unlock-Status, Rendering und Interaktions-Checks.
 */
export class MachineManager {
    // Referenz zum Spielfeld
    private _gamefield: Gamefield;
    // Referenz zur UI
    private ui: UIService;

    private _inputs: Record<string, boolean> = {};

    static machines: Machine[] = [
      // Reihenfolge: x, y, width, height, name, imgUnlocked, imgLocked, accessDirection, outputProduct, inputRequirements
      new Machine(600, 400, 50, 50, "Sensor", "/images/wall.png", "/images/wall.png", Direction.DOWN, Products.getProductByName("Basic Sensor")!, [Products.getProductByName("Raw Silicon")!, Products.getProductByName("Circuit Board")!]),
      new Machine(500, 450, 50, 50, "Plastic Case", "/images/wall.png", "/images/wall.png", Direction.LEFT, Products.getProductByName("Plastic Case")!, [Products.getProductByName("Raw Plastic")!])
    ];
  
  constructor(_gamefield: Gamefield, ui: UIService, inputs: Record<string, boolean>) {
    this._gamefield = _gamefield;
    this.ui = ui;
    this._inputs = inputs;
    this.updateUnlockedMachine(0)
    this.updateUnlockedMachine(1)
  }

  /**
   * Gibt alle Maschinen zurück.
   * @returns Array aller Maschinen
   */
  getMachines(): Machine[] {
    return MachineManager.machines;
  }

  /**
   * Schaltet eine Maschine frei (unlock).
   * @param id ID der freizuschaltenden Maschine
   */
  updateUnlockedMachine(id: number) {
    MachineManager.machines[id].unlocked = true;

  }


  addToRenderingBuffer(){
    MachineManager.machines.forEach(machine => {
      const imgMachine = machine.unlocked ? machine.imgUnlocked : machine.imgLocked;
      new RenderObject(
        machine.name,
        "rect",
        machine.x,
        machine.y,
        50,
        this._gamefield.fieldsize,
        this._gamefield.fieldsize,
        0,
        undefined,
        undefined,
        "rgba(200, 206, 255, 1)",
        ["#a0c0ffff", "#8299ffff", "#546effff", "#2b39ffff", "#0000ffff"]
      )
    });

  }


  /**
   * Prüft ob der Spieler mit einer Maschine interagieren kann.
   * Berechnet Interaktionszonen basierend auf accessDirection und prüft Kollision.
   * @param player Hitbox des Spielers
   */
  checkForInteraction(player: Player) {
    for (let machine of MachineManager.machines)
    {
      const accessDirection = machine.accessDirection;
      const interactionX = accessDirection === Direction.RIGHT ? machine.x + this._gamefield.fieldsize :
                           accessDirection === Direction.LEFT ? machine.x - this._gamefield.fieldsize : machine.x;
      const interactionY = accessDirection === Direction.DOWN ? machine.y + this._gamefield.fieldsize :
                           accessDirection === Direction.UP ? machine.y - this._gamefield.fieldsize : machine.y;
      const interactionWidth = this._gamefield.fieldsize;
      const interactionHeight = this._gamefield.fieldsize;

      const interactionHitbox: Hitbox = new Hitbox(new Coordinates(interactionX, interactionY), interactionWidth, interactionHeight);

      const collision = Collision.checkCollision(player.hitbox, interactionHitbox);
      if (collision) {
        this.updateMachineOnInteraction(machine, player);
        return;
      }
    }
    this.resetMachineOnInteraction();

  }


  /**
   * Aktualisiert die Darstellung einer Maschine bei Interaktion (färbt sie grün).
   * @param machine Die Maschine, die interagiert wird
   * @param interactionHitbox Hitbox der Interaktionszone
   */
  async updateMachineOnInteraction(machine: Machine, player: Player)
  {
    if (this._inputs["e"] === true && machine.unlocked && player.inventory)
    {
      const product = player.dropProduct(false);
      let result = null;
      if(product){
        result = await machine.addProduct(product);
      }
      if (result instanceof Object) {
          const produced = result as Product;

        console.log("Produkt produziert:", produced.name, machine.x, machine.y);
        Products.addProduct(produced, new Coordinates(machine.x + this._gamefield.fieldsize / 2 - 10, machine.y - this._gamefield.fieldsize / 2 + 10));
      } else if (result === true) {

        console.log("Zutat hinzugefügt, wartet auf weitere Inputs");


      } else if (result === false) {

        if (product && product.position) {
          Products.addProduct(product, product.position);
        }
        console.log("Zutat nicht benötigt zurückgelegt");
      }
    }
    RenderingService.instance().deleteRenderingObjektByName(`machine:${machine.name}`);

        RenderingService.instance().addRenderObject(new RenderObject(
          `machine:${machine.name}`,
          "rect",
          machine.x,
          machine.y,
          50,
          machine.width,
          machine.height,
          0,
          undefined,
          undefined,
          "rgba(81, 255, 81, 1)",
          ["#08db08ff", "#03b603ff", "#009900", "#006600", "#003300"]
        ));
    this.ui.drawMachinePopUp(machine);
  }



  /**
   * Setzt die Darstellung einer Maschine zurück (normale Farbe) und zeigt Interaktionsfeld.
   * @param machine Die Maschine
   * @param interactionHitbox Hitbox der Interaktionszone
   */
  resetMachineOnInteraction() {
    MachineManager.machines.forEach((machine) => {
    RenderingService.instance().deleteRenderingObjektByName(machine.name);
    RenderingService.instance().addRenderObject(new RenderObject(
      machine.name,
      "rect",
      machine.x,
      machine.y,
      50,
      machine.width,
      machine.height,
      0,
      undefined,
      undefined,
      "rgba(226, 229, 255, 1)",
      ["#a0c0ffff", "#8299ffff", "#546effff", "#2b39ffff", "#0000ffff"]

    ));
    
    this.ui.clearMachinePopUp()
  })
}
}
