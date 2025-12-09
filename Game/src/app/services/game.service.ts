
// Importiere notwendige Angular- und Projektmodule
import { Injectable } from '@angular/core';
import { Gamefield } from '../models/gamefield/gamefield';
import { Player } from '../models/player/player';
import { InteractableManager } from '../models/interactableObject/interactable-manager';
import { Hitbox } from '../interfaces/hitbox';
import { RenderingService } from './rendering.service';
import { Coordinates } from '../models/coordinates/coordinates';
import { UIService } from './ui.service';
import { Products } from '../models/product/products';
import { SubmissionArea } from '../models/submission-area/submission-area';
import { ConveyorBeltManager } from '../models/conveyor-belt/conveyor-belt-manager';
import { Orders } from '../models/orders/orders';



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

  // Input und Assets
  private inputs: Record<string, boolean> = {};
  private images: { [key: string]: HTMLImageElement } = {};

  constructor(private uiService: UIService) { }


  /**
   * Initialisiert das Spiel, setzt Startwerte und lädt Bilder vor.
   * @param ctx CanvasRenderingContext2D zum Zeichnen
   */
  async init(ctx: CanvasRenderingContext2D, ctxUI: CanvasRenderingContext2D) {
    // Initialisiere UI Service


    // Initialisiere Canvas und Rendering
    this.ctx = ctx;
    this.angle = 30 / 360 * 2 * Math.PI; // 30 Grad in Radiant
    RenderingService.instance().init(this.ctx, this.images, this.angle);
    this.playerVelocity = 200; // in Pixel pro Sekunde
    this.uiService.init(ctxUI, this.angle);

    // Initialisiere Eingaben
    this.inputs = { 'w': false, 'a': false, 's': false, 'd': false, 'e': false };

    // Initialisiere Spielobjekte
    this.gamefield = new Gamefield();
    this.player = new Player(
      new Hitbox(new Coordinates(50, 50), 45, 20),
      this.playerVelocity,
      this.gamefield,
      50
    );
    this.interactableManager = new InteractableManager(this.gamefield, this.uiService, this.inputs);


    // Lade benötigte Texturen vor
    const baseImages = ["/images/StoneFloorTexture.png", "/images/wall.png", "/images/Concrete-Floor-Tile.png", "/images/package.png"];
    const machineImages = this.interactableManager.getMachines().map(m => m.imgUnlocked);
    const productImages = Products.getAllProducts().map(m => m.img).filter((img): img is string => img !== undefined);
    const foxImages = ["/images/fox/walking_1.png", "/images/fox/walking_2.png", "/images/fox/walking_3.png", "/images/fox/walking_4.png", "/images/fox/fox.png", "/images/fox/sitting.png"]
    const allImages = [...new Set([...baseImages, ...machineImages, ...productImages, ...foxImages])];
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
      //this.renderer.rotateMap();


      // Interaktionslogik: erst aufnehmen, sonst ablegen
      this.player.pickProduct();
      this.player.dropProduct();

      this.conveyorBeltManager.update();
      this.conveyorBeltManager.refreshGamefield();

      // Render-Phase
      this.player.render();
      this.player.updateProductInHand();
      RenderingService.instance().render();
      

      // Debug UI
      this.uiService.debugProduct(this.player)

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /**
   * Stoppt die Hauptspielschleife.
   */
  stopGame() {
    this.GameRunning = false;
  }










  /**
   * Setzt den Status einer Taste (gedrückt/losgelassen).
   * @param key Taste (z.B. 'w', 'a', 's', 'd')
   * @param pressed true, wenn gedrückt
   */
  setInput(key: string, pressed: boolean) {
    this.inputs[key] = pressed;
    this.player.setInput(this.inputs)
  }
}
