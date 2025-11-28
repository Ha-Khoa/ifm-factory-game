import { Gamefield } from "../gamefield/gamefield";
import { Machine } from "./machine";
import { Products } from "../product/products";
import { Hitbox } from "../../interfaces/hitbox";
import { Collision } from "../collision/collision";
import { Rendering } from "../rendering/rendering";
import { RenderObject } from "../rendering/render-object";
import { Direction } from "../../enums/direction";
import { Coordinates } from "../coordinates/coordinates";
import { UIService } from "../../services/ui.service";

/**
 * MachineManager-Klasse: Verwaltet alle Maschinen im Spiel.
 * Handhabt Unlock-Status, Rendering und Interaktions-Checks.
 */
export class MachineManager {
  // Referenz zur UI
  private ui: UIService;
  // Referenz zum Spielfeld
  private _gamefield: Gamefield;
  // Referenz zum Renderer
  private _renderer: Rendering;
  static machines: Machine[] = [
    // Reihenfolge: x, y, width, height, name, imgUnlocked, imgLocked, accessDirection, outputProduct, inputRequirements
    new Machine(600, 400, 50, 50, "Sensor", "/images/wall.png", "/images/wall.png", Direction.DOWN, Products.getProductByName("Basic Sensor")!, [Products.getProductByName("Raw Silicon")!, Products.getProductByName("Circuit Board")!]),
    new Machine(500, 450, 50, 50, "Plastic Case", "/images/wall.png", "/images/wall.png", Direction.LEFT, Products.getProductByName("Plastic Case")!, [Products.getProductByName("Raw Plastic")!])
  ];

  constructor(_gamefield: Gamefield, renderer: Rendering, ui: UIService) {
    this._gamefield = _gamefield;
    this._renderer = renderer;
    this.ui = ui;
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


  addToRenderingBuffer(_renderer: Rendering) {
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
  checkForInteraction(player: Hitbox) {

    MachineManager.machines.forEach(machine => {
      const accessDirection = machine.accessDirection;
      const interactionX = accessDirection === Direction.RIGHT ? machine.x + this._gamefield.fieldsize :
        accessDirection === Direction.LEFT ? machine.x - this._gamefield.fieldsize : machine.x;
      const interactionY = accessDirection === Direction.DOWN ? machine.y + this._gamefield.fieldsize :
        accessDirection === Direction.UP ? machine.y - this._gamefield.fieldsize : machine.y;
      const interactionWidth = this._gamefield.fieldsize;
      const interactionHeight = this._gamefield.fieldsize;

      const interactionHitbox: Hitbox = new Hitbox(new Coordinates(interactionX, interactionY), interactionWidth, interactionHeight);

      const collision = Collision.checkCollision(player, interactionHitbox);
      if (collision) {
        this.updateMachineOnInteraction(machine, interactionHitbox);
      } else {
        this.resetMachineOnInteraction(machine, interactionHitbox);
      }
    });
  }


  /**
   * Aktualisiert die Darstellung einer Maschine bei Interaktion (färbt sie grün).
   * @param machine Die Maschine, die interagiert wird
   * @param interactionHitbox Hitbox der Interaktionszone
   */
  updateMachineOnInteraction(machine: Machine, interactionHitbox: Hitbox) {
    this._renderer.deleteRenderingObjektByName(machine.name);

    this._renderer.addRenderObject(new RenderObject(
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
  resetMachineOnInteraction(machine: Machine, interactionHitbox: Hitbox) {
    this._renderer.deleteRenderingObjektByName(machine.name);
    this._renderer.addRenderObject(new RenderObject(
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
    this._renderer.deleteRenderingObjektByName(`interactionField-${machine.id}`)

    this._renderer.addRenderObject(new RenderObject(
      `interactionField-${machine.id}`,
      "rect",
      interactionHitbox.x,
      interactionHitbox.y,
      0,
      interactionHitbox.width,
      interactionHitbox.height,
      2,
      undefined,
      undefined,
      "#eef114ff",
      []
    ));
    this.ui.clearMachinePopUp(machine)
  }
}
