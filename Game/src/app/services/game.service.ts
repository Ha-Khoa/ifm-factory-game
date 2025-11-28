
// Importiere notwendige Angular- und Projektmodule
import { Injectable } from '@angular/core';
import { Gamefield } from '../models/gamefield/gamefield';
import { Machine } from '../models/machine/machine';
import { Player } from '../models/player/player';
import { MachineManager } from '../models/machine/machine-manager';
import { Hitbox } from '../interfaces/hitbox';
import { Rendering } from '../models/rendering/rendering';
import { RenderObject } from '../models/rendering/render-object';
import { Coordinates } from '../models/coordinates/coordinates';
import { UIService } from './ui.service';


@Injectable({
  providedIn: 'root'
})
export class GameService {

  // Gibt an, ob das Spiel aktuell läuft
  private GameRunning!: boolean;

  // Canvas und Rendering
  private ctx!: CanvasRenderingContext2D;
  private renderer!: Rendering;
  private angle!: number;
  private playerVelocity!: number; // Pixel pro Sekunde

  // Spielobjekte
  private gamefield!: Gamefield;
  private player!: Player;
  private machineManager!: MachineManager;
  private machines: Machine[] = [];

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
    this.angle = 30 / 360 * Math.PI * 2;
    this.renderer = new Rendering(this.ctx, this.images, this.angle);
    this.playerVelocity = 200; // in Pixel pro Sekunde
    this.uiService.init(ctxUI, this.angle);

    // Initialisiere Eingaben
    this.inputs = { 'w': false, 'a': false, 's': false, 'd': false };

    // Lade benötigte Texturen vor
    await this.preloadImages(["/images/StoneFloorTexture.png", "/images/wall.png", "/images/Concrete-Floor-Tile.png"]);

    // Initialisiere Spielobjekte
    this.gamefield = new Gamefield();
    this.player = new Player(
      new Hitbox(new Coordinates(50, 50), 40, 40),
      "",
      this.playerVelocity,
      this.gamefield,
      this.renderer
    );
    this.machineManager = new MachineManager(this.gamefield, this.renderer, this.uiService);
    this.machines = this.machineManager.getMachines();

    // Füge Spielfeld zum Rendering-Buffer hinzu
    this.gamefield.updateMachines(this.machines);
    this.gamefield.addGameFieldToRenderingBuffer(this.renderer);
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
      this.player.changeVelocity();
      this.player.updatePlayer();
      this.machineManager.checkForInteraction(this.player.hitbox);
      this.renderer.rotateMap();

      // Render-Phase
      this.player.render();
      this.renderer.render();

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
