import { Gamefield } from "../gamefield/gamefield";
import { Machine } from "../machine/machine";
import { Products } from "../product/products";
import { Product } from "../product/product";
import { Hitbox } from "../../interfaces/hitbox";
import { Collision } from "../collision/collision";
import { RenderingService} from "../../services/rendering.service";
import { RenderObject } from "../rendering/render-object";
import { RenderType } from "../../enums/render-type";
import {PlayerService} from '../../services/player.service';
import { Direction } from "../../enums/direction";
import { Coordinates } from "../coordinates/coordinates";
import { UIService } from "../../services/ui.service";
import { Player } from "../player/player";
import { SubmissionArea } from "../submission-area/submission-area";
import { InputService } from "../../services/input.service";
import { InteractableObject } from "./interactable-object";
import { Package } from "../package/package";
import { SlotMachine } from "../slot-machine/slot-machine";
import { PrepMachine } from "../preProcess/prep-machine";

/**
 * MachineManager-Klasse: Verwaltet alle Maschinen im Spiel.
 * Handhabt Unlock-Status, Interaktions-Checks und visuelle Feedback-Effekte.
 */
export class InteractableManager {
    private _gamefield: Gamefield;
    private ui: UIService;
    private playerService: PlayerService;
    private machines: Machine[] = [
      new Machine(Gamefield.fieldsize * 8, Gamefield.fieldsize * 5, 40,Gamefield.fieldsize, Gamefield.fieldsize, "Machine: Photo Diode", "/images/machine1.png", "/images/wall.png",
                  [Direction.UP], Products.getProductById(11)!, RenderType.THREE_D_IMG, new Coordinates(Gamefield.fieldsize, 0, 0)),
      // Plastic Case-Maschine (benötigt Raw Plastic)
      new Machine(Gamefield.fieldsize * 2, Gamefield.fieldsize * 15, 40,Gamefield.fieldsize, Gamefield.fieldsize, "Machine: Kunstoffgehäuse", "/images/machine2.png", "/images/wall.png",
                  [Direction.RIGHT], Products.getProductById(4)!, RenderType.THREE_D_IMG,new Coordinates(Gamefield.fieldsize, 0, 0)),
      new Machine(Gamefield.fieldsize * 2, Gamefield.fieldsize * 10, 40,Gamefield.fieldsize, Gamefield.fieldsize, "Machine: Platine", "/images/machine3.png", "/images/wall.png",
                  [Direction.RIGHT], Products.getProductById(5)!, RenderType.THREE_D_IMG, new Coordinates(Gamefield.fieldsize, 0, 0)),
      new Machine(Gamefield.fieldsize * 24, Gamefield.fieldsize * 2, 40, Gamefield.fieldsize * 2.5, Gamefield.fieldsize, "Machine: Photo Sensor", "/images/machine4.png", "/images/wall.png",
                  [Direction.LEFT], Products.getProductById(10)!, RenderType.THREE_D_IMG, new Coordinates(Gamefield.fieldsize, 0, 20), 8000),
      new Machine(Gamefield.fieldsize * 24, Gamefield.fieldsize * 6, 40, Gamefield.fieldsize * 2.5, Gamefield.fieldsize, "Machine: Temperatur Sensor", "/images/machine4.png", "/images/wall.png",
                  [Direction.LEFT], Products.getProductById(12)!, RenderType.THREE_D_IMG, new Coordinates(Gamefield.fieldsize, 0, 20), 8000),
      new Machine(Gamefield.fieldsize * 24, Gamefield.fieldsize * 10, 40, Gamefield.fieldsize * 2.5, Gamefield.fieldsize, "Machine: Druck Sensor", "/images/machine4.png", "/images/wall.png",
                  [Direction.LEFT], Products.getProductById(13)!, RenderType.THREE_D_IMG, new Coordinates(Gamefield.fieldsize, 0, 20), 8000),
      new Machine(Gamefield.fieldsize * 2, Gamefield.fieldsize * 20, 60,Gamefield.fieldsize, Gamefield.fieldsize, "Machine: Eisengehäuse", "/images/temp/press.png", "/images/wall.png",
                  [Direction.RIGHT], Products.getProductById(14)!, RenderType.THREE_D_IMG, new Coordinates(Gamefield.fieldsize, 0, 0)),
      new Machine(Gamefield.fieldsize * 2, Gamefield.fieldsize * 5, 40,Gamefield.fieldsize, Gamefield.fieldsize, "Machine: Kabel", "/images/machine3.png", "/images/wall.png",
                  [Direction.RIGHT], Products.getProductById(15)!, RenderType.THREE_D_IMG, new Coordinates(Gamefield.fieldsize, 0, 0)),
      new Machine(Gamefield.fieldsize * 8, Gamefield.fieldsize * 11, 40,Gamefield.fieldsize, Gamefield.fieldsize, "Machine: Thermoelement", "/images/machine3.png", "/images/wall.png",
                  [Direction.DOWN], Products.getProductById(17)!, RenderType.THREE_D_IMG, new Coordinates(Gamefield.fieldsize, 0, 0)),
      new Machine(Gamefield.fieldsize * 8, Gamefield.fieldsize * 16, 40,Gamefield.fieldsize, Gamefield.fieldsize, "Machine: Messzelle", "/images/machine3.png", "/images/wall.png",
                  [Direction.UP], Products.getProductById(16)!, RenderType.THREE_D_IMG, new Coordinates(-Gamefield.fieldsize, 0, 0))
    ];
    private _slotMachine!: SlotMachine;

    private _submissionArea:SubmissionArea;

  constructor(_gamefield: Gamefield, ui: UIService, inputService: InputService, playerService: PlayerService) {
    this._gamefield = _gamefield;
    this.ui = ui;
    this.playerService = playerService;
    this._slotMachine = new SlotMachine(7 * Gamefield.fieldsize, 24 * Gamefield.fieldsize, this._gamefield);
    this._submissionArea = new SubmissionArea(
      new Coordinates(Gamefield.fieldsize * 30, Gamefield.fieldsize * 13, 50),
      Gamefield.fieldsize,
      2 * Gamefield.fieldsize,
      this.playerService
    );

    this.machines.forEach((machine) => {
      this.generateInteractionField(machine)
      this.addParticleField(machine)
    })
    this.generateInteractionField(this._submissionArea)
    this.setSubmissionAreaParticles()
    this.generateInteractionField(this._slotMachine)
    this._submissionArea.particleRenderObjects.forEach((particleRenderObject) => {
       particleRenderObject.ptype = "straightUp";
      particleRenderObject.spawnType = "empty";
      particleRenderObject.colors = ["#FFFFFF"];
      particleRenderObject.render = false;
      RenderingService.instance().addRenderObject(particleRenderObject)
    })
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
      this._gamefield.interactableObjects.push(this._submissionArea.renderObject);
    });
  }

  setSubmissionAreaParticles()
  {
    for(let particleRenderObject of this._submissionArea.particleRenderObjects)
    {
      //particleRenderObject.ptype = "straightUp";
      //particleRenderObject.spawnType = "empty";
    }
  }

  checkPlayerInSlotMachineArea(player: Player) : boolean
  {
    const collision = this.interactionObject(this._slotMachine, player);
    return collision;
  }

  checkMachineNeedsProduct(player: Player)
  {
    if(!player.inventory || !(player.inventory instanceof Product)) { return }
    for(let machine of this.machines) {
      for(let productRequirements of machine.inputRequirements) {
        let name = productRequirements.product.name;
        if(name === player.inventory.name) {
          let needsProduct = true;
          if(machine.getQuantityOfThisMissingProduct(player.inventory) === 0) {
            needsProduct = false;
            break;
          }
          if(needsProduct) {
            this.enableParticleField(machine);
          }
        }
      }
    }
  }

  checkPackageInHand(player: Player)
  {
    if(!player.inventory || !(player.inventory instanceof Package)) { return }
    for(let particleRenderObject of this._submissionArea.particleRenderObjects)
    {
      particleRenderObject.render = true;
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
    for(let particleRenderObject of this._submissionArea.particleRenderObjects)
    {
      particleRenderObject.render = false;
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

    // Check PrepMachines
    if (!collision) {
      for (let obj of this._gamefield.interactableObjects) {
        if (obj instanceof PrepMachine) {
          const prepMachine = obj as PrepMachine;
          collision = this.interactionObjectPrepMachine(prepMachine, player);
          if (collision) {
            this.updatePrepMachineOnInteraction(prepMachine, player);
            break;
          }
        }
      }
    }

    if (!collision) {
      this.resetMachineOnInteraction();
    }

    // Kollision mit Submission Area prüfen
    if (this.interactionObject(this._submissionArea, player))
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
      const interactionX = direction === Direction.RIGHT ? interactableObject.position.x + interactableObject.width :
                           direction === Direction.LEFT ? interactableObject.position.x - Gamefield.fieldsize : interactableObject.position.x;
      const interactionY = direction === Direction.DOWN ? interactableObject.position.y + interactableObject.height :
                           direction === Direction.UP ? interactableObject.position.y - Gamefield.fieldsize : interactableObject.position.y;
      const interactionHeight = direction === Direction.DOWN || direction === Direction.UP ?  Gamefield.fieldsize : interactableObject.height;
      const interactionWidth = direction === Direction.RIGHT || direction === Direction.LEFT ? Gamefield.fieldsize : interactableObject.width;

      const interactionHitbox: Hitbox = new Hitbox(
        new Coordinates(interactionX, interactionY),
        interactionWidth,
        interactionHeight
      );
      const collision = Collision.checkCollision(player.hitbox, interactionHitbox);
      if (collision) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check Interaktion mit PrepMachine (die extends RenderObject, nicht InteractableObject)
   */
  interactionObjectPrepMachine(prepMachine: PrepMachine, player: Player): boolean {
    // PrepMachine  von allen Seiten (ähnlich wie ein Tisch) interagierbar
    const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];

    for (let direction of directions) {
      const interactionX = direction === Direction.RIGHT ? prepMachine.x + prepMachine.width :
                           direction === Direction.LEFT ? prepMachine.x - Gamefield.fieldsize : prepMachine.x;
      const interactionY = direction === Direction.DOWN ? prepMachine.y + prepMachine.height :
                           direction === Direction.UP ? prepMachine.y - Gamefield.fieldsize : prepMachine.y;
      const interactionHeight = direction === Direction.DOWN || direction === Direction.UP ? Gamefield.fieldsize : prepMachine.height;
      const interactionWidth = direction === Direction.RIGHT || direction === Direction.LEFT ? Gamefield.fieldsize : prepMachine.width;

      const interactionHitbox: Hitbox = new Hitbox(
        new Coordinates(interactionX, interactionY),
        interactionWidth,
        interactionHeight
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
    if (player.pressedInteract === true && player.inventory instanceof Product) {
      const product: Product = player.inventory;
      let result;

      if (product && !Products.checkItemOnTable(machine.renderObject, product) && !machine.isProducing && !player.hasPicked()) {
       // console.log(`The user has the product ${product.name} and wants to add it to the machine ${machine.name}.
//The product is not already on the machine and the machine is not currently producing.`);
        result = await machine.addProduct(product);

        console.log(`The result of ading the product ${product.name} to the machine ${machine.name} is:`, result)
      }
      else {
        //console.log(`The user has the product ${product.name} and wants to add it to the machine ${machine.name}.
//The product is ${Products.checkItemOnTable(machine.renderObject, product) ? '' : 'not ' }already on the machine and the machine is currently ${machine.isProducing ? '' : 'not '}producing.`);
        result = false;
      }
      // Zutat erfolgreich hinzugefügt, warte auf weitere
      if (result === true) {
        // Remove product visuals and from global pool
        product.destroy();
        Products.deleteGeneratedProduct(product);
        player.inventory = null;
        console.log("Zutat hinzugefügt, wartet auf weitere Inputs");
      }
      // Zutat nicht benötigt, zurücklegen
      else if (result === false) {
        if (product && product.position) {
          //player.inventory = product;
          //ddplayer.dropProduct();
          //Products.addProduct(product, product.position);
        }
        console.log("Zutat nicht benötigt, zurückgelegt");
      }
    }
    // Visuelles Feedback: Maschine grün färben
    machine.renderObject.rectColor = "rgba(81, 255, 81, 1)";
    machine.renderObject.rectLayers = ["#08db08ff", "#03b603ff", "#009900", "#006600", "#003300"];
    this.ui.drawMachinePopUp(machine, player);
  }

  upgradeMachineOnInteraction(player: Player) {
    for(let machine of this.machines)
    {
    if (this.interactionObject(machine, player)) {
      machine.upgrade(this.playerService).subscribe({
        error: (err) => {
          console.error("Maschinen-Upgrade fehlgeschlagen:", err.message);
          // Optional: this.ui.showNotification("Upgrade fehlgeschlagen!", "error");
        }
      });
    }
  }
  }

  /**
   * Handelt Interaktion mit PrepMachine (zeige Popup)
   */
  updatePrepMachineOnInteraction(prepMachine: PrepMachine, player: Player) {
    // Visual feedback: color the machine green
    prepMachine.rectColor = "rgba(81, 255, 81, 1)";
    prepMachine.rectLayers = ["#08db08ff", "#03b603ff", "#009900", "#006600", "#003300"];
    // Cast to Machine for UI compatibility
    this.ui.drawMachinePopUp(prepMachine as any, player);
  }

  /**
   * Setzt alle Maschinen auf ihre normale Farbe zurück und schließt das UI-PopUp.
   */
  resetMachineOnInteraction() {
    this.getMachines().forEach(machine => {
      machine.renderObject.rectColor = "rgba(226, 229, 255, 1)";
      machine.renderObject.rectLayers = ["#a0c0ffff", "#8299ffff", "#546effff", "#2b39ffff", "#0000ffff"];
    });
    // Reset PrepMachines
    for (let obj of this._gamefield.interactableObjects) {
      if (obj.name.startsWith('PrepMachine_')) {
        obj.rectColor = "#FFE797";
        obj.rectLayers = ["#FCB53B", "#aa6a17ff"];
      }
    }
   // this.ui.clearMachinePopUp();
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
        RenderType.IMG,
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
      this._submissionArea.renderObject.rectColor = "#9c0e0eff";
      if (player.pressedInteract && player.inventory instanceof Package && !player.hasPicked()) {

      const packObj : Package = player.inventory;

      let result = this._submissionArea.addPackage(packObj);

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

  checkForSlotMachineInteraction(player: Player) : boolean
  {
    const collision = this.interactionObject(this._slotMachine, player);
    return collision;
  }

  resetSubmissionAreaOnInteraction() {
    this._submissionArea.renderObject.rectColor = "#7D0A0A"
  }

  get slotMachine(): SlotMachine {
    return this._slotMachine;
  }

  get submissionArea(): SubmissionArea
  {
    return this._submissionArea;
  }

  public getAllRenderObjects(): RenderObject[] {
    const renderObjects: RenderObject[] = [];
    this.machines.forEach(machine => renderObjects.push(machine.renderObject));
    renderObjects.push(this._slotMachine.renderObject);
    renderObjects.push(this._submissionArea.renderObject);
    return renderObjects;
  }

  }

