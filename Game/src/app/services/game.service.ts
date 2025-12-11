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
import { Orders } from '../models/orders/orders';
import { Particle } from '../models/particle/particle';
import { ParticleRenderObject } from '../models/rendering/particle-render-object';



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

    this.uiService.init(ctxUI, this.angle);

    // Initialisiere Eingaben
    this.inputs = { 'w': false, 'a': false, 's': false, 'd': false, 'e': false };

    // Initialisiere Spielobjekte
    this.gamefield = new Gamefield();
    this.playerVelocity = Gamefield.fieldsize * 4; // in Pixel pro Sekunde
    this.player = new Player(
      new Hitbox(new Coordinates(50, 50), Gamefield.fieldsize * 4/5 , 30),
      this.playerVelocity,
      this.gamefield
    );
    this.interactableManager = new InteractableManager(this.gamefield, this.uiService, this.inputs);


    // Lade benötigte Texturen vor
    const baseImages = ["/images/StoneFloorTexture.png", "/images/wall.png", "/images/Concrete-Floor-Tile.png", "/images/package.png", "/images/Brick_01-512x512.png", "/images/interaction-field.png"];
    const machineImages = this.interactableManager.getMachines().map(m => m.imgUnlocked);
    const productImages = Products.getAllProducts().map(m => m.img).filter((img): img is string => img !== undefined);
    const foxImages = ["/images/fox/walking_1.png", "/images/fox/walking_2.png", "/images/fox/walking_3.png", "/images/fox/walking_4.png", "/images/fox/fox.png", "/images/fox/sitting.png",
      "/images/fox/1-fox-holding.png", "/images/fox/2-fox-holding.png", "/images/fox/3-fox-holding.png", "/images/fox/4-fox-holding.png", "/images/fox/walking_5.png"
    ]
    const allImages = [...new Set([...baseImages, ...machineImages, ...productImages, ...foxImages])];
    await this.preloadImages(allImages);

    // Füge Spielfeld zum Rendering-Buffer hinzu
    this.interactableManager.addToInteractableObjects();
    this.gamefield.addGameFieldToRenderingBuffer();
    this.gamefield.updateConveyorBelts(ConveyorBeltManager.getConveyorBelts());
    this.conveyorBeltManager = new ConveyorBeltManager(this.gamefield);
    Products.generateProducts();
    
    const particleRenderObject2 = new ParticleRenderObject(
      "particle_02",
      Gamefield.fieldsize * 28,
      Gamefield.fieldsize * 5,
      0,
      Gamefield.fieldsize,
      Gamefield.fieldsize * 2,
      200,
      "straightUp",
      "rect",
      ["#9b1414ff"]
    );
    RenderingService.instance().addRenderObject(particleRenderObject2);
    const particleRenderObject3 = new ParticleRenderObject(
      "particle_03",
      Gamefield.fieldsize * 4,
      Gamefield.fieldsize * 7,
      0,
      Gamefield.fieldsize,
      Gamefield.fieldsize,
      100,
      "straightUp",
      "rect",
      ["#ffffffff", "#d8d876ff", "#f1f1f1ff", "#FFFF00"]
    );
        RenderingService.instance().addRenderObject(particleRenderObject3);
    const particleRenderObject1 = new ParticleRenderObject(
      "particle_01",
      Gamefield.fieldsize * 8,
      Gamefield.fieldsize * 5,
      0,
      Gamefield.fieldsize,
      Gamefield.fieldsize,
      100,
      "straightUp",
      "rect",
      ["#ffffffff", "#d8d876ff", "#f1f1f1ff", "#FFFF00"]
    );
        RenderingService.instance().addRenderObject(particleRenderObject1);
    const particleRenderObject4 = new ParticleRenderObject(
      "particle_04",
      Gamefield.fieldsize * 4,
      Gamefield.fieldsize * 5,
      0,
      Gamefield.fieldsize,
      Gamefield.fieldsize,
      100,
      "straightUp",
      "rect",
      ["#ffffffff", "#d8d876ff", "#f1f1f1ff", "#FFFF00"]
    );

    RenderingService.instance().addRenderObject(particleRenderObject4);
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
      RenderingService.instance().rotateMap();

      // Interaktionslogik: erst aufnehmen, sonst ablegen
      this.player.pickProduct();
      this.player.dropProduct();

      this.conveyorBeltManager.update();
      this.conveyorBeltManager.refreshGamefield();

      // Render-Phase
      this.player.render();
      this.player.updateProductInHand();
      RenderingService.instance().render();
      

      if (this.player.inventory === null) {
        
        // Prüfen, ob ein Item in der Nähe ist
        const itemInRange = Products.checkForInteraction(this.player.hitbox);

        if (itemInRange) {
          this.uiService.drawItemPopup(itemInRange);
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