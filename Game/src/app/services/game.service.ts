// app/services/game.service.ts

import { Injectable } from '@angular/core';
import { Gamefield } from '../models/gamefield/gamefield';
import { Player } from '../models/player/player';
import { InteractableManager } from '../models/interactableObject/interactable-manager';
import { Hitbox } from '../interfaces/hitbox';
import { RenderingService } from './rendering.service';
import { Coordinates } from '../models/coordinates/coordinates';
import { UIService } from './ui.service';
import { Products } from '../models/product/products';
import { ConveyorBeltManager } from '../models/conveyor-belt/conveyor-belt-manager';
import { SlotMachineService } from './slot-machine.service';
import { SlotMachine } from '../models/slot-machine/slot-machine';


@Injectable({
  providedIn: 'root'
})
export class GameService {

  // Gibt an, ob das Spiel aktuell läuft
  private GameRunning!: boolean;

  // Canvas und Rendering
  private ctx!: CanvasRenderingContext2D;
  private angle!: number;
  private playerVelocity!: number; // Pixel pro Sekunde

  // Spielobjekte
  private gamefield!: Gamefield;
  private player!: Player;
  private interactableManager!: InteractableManager;
  private conveyorBeltManager!: ConveyorBeltManager;
  private slotMachine!: SlotMachine;

  // Input und Assets
  private inputs: Record<string, boolean> = {};
  private images: { [key: string]: HTMLImageElement } = {};

  constructor(private uiService: UIService) { }


  /**
   * Initialisiert das Spiel, setzt Startwerte und lädt Bilder vor.
   * @param ctx CanvasRenderingContext2D zum Zeichnen
   * @param ctxUI
   */
  async init(ctx: CanvasRenderingContext2D, ctxUI: CanvasRenderingContext2D) {
    // Initialisiere UI Service
       this.gamefield = new Gamefield();

    // Initialisiere Canvas und Rendering
    this.ctx = ctx;
    this.angle = 0 / 360 * 2 * Math.PI; // 30 Grad in Radiant
    RenderingService.instance().init(this.ctx, this.images, this.angle);
    SlotMachineService.instance().init(this.ctx, this.images, this.gamefield);
    this.uiService.init(ctxUI, this.angle, this.images);
    // Initialisiere Eingaben
    this.inputs = { 'w': false, 'a': false, 's': false, 'd': false, 'e': false};

    // Initialisiere Spielobjekte
    this.playerVelocity = Gamefield.fieldsize * 4; // in Pixel pro Sekunde
    this.player = new Player(
      new Hitbox(new Coordinates(200, 250), Gamefield.fieldsize * 4/5 , Gamefield.fieldsize * 2/5),
      this.playerVelocity,
      this.gamefield
    );
    this.interactableManager = new InteractableManager(this.gamefield, this.uiService, this.inputs);





    // Lade benötigte Texturen vor
    const baseImages = ["/images/StoneFloorTexture.png", "/images/wall.png", "/images/Concrete-Floor-Tile.png", "/images/package.png", "/images/Brick_01-512x512.png", "/images/interaction-field.png", "/images/machine.png"];
    const machineImages = this.interactableManager.getMachines().map(m => m.imgUnlocked);
    const productImages = Products.getAllProducts().map(m => m.img).filter((img): img is string => img !== undefined);
    const foxImages = ["/images/fox/walking_1.png", "/images/fox/walking_2.png", "/images/fox/walking_3.png", "/images/fox/walking_4.png", "/images/fox/fox.png", "/images/fox/sitting.png",
      "/images/fox/1-fox-holding.png", "/images/fox/2-fox-holding.png", "/images/fox/3-fox-holding.png", "/images/fox/4-fox-holding.png", "/images/fox/walking_5.png", "/images/fox/fox-coin.png"
    ]
    const slotMachineImages = ["/images/slotMachine/cherry.png", "/images/slotMachine/Bar.png", "/images/slotMachine/seven.png", "/images/slotMachine/diamond.png", "/images/slotMachine/lemon.png", "/images/slotMachine/ifm.png", "/images/slotMachine/manure.png", "/images/slotMachine/squirrel.png", "/images/slotMachine/slot-machine.png"];
    const keyBindingImages = [
      "/images/KeyBindings/keyBindings_,.png",
      "/images/KeyBindings/keyBindings_..png",
      "/images/KeyBindings/keyBindings_0.png",
      "/images/KeyBindings/keyBindings_1.png",
      "/images/KeyBindings/keyBindings_2.png",
      "/images/KeyBindings/keyBindings_3.png",
      "/images/KeyBindings/keyBindings_4.png",
      "/images/KeyBindings/keyBindings_5.png",
      "/images/KeyBindings/keyBindings_6.png",
      "/images/KeyBindings/keyBindings_7.png",
      "/images/KeyBindings/keyBindings_8.png",
      "/images/KeyBindings/keyBindings_9.png",
      "/images/KeyBindings/keyBindings_A.png",
      "/images/KeyBindings/keyBindings_B.png",
      "/images/KeyBindings/keyBindings_C.png",
      "/images/KeyBindings/keyBindings_D.png",
      "/images/KeyBindings/keyBindings_E.png",
      "/images/KeyBindings/keyBindings_F.png",
      "/images/KeyBindings/keyBindings_G.png",
      "/images/KeyBindings/keyBindings_H.png",
      "/images/KeyBindings/keyBindings_I.png",
      "/images/KeyBindings/keyBindings_J.png",
      "/images/KeyBindings/keyBindings_K.png",
      "/images/KeyBindings/keyBindings_L.png",
      "/images/KeyBindings/keyBindings_M.png",
      "/images/KeyBindings/keyBindings_N.png",
      "/images/KeyBindings/keyBindings_O.png",
      "/images/KeyBindings/keyBindings_P.png",
      "/images/KeyBindings/keyBindings_Q.png",
      "/images/KeyBindings/keyBindings_R.png",
      "/images/KeyBindings/keyBindings_S.png",
      "/images/KeyBindings/keyBindings_T.png",
      "/images/KeyBindings/keyBindings_U.png",
      "/images/KeyBindings/keyBindings_V.png",
      "/images/KeyBindings/keyBindings_W.png",
      "/images/KeyBindings/keyBindings_X.png",
      "/images/KeyBindings/keyBindings_Y.png",
      "/images/KeyBindings/keyBindings_Z.png",
      "/images/KeyBindings/keyBindings_Left.png",
      "/images/KeyBindings/keyBindings_Right.png",
      "/images/KeyBindings/keyBindings_Up.png",
      "/images/KeyBindings/keyBindings_Down.png",
      "/images/KeyBindings/keyBindings_Controller_Left.png",
      "/images/KeyBindings/keyBindings_Controller_Right.png",
      "/images/KeyBindings/keyBindings_Controller_Up.png",
      "/images/KeyBindings/keyBindings_Controller_Down.png",
      "/images/KeyBindings/keyBindings_Controller_Button_1.png",
      "/images/KeyBindings/keyBindings_Controller_Button_2.png",
      "/images/KeyBindings/keyBindings_Controller_Button_3.png",
      "/images/KeyBindings/keyBindings_Controller_Button_4.png",
      "/images/KeyBindings/keyBindings_Controller_Button_5.png",
      "/images/KeyBindings/keyBindings_Controller_Button_6.png",
    ]
    const allImages = [...new Set([...baseImages, ...machineImages, ...productImages, ...foxImages, ...keyBindingImages, ...slotMachineImages])];
    await this.preloadImages(allImages);

    // Füge Spielfeld zum Rendering-Buffer hinzu
    this.interactableManager.addToInteractableObjects();
    this.gamefield.addGameFieldToRenderingBuffer();
    this.gamefield.updateConveyorBelts(ConveyorBeltManager.getConveyorBelts());
    this.conveyorBeltManager = new ConveyorBeltManager(this.gamefield);
    Products.generateProducts();
  }

