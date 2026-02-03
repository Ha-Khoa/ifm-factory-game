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

import { Subject, Subscription } from 'rxjs';
import {Orders} from '../models/orders/orders';
import {PlayerService} from './player.service';
import {PrepMachineManager} from "../models/preProcess/prep-machine-manager";
import { RenderObject } from '../models/rendering/render-object';
import { InputService } from './input.service';
import { SoundService } from './sound.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private gameLoopTick = new Subject<void>();
  public gameLoopTick$ = this.gameLoopTick.asObservable();

  private gameOverSubject = new Subject<void>();
  public gameOver$ = this.gameOverSubject.asObservable();

  public isPaused: boolean = false;
  static gamePad: boolean = true;

  public static gameOverNotEnoughMoney: boolean = false;

  private generateMoneyIntervall: number = 2000;
  private lastMoneyGenTime: number = 0;

  // Gibt an, ob das Spiel aktuell läuft
  public GameRunning!: boolean;

  // Canvas und Rendering
  private ctx!: CanvasRenderingContext2D;
  private angle!: number;
  private playerVelocity!: number; // Pixel pro Sekunde

  // Spielobjekte
  private gamefield!: Gamefield;
  private player!: Player;
  private player2?: Player;
  private _twoPlayerMode!: boolean;
  private interactableManager!: InteractableManager;
  private conveyorBeltManager!: ConveyorBeltManager;
  private prepMachine!: PrepMachineManager;

  public static _gameEnd: boolean = false;

  private ctxUI!: CanvasRenderingContext2D;

  // Input und Assets
  private inputs: Record<string, boolean> = {};
  private images: { [key: string]: HTMLImageElement } = {};
  private inputSubscription!: Subscription;

  constructor(private uiService: UIService, private playerService: PlayerService, private inputService: InputService, private soundService: SoundService) { }

  public pauseGame(): void {
    if (this.GameRunning) {
      this.isPaused = true;
      this.inputService.setInputState('menu');
      this.soundService.pauseSound('background_music');
    }
  }

  public resumeGame(): void {
    if (this.GameRunning) {
      this.isPaused = false;
      this.inputService.setInputState('game');
      this.soundService.resumeSound('background_music');
    }
  }

  public setGlobalGameVolume(volume: number): void {
    this.soundService.setGlobalVolume(volume);
  }

  public setGameSoundVolume(key: string, volume: number): void {
    this.soundService.setSoundVolume(key, volume);
  }

  public isGameLoopRunning(): boolean {
    return this.GameRunning;
  }


  /**
   * Initialisiert das Spiel, setzt Startwerte und lädt Bilder vor.
   * @param ctx CanvasRenderingContext2D zum Zeichnen
   * @param ctxUI
   */
  async init(ctx: CanvasRenderingContext2D, ctxUI: CanvasRenderingContext2D, TwoPlayerMode: boolean = false) {
    this.inputService.start();
    // Initialisiere UI Service
    this.ctxUI = ctxUI;
    this.gamefield = new Gamefield();
    Products.init();
    this.lastMoneyGenTime = 0;
    // Initialisiere Canvas und Rendering
    this.ctx = ctx;
    this.angle = 30 / 360 * 2 * Math.PI; // 30 Grad in Radiant
    RenderingService.instance().init(this.ctx, this.images, this.angle);
    SlotMachineService.instance().init(this.ctx, this.images, this.playerService);
    this.uiService.init(ctxUI, this.angle, this.images);

    // Initialisiere Spielobjekte
    this.playerVelocity = Gamefield.fieldsize * 4; // in Pixel pro Sekunde
    this.player = new Player(
      new Hitbox(new Coordinates(50, 28 * Gamefield.fieldsize), Gamefield.fieldsize * 4/5 , Gamefield.fieldsize * 2/5),
      this.playerVelocity,
      this.gamefield,
      this.playerService
    );
    this.twoPlayerMode = TwoPlayerMode;
    //RenderingService.instance().convertToCameraPOV(this.player.camera);
    this.interactableManager = new InteractableManager(this.gamefield, this.uiService, this.inputService, this.playerService);

    this.inputSubscription = this.inputService.upgrade$.subscribe(playerIndex => {
      const player = playerIndex === 0 ? this.player : this.player2;
      if (player) {
        this.interactableManager.upgradeMachineOnInteraction(player);
      }
    });

    // 1. Sammle alle RenderObject-Instanzen aus allen relevanten Quellen.
    const allRenderObjects: RenderObject[] = [];
    allRenderObjects.push(...this.interactableManager.getAllRenderObjects());
    allRenderObjects.push(...this.gamefield.getAllRenderObjects());

    // 2. Extrahiere alle Bild-Pfade aus den RenderObjects, Produkten und dem Spieler.
    const dynamicImagePaths = allRenderObjects.flatMap(obj => this.getImagePathsFromRenderObject(obj));
    const productImages = Products.getAllProducts().map(p => p.img).filter((img): img is string => !!img);
    const playerImages = this.player.getAllImagePaths();

    // 3. Statische Liste für UI-Bilder, Partikel-Effekte und andere nicht-dynamische Assets.
    const staticImagePaths = [
      // Base & UI
      "/images/package.png",
      "/images/ifm-gameover-background.png",
      "/images/interaction-field.png",
      "/images/truck_roof.png",
      "/images/truck_back.png",
      "/images/arrow.png",
      "/images/tisch.png",
      "/images/sofa.png",
      "/images/chef.png",
      "/images/temp/plant.png",
      // Conveyor
      "/images/conveyorBelt/conveyorbelt-1.jpg",
      "/images/conveyorBelt/conveyorbelt-2.jpg",
      "/images/conveyorBelt/conveyorbelt-3.jpg",
      "/images/conveyorBelt/conveyorbelt-4.jpg",
      "/images/conveyorBelt/conveyorbelt-front-1.jpg",
      "/images/conveyorBelt/conveyorbelt-front-2.jpg",
      "/images/conveyorBelt/conveyorbelt-front-3.jpg",
      "/images/conveyorBelt/conveyorbelt-front-4.jpg",
      // Fox Coin
      "/images/fox/fox-coin.png",
      "/images/fox/no-fox-coin.png",
      "/images/fox/fox-trophy.png",
      // Slot Machine
      "/images/slotMachine/cherry.png",
      "/images/slotMachine/Bar.png",
      "/images/slotMachine/seven.png",
      "/images/slotMachine/diamond.png",
      "/images/slotMachine/lemon.png",
      "/images/slotMachine/ifm.png",
      "/images/slotMachine/manure.png",
      "/images/slotMachine/squirrel.png",
      // Prep Machine
      "/images/Products/prep-machine/frame_1.png",
      "/images/Products/prep-machine/frame_2.png",
      "/images/Products/prep-machine/frame_3.png",
      "/images/Products/prep-machine/frame_4.png",
      "/images/prepmachine.png",
      // Key Bindings
      "/images/KeyBindings/keyBindings_,.png", "/images/KeyBindings/keyBindings_..png", "/images/KeyBindings/keyBindings_0.png", "/images/KeyBindings/keyBindings_1.png", "/images/KeyBindings/keyBindings_2.png", "/images/KeyBindings/keyBindings_3.png", "/images/KeyBindings/keyBindings_4.png", "/images/KeyBindings/keyBindings_5.png", "/images/KeyBindings/keyBindings_6.png", "/images/KeyBindings/keyBindings_7.png", "/images/KeyBindings/keyBindings_8.png", "/images/KeyBindings/keyBindings_9.png","/images/KeyBindings/keyBindings_Start.png", "/images/KeyBindings/keyBindings_Space.png", "/images/KeyBindings/keyBindings_A.png", "/images/KeyBindings/keyBindings_B.png", "/images/KeyBindings/keyBindings_C.png", "/images/KeyBindings/keyBindings_D.png", "/images/KeyBindings/keyBindings_E.png", "/images/KeyBindings/keyBindings_F.png", "/images/KeyBindings/keyBindings_G.png", "/images/KeyBindings/keyBindings_H.png", "/images/KeyBindings/keyBindings_I.png", "/images/KeyBindings/keyBindings_J.png", "/images/KeyBindings/keyBindings_K.png", "/images/KeyBindings/keyBindings_L.png", "/images/KeyBindings/keyBindings_M.png", "/images/KeyBindings/keyBindings_N.png", "/images/KeyBindings/keyBindings_O.png", "/images/KeyBindings/keyBindings_P.png", "/images/KeyBindings/keyBindings_Q.png", "/images/KeyBindings/keyBindings_R.png", "/images/KeyBindings/keyBindings_S.png", "/images/KeyBindings/keyBindings_T.png", "/images/KeyBindings/keyBindings_U.png", "/images/KeyBindings/keyBindings_V.png", "/images/KeyBindings/keyBindings_W.png", "/images/KeyBindings/keyBindings_X.png", "/images/KeyBindings/keyBindings_Y.png", "/images/KeyBindings/keyBindings_Z.png", "/images/KeyBindings/keyBindings_Left.png", "/images/KeyBindings/keyBindings_Right.png", "/images/KeyBindings/keyBindings_Up.png", "/images/KeyBindings/keyBindings_Down.png", "/images/KeyBindings/keyBindings_Controller_Left.png", "/images/KeyBindings/keyBindings_Controller_Right.png", "/images/KeyBindings/keyBindings_Controller_Up.png", "/images/KeyBindings/keyBindings_Controller_Down.png", "/images/KeyBindings/keyBindings_Controller_Button_1.png", "/images/KeyBindings/keyBindings_Controller_Button_2.png", "/images/KeyBindings/keyBindings_Controller_Button_3.png", "/images/KeyBindings/keyBindings_Controller_Button_4.png", "/images/KeyBindings/keyBindings_Controller_Button_5.png", "/images/KeyBindings/keyBindings_Controller_Button_6.png",
    ];



    // 4. Kombiniere alle Pfade und entferne Duplikate
    const allImagesToLoad = [...new Set([...dynamicImagePaths, ...productImages, ...playerImages, ...staticImagePaths])];

    // 5. Lade alle Bilder vor
    await this.preloadImages(allImagesToLoad);

    // 6. Lade alle Sounds vor
    await this.soundService.loadSounds([
      { key: 'drop_sound', path: 'sounds/drop_sound.wav' },
      { key: 'background_music', path: 'sounds/background_music.mp3' },
      { key: 'boost', path:'sounds/boost.mp3'},
      { key: 'upgrade', path:'sounds/upgrade.wav'}
    ]);

    // Füge Spielfeld zum Rendering-Buffer hinzu
    this.interactableManager.addToInteractableObjects();
    this.gamefield.addGameFieldToRenderingBuffer();
    this.gamefield.updateConveyorBelts(ConveyorBeltManager.getConveyorBelts());
    this.conveyorBeltManager = new ConveyorBeltManager(this.gamefield);
    this.prepMachine = new PrepMachineManager(this.gamefield);
    Products.generateProducts();

  }

  /**
   * Extrahiert alle Bild-Pfade von einem RenderObject.
   * @param renderObject Das Objekt, aus dem die Pfade extrahiert werden sollen.
   * @returns Ein Array von Bild-Pfaden.
   */
  private getImagePathsFromRenderObject(renderObject: RenderObject): string[] {
    const paths: string[] = [];

    if (renderObject.img) {
      paths.push(renderObject.img);
    }
    if (renderObject.imgWall) {
      paths.push(renderObject.imgWall);
    }
    if (renderObject.frames && renderObject.frames.length > 0) {
      paths.push(...renderObject.frames);
    }

    return paths;
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
    this.setGlobalGameVolume(0.5)
    this.setGameSoundVolume("background_music", 0.05)
    this.soundService.playSound('background_music', true);
    RenderingService.instance().convertToCameraPOV(this.player.camera);
    this.GameRunning = true;
    this.isPaused = false;
    this.inputService.setInputState('game');
    this.ctx.imageSmoothingEnabled = true;
    // Initialize the first orders
    Orders.initializeOrders();
    Orders.setPlayerService(this.playerService);
    Orders.setGameService(this);
    if( this._twoPlayerMode) RenderingService.instance().gameFov = 1.5
    const loop = () => {
      if (!this.GameRunning) return;

      if (this.isPaused) {
        requestAnimationFrame(loop);
        return;
      }

      // Bildschirm löschen
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.uiService.clearAll();
      if((GameService._gameEnd || this.uiService.drawTimer()) && !this.interactableManager.checkPlayerInSlotMachineArea(this.player))
      {
        GameService._gameEnd = true;
        Player._cameraFix = false;
        if(this.interactableManager.submissionArea.finishGameAnimation())
        {
          this.startGameOverLoop();
          return;
        }
      }

      this.checkGenMoney();

      // Handle Inputs
      const player1Input = this.inputService.getPlayerInput(0);
      this.player.handleInput(player1Input);
      if (this.interactableManager.checkPlayerInSlotMachineArea(this.player)) {
        SlotMachineService.instance().handleInput(player1Input, this.player);
      }
      if (this._twoPlayerMode && this.player2) {
        const player2Input = this.inputService.getPlayerInput(1);
        this.player2.handleInput(player2Input);
        if (this.interactableManager.checkPlayerInSlotMachineArea(this.player2)) {
          SlotMachineService.instance().handleInput(player2Input, this.player2);
        }
      }





      this.conveyorBeltManager.update();

      const workingPrepMachine = this.player.getWorkingPrepMachine();
      this.prepMachine.setWorkingMachine(workingPrepMachine);
      this.prepMachine.update(RenderingService.instance().deltaTime);

      this.player.render();
      this.player.updateProductInHand();

      let playerInteractSlotMachine = this.interactableManager.checkPlayerInSlotMachineArea(this.player)
      playerInteractSlotMachine = !playerInteractSlotMachine && this._twoPlayerMode && this.player2 ? this.interactableManager.checkPlayerInSlotMachineArea(this.player2) : playerInteractSlotMachine;

      if(playerInteractSlotMachine)
      {
        this.player.cameraFix = false;
        RenderingService.instance().rotateInSlotMachine(this.interactableManager.slotMachine);
      }
      else
      {
        this.interactableManager.slotMachine.priority = 0;

        RenderingService.instance().rotateMap();
      }
      const zoomFinished = !playerInteractSlotMachine ? RenderingService.instance().zoomOut() : false;

      if(!playerInteractSlotMachine && zoomFinished && !GameService._gameEnd) this.player.cameraFix = true;

      RenderingService.instance().sortRenderingBuffer();
      RenderingService.instance().convertToCameraPOV(this.player.camera);
      RenderingService.instance().render();

      // Render Particles
      this.interactableManager.resetParticleFields();
      this.interactableManager.checkPackageInHand(this.player);
      this.interactableManager.checkMachineNeedsProduct(this.player);

      if(this._twoPlayerMode && this.player2){
      this.interactableManager.checkMachineNeedsProduct(this.player2);
      this.interactableManager.checkPackageInHand(this.player2);
      }
      this.interactableManager.submissionArea.updateAnimation();

      if(!playerInteractSlotMachine && zoomFinished) {
      this.uiService.drawMachineNeedsPopup(this.interactableManager.getMachines(), [RenderingService.instance().xOffset, RenderingService.instance().yOffset], RenderingService.instance().fov, Player.players);
      this.uiService.drawMachineProducingPopup(this.interactableManager.getMachines(), [RenderingService.instance().xOffset, RenderingService.instance().yOffset], RenderingService.instance().fov);
      this.uiService.drawPlayerThoughts(this.player, [RenderingService.instance().xOffset, RenderingService.instance().yOffset], RenderingService.instance().fov);
      this.uiService.drawControls()
      this.uiService.drawOrder();
      }

      // Update-Phase
      this.uiService.clearMachinePopUp();
      RenderingService.instance().updateFPS()
      this.player.changeVelocity();
      this.player.updatePlayer(this._twoPlayerMode);
      this.interactableManager.checkForInteraction(this.player);
      this.player.pickProduct();

      const player1WasHolding = this.player.inventory !== null;
      this.player.dropProduct();
      if (player1WasHolding && this.player.inventory === null) {
        this.soundService.playSound('drop_sound');
      }

      if(this._twoPlayerMode && this.player2)
      {
        this.player2.changeVelocity();
        this.player2.updatePlayer(this._twoPlayerMode);
        this.interactableManager.checkForInteraction(this.player2);
        this.player2.pickProduct();
        const player2WasHolding = this.player2.inventory !== null;
        this.player2.dropProduct();
        if (player2WasHolding && this.player2.inventory === null) {
          this.soundService.playSound('drop_sound');
        }
        this.player2.render();
        this.player2.updateProductInHand();

      }

      // Orders
      Orders.updateOrderTime();


      if (this.player.inventory === null) {
        // Prüfen, ob ein Item in der Nähe ist
        const itemInRange = Products.checkForInteraction(this.player.hitbox);

        if (itemInRange) {
          this.uiService.drawItemPopup(itemInRange, [RenderingService.instance().xOffset, RenderingService.instance().yOffset], RenderingService.instance().fov);
        } else {
          this.uiService.clearItemPopup();
        }}

      if(this._twoPlayerMode && this.player2) {
        if (this.player2.inventory === null) {
        // Prüfen, ob ein Item in der Nähe ist
        const itemInRange = Products.checkForInteraction(this.player2.hitbox);

          if (itemInRange) {
            this.uiService.drawItemPopup(itemInRange, [RenderingService.instance().xOffset, RenderingService.instance().yOffset], RenderingService.instance().fov);
          } else {
            this.uiService.clearItemPopup();
        }}
      }



      this.gameLoopTick.next();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }


  checkGenMoney()
  {
    let dt;
    if(!RenderingService.instance().deltaTime) dt = 1;
    else dt = RenderingService.instance().deltaTime
    this.lastMoneyGenTime += dt;
    console.log(this.lastMoneyGenTime)
      if(this.playerService.getMoney() < 10 && this.lastMoneyGenTime >= this.generateMoneyIntervall)
      {
        this.playerService.addMoney(1);
        this.lastMoneyGenTime = 0;
      }
  }



  stopGame() {
    this.GameRunning = false;
    // this.inputService.stop();
    this.inputService.setInputState('menu');
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }
    this.soundService.stopAllSounds();
  }

  get gameEnd(): boolean {
    return GameService._gameEnd;
  }

  set gameEnd(value: boolean) {
    GameService._gameEnd = value
  }

  get twoPlayerMode(): boolean {
    return this._twoPlayerMode;
  }
  set twoPlayerMode(value: boolean) {
    if (this._twoPlayerMode === value) {
      return;
    }
    this._twoPlayerMode = value;

    if (value) {
      if (!this.player2) {
        this.player2 = new Player(
          new Hitbox(new Coordinates(4 * Gamefield.fieldsize, 18 * Gamefield.fieldsize), Gamefield.fieldsize * 4 / 5, Gamefield.fieldsize * 2 / 5),
          this.playerVelocity,
          this.gamefield,
          this.playerService
        );
      }
    } else {
      if (this.player2) {
        this.player2 = undefined;
        RenderingService.instance().deleteRenderingObjektByName("player1")
      }
    }
  }

  /**
   * Startet die GameOver-Loop nachdem das Spiel beendet ist.
   * Rendert den GameOverScreen mit Score und verdientem Geld.
   */
  public startGameOverLoop(): void {
    Orders.destroy();
    this.uiService.clearAll();
    this.gameOverSubject.next();
    this.stopGame();
  }

}