  /**
   * Lädt mehrere Bilder asynchron vor und speichert sie im images-Objekt.
   * @param srcs Array mit Bildpfaden
   */
  async preloadImages(srcs: string[]) {
    const promises = srcs.map(src => this.loadImage(src).then(img => this.images[src] = img));
    await Promise.all(promises);
  }

  /**
   * Lädt ein einzelnes Bild asynchron.
   * @param src Bildpfad
   * @returns Promise mit geladenem HTMLImageElement
   */
  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image from ${src}`));
      img.src = src;
    });
  }

  /**
   * Startet die Hauptspielschleife (Game Loop).
   * Zeichnet und aktualisiert das Spiel solange GameRunning true ist.
   */
  startGame() {
    this.GameRunning = true;
    this.ctx.imageSmoothingEnabled = true;
    const loop = () => {
      if (!this.GameRunning) return;

      // Bildschirm löschen
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      // Update-Phase
      RenderingService.instance().updateFPS()
      this.player.changeVelocity();
      this.player.updatePlayer();

      this.interactableManager.checkForInteraction(this.player);

      // Interaktionslogik: erst aufnehmen, sonst ablegen
      this.player.pickProduct();
      this.player.dropProduct();

      this.conveyorBeltManager.update();
      this.conveyorBeltManager.refreshGamefield();

      // Render-Phase
      this.player.render();
      this.player.updateProductInHand();
      RenderingService.instance().convertToCameraPOV(this.player.camera);
      //RenderingService.instance().zoomOut();
      RenderingService.instance().render();

      if(this.interactableManager.checkPlayerInSlotMachineArea(this.player))
      {
        this.player.cameraFix = false;
        RenderingService.instance().rotateInSlotMachine(this.interactableManager.slotMachine);
        SlotMachineService.instance().setInput(this.inputs);
      }
      else
      {
        //this.player.cameraFix = true;
        this.interactableManager.slotMachine.priority = 0;
        if(RenderingService.instance().zoomOut()) this.player.cameraFix = true;
        RenderingService.instance().rotateMap();
      }

      // Render Particles
      this.interactableManager.resetParticleFields();
      this.interactableManager.checkPackageInHand(this.player);
      this.interactableManager.checkMachineNeedsProduct(this.player);

      // Draw machines Item Needs Popup
      this.uiService.drawMachineNeedsPopup(this.interactableManager.getMachines(), [RenderingService.instance().xOffset, RenderingService.instance().yOffset], RenderingService.instance().fov)
      this.uiService.drawMachineProducingPopup(this.interactableManager.getMachines(), [RenderingService.instance().xOffset, RenderingService.instance().yOffset], RenderingService.instance().fov)

      if (this.player.inventory === null) {
        // Prüfen, ob ein Item in der Nähe ist
        const itemInRange = Products.checkForInteraction(this.player.hitbox);

        if (itemInRange) {
          this.uiService.drawItemPopup(itemInRange, [RenderingService.instance().xOffset, RenderingService.instance().yOffset], RenderingService.instance().fov);
        } else {
          this.uiService.clearItemPopup();
        }

      } else {
        // Wenn wir was tragen: Sicherstellen, dass das Popup weg ist!
        this.uiService.clearItemPopup();
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  stopGame() {
    this.GameRunning = false;
  }

  setInput(key: string, pressed: boolean) {
    this.inputs[key] = pressed;
    this.player.setInput(this.inputs)
  }
}
