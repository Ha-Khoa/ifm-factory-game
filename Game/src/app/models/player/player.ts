import { Hitbox } from '../../interfaces/hitbox';
import { Coordinates } from '../coordinates/coordinates';
import { Product } from "../product/product";
import { Products } from '../product/products';
import { Collision } from "../collision/collision";
import { Gamefield } from '../gamefield/gamefield';
import { RenderingService } from '../../services/rendering.service';
import { Direction, KEY_TO_DIRECTION, KEY_TO_DIRECTION2 } from '../../enums/direction';
import { RenderType } from '../../enums/render-type';
import { RenderObject } from '../rendering/render-object';
import { ConveyorBeltManager } from '../conveyor-belt/conveyor-belt-manager';
import { Package } from '../package/package';
import { TimerManagerService } from '../../services/timer-manager.service';
import { Camera } from '../camera/camera';
import { PlayerThoughtsType } from '../../services/ui/player-thoughts.drawer';
import { PlayerService } from '../../services/player.service';
import { PrepMachine } from '../preProcess/prep-machine';
import { firstValueFrom } from 'rxjs';

/**
* Player-Klasse: Repräsentiert den Spieler mit Bewegung, Kollision und Inventar.
*/
export class Player {
   private _position!: Coordinates;
   // Hitbox des Spielers für Kollisionserkennung
   private _hitbox!: Hitbox;
   // Bild/Sprite des Spielers
   private _img: string;
   // Geschwindigkeit pro Frame (FPS-abhängig)
   private _frameVelocity!: number;
   // Basis-Geschwindigkeit in Pixel pro Sekunde
   private _velocity: number;
   // Inventar des Spielers (kann ein Produkt halten)
   private _inventory: Product | Package | null = null;
   // Zeitpunkt des letzten Frames für deltaTime-Berechnung
   private _lastFrameTime = performance.now();
   // Referenz zum Spielfeld für Kollisionsprüfung
   private _gamefield: Gamefield;
   // Aktuelle Bewegungsrichtung
   private _direction!: Direction | null;

   private _hasPicked!: boolean;

   private _id!: number;

   private _pressedInteract: boolean = false;



   private _directionPressed!: boolean;

    private _timerManagerService: TimerManagerService = new TimerManagerService();

    private _lastDirection : Direction;


   // RenderObject für die Darstellung auf dem Canvas
   private _z!: number;
   private _input: Record<string, boolean> = {};
   private _canInteractProduct: boolean = false;
   private _interacted: boolean = false;
   private _renderingObject: RenderObject;
   private _walkingAnimation: string[];
   private _holdingAnimation: string[];
   private static _camera: Camera;
   private static _playerPositions: Coordinates[] = [new Coordinates(0, 0), new Coordinates(0, 0)];
   private static _cameraFix: boolean = false;

   // Speed boost properties
   private _baseVelocity: number;
   private _boostVelocity: number = 800
   private _isBoosting: boolean = false;
   private _boostCooldown: number = 1000; // 1 second cooldown
   private _lastBoostTime: number = -Infinity; // Start with cooldown available
   private _boostDuration: number = 350; // 200ms boost duration

  private _thoughts: PlayerThoughtsType = PlayerThoughtsType.NONE;

  public static players: Player[] = [];

  // playerService
  private _playerService: PlayerService;


   constructor(hitbox: Hitbox, velocity: number, gamefield: Gamefield, playerService: PlayerService) {
        this._lastDirection = Direction.RIGHT;
       this._img = "/images/fox/fox.png";
       this._walkingAnimation = ["/images/fox/walking_5.png", "/images/fox/walking_2.png", "/images/fox/walking_3.png", "/images/fox/walking_4.png"]
       this._holdingAnimation = ["/images/fox/4-fox-holding.png", "/images/fox/3-fox-holding.png", "/images/fox/2-fox-holding.png", "/images/fox/1-fox-holding.png"]
       this._hasPicked = false;
       this._hitbox = hitbox;
       this._position = hitbox.position
       this._velocity = velocity;
       this._baseVelocity = velocity; // Store base velocity
       this._gamefield = gamefield;
       const angle = RenderingService.instance().angle
       const rotationZ = (window.innerHeight / 2 - window.innerHeight / 2 * Math.cos(angle)) / 60
       if(Player._camera) this._id = 1; else this._id = 0;
       Player._camera = new Camera(new Coordinates(Gamefield.fieldsize*10 + Gamefield.fieldsize/2, Gamefield.fieldsize*5 + Gamefield.fieldsize/2), window.innerHeight / 1080 * 60);
       this._z = hitbox.width * 1.35 / Math.sin(30 / 360 * 2 * Math.PI); // Bildverhältnis der Spielertextur ohne Winkelverzerrung
       const height = this._hitbox.width * 1.35 / Math.sin(30 / 360 * 2 * Math.PI);
       this._renderingObject = new RenderObject(
           "player",
           RenderType.GIF,
           this._position.x,
           this._position.y,
           this._z,
           this._hitbox.width,
           height,
           (this._z - 50) * -3,
           this.img,
           undefined,
           undefined,
           undefined,
           this._walkingAnimation,
           8
       );

        this._playerService = playerService;
       RenderingService.instance().addRenderObject(this._renderingObject);
       Player.players.push(this);
   }




   /**
    * Aktualisiert die Position des RenderObjects basierend auf der aktuellen Hitbox.
    */
   render() {
       this._renderingObject.x = this._position.x;
       this._renderingObject.y = this._position.y + this._hitbox.height / 2;
   }


   
   updateProductInHand() {

        if (this._inventory === null) { return }
        if(!this._directionPressed)
         {
            let newPositionX = this._position.x + this._hitbox.width / 2 - this._inventory.size / 2 + 3
            this._inventory.z = Gamefield.fieldsize * (1/5);
            this._inventory.renderObject.priority = 350;
            this._inventory.x = newPositionX
            this._inventory.y = this._position.y;
            return
         }


       // Stabilize narrowed properties in locals so TS knows they won't change within this method
       const dir = this._direction;
       const inv = this._inventory;
       let newX = dir === Direction.RIGHT ? this._position.x + this._hitbox.width -  inv.size / 2 :
                            dir === Direction.LEFT ? this._position.x - inv.size / 2 :
                            this._lastDirection === Direction.RIGHT ? this._position.x + this._hitbox.width -  inv.size / 2:
                            this._lastDirection === Direction.LEFT ? this._position.x - inv.size / 2:
                            this._position.x + this._hitbox.width / 2 - this._inventory.size / 2 + 3;
       let newZ = ((dir === Direction.LEFT || dir === Direction.RIGHT) && inv instanceof Product) ? Gamefield.fieldsize * 0.9:
                  ((dir === Direction.LEFT || dir === Direction.RIGHT) && inv instanceof Package) ? Gamefield.fieldsize * 1.5 :
                  ((this._lastDirection === Direction.LEFT || this._lastDirection === Direction.RIGHT) && inv instanceof Product) ? Gamefield.fieldsize * 0.9:
                  ((this._lastDirection === Direction.LEFT || this._lastDirection === Direction.RIGHT) && inv instanceof Package) ? Gamefield.fieldsize * 1.5 : 0;
       inv.x= newX
       inv.y = this._position.y
       inv.z = newZ;
   }



    /**
     * Setzt die Eingabe-Richtung basierend auf gedrückten Tasten und löst den Boost aus.
     * @param input Record mit Tastenstatus (z.B. {'w': true, 'a': false})
     */
    setInput(input: Record<string, boolean>) {
      this._input  = input;
      // Handle movement direction
      if(this._id === 0) this._pressedInteract = input['e']; else this._pressedInteract = input['enter'];
      let numPressedDirectional = 0;
      this._direction = null; // Reset direction at the start of each call
      for (const [key, pressed] of Object.entries(input) ) {
          if (pressed && key in KEY_TO_DIRECTION && this._id === 0) {
              this._direction = KEY_TO_DIRECTION[key];
              numPressedDirectional++
          }
        if (pressed && key in KEY_TO_DIRECTION2 && this._id === 1) {
              this._direction = KEY_TO_DIRECTION2[key];
              numPressedDirectional++
          }
      }

      // If no directional keys are currently pressed, ensure _direction is null and _directionPressed is false
      if (numPressedDirectional === 0) {
          this._direction = null;
          this._directionPressed = false;
      } else {
          this._directionPressed = true;
      }

      if (this._direction === Direction.RIGHT) {
          this._renderingObject.animationDirection = Direction.RIGHT;
      } else if (this._direction === Direction.LEFT) {
          this._renderingObject.animationDirection = Direction.LEFT;
      }

      // Handle shift for boost
      const now = performance.now();
      if (input[' '] && !this._isBoosting && (now - this._lastBoostTime > this._boostCooldown) && this._id === 0) {
        this.activateBoost();
    }
    }
    /**
     * Aktiviert den Geschwindigkeits-Boost.
     */
    private activateBoost() {
        this._isBoosting = true;
        this._lastBoostTime = performance.now();
        this._velocity = this._boostVelocity; // Boost-Geschwindigkeit
        this._renderingObject.type = 'gif'
        this._renderingObject.frames = ['/images/fox/fox-sprint.png']

        setTimeout(() => {
            this._velocity = this._baseVelocity;
            this._isBoosting = false;
        }, this._boostDuration);
    }



   /**if(this._id === 0) this._player
    * Berechnet die Frame-Velocity basierend auf deltaTime.
    * Macht die Bewegung FPS-unabhängig (gleichförmige Bewegung).
    */
   changeVelocity() {
       const now = performance.now();
       let deltaTime = now - this._lastFrameTime;
       this._lastFrameTime = now;
       if (deltaTime === 0) {
           deltaTime = 1; // Vermeidet Division durch 0 bei sehr schnellen Frames
       }
       this._frameVelocity = this._velocity * deltaTime / 1000; // Umrechnung: Pixel/Frame → Pixel/Sekunde

   }


 /**
  * Aktualisiert die Spielerposition basierend auf Eingaben und prüft Kollisionen.
  * Bewegt den Spieler, solange kein Objekt oder Rand im Weg ist.
  */
   updatePlayer(twoPlayerMode: boolean = true) {
    this.updatePlayerAnimation();
        if(this._direction === Direction.RIGHT || this._direction === Direction.LEFT)
       {
        this._lastDirection = this._direction
       }
       const velocityX = this._direction === Direction.RIGHT ? this._frameVelocity
                       : this._direction === Direction.LEFT ? -this._frameVelocity : 0;
       const velocityY = this._direction === Direction.DOWN ? this._frameVelocity
                       : this._direction === Direction.UP ? -this._frameVelocity : 0;
       if(this._directionPressed)
           {
       for (const obj of this._gamefield.interactableObjects) {
           const objHitbox = new Hitbox(new Coordinates(obj.x, obj.y), obj.width, obj.height);
           const collision = Collision.checkCollisionNextFrame(this._hitbox, objHitbox, velocityX, velocityY);
           const borderCollision = Collision.checkObjectOutBoarder(this._hitbox, velocityX, velocityY, this._gamefield);

           if (collision) {
               switch (this._direction) {
                   case Direction.UP:
                       this._position.y = collision.y + collision.height;
                       break;
                   case Direction.DOWN:
                       this._position.y = collision.y - this._hitbox.height;
                       break;
                   case Direction.LEFT:
                       this._position.x = collision.x + collision.width;
                       break;
                   case Direction.RIGHT:
                       this._position.x = collision.x - this._hitbox.width;
                       break;
               }
               return;
           }

           if (borderCollision) {
               switch (this._direction) {
                   case Direction.UP:
                       this._position.y = 0;
                       break;
                   case Direction.DOWN:
                       this._position.y = Gamefield.fieldsize * Gamefield.rows - this.hitbox.height;
                       break;
                   case Direction.LEFT:
                       this._position.x = 0;
                       break;
                   case Direction.RIGHT:
                       this._position.x = Gamefield.fieldsize * Gamefield.cols - this.hitbox.width;
                       break;
               }
               return;
           }


       }
       // Keine Kollision, bewege den Spieler
       this._position.x += velocityX;
       this._position.y += velocityY;
        }
        if(Player._cameraFix)
       {
        Player._playerPositions[this._id].x = this._position.x;
        Player._playerPositions[this._id].y = this._position.y;
        if(!twoPlayerMode)
        {
           Player._camera.x = this._position.x + this._hitbox.width / 2;
           Player._camera.y = this._position.y - this._hitbox.height / 2;
        }
        else
        {
            Player._camera.x = (Player._playerPositions[0].x + Player._playerPositions[1].x) / 2;
            Player._camera.y = (Player._playerPositions[0].y + Player._playerPositions[1].y) / 2;
        }
        Player._camera.setCameraInBounds();
       }
   
}

    updatePlayerAnimation()
    {

        if(this._directionPressed && !this._isBoosting)
        {
            
            this._renderingObject.type = RenderType.GIF
            this._renderingObject.img = this._img;
            if(this._inventory !== null)
            {
                this._renderingObject.frames = this._holdingAnimation;
            }
            else{
                this._renderingObject.frames = this._walkingAnimation;
            }
            if (this._timerManagerService.isRunning()) {
                this._timerManagerService.cancel();
            }
        }
        else if (!this._isBoosting)
        {
            this._renderingObject.type = RenderType.CARD_BOARD
            this.sitPlayer();
        }
    }

        async sitPlayer() {
            // Starte den Timer nur, wenn keiner läuft (sonst wird er ständig neu gestartet)
            if (!this._timerManagerService.isRunning()) {
                await this._timerManagerService.start(3000);
                this._renderingObject.img = "/images/fox/sitting.png";
            }
        }



   /**
    * Versucht ein Produkt aufzunehmen, wenn E gedrückt wurde und kein Produkt getragen wird.
    */
   async pickProduct(): Promise<Product | Package | null> {
       if (this._pressedInteract) {
           if (!this._interacted) {
               this._canInteractProduct = true;
               this._interacted = true;
           }
       } else {
           this._interacted = false;
           this._canInteractProduct = false;
           this._hasPicked = false;
       }
       // Übergibt das Produkt von der PrepMachine, wenn möglich
       if (this._canInteractProduct && this.handlePrepMachineInteraction()){
            return this._inventory;
       }
       if (this._canInteractProduct && this._inventory === null) {
         // Check if the player can purchase the product from the conveyor belt
         let productTypeOfConveyor = this.getConveyorBeltProduct();
        if(productTypeOfConveyor !== null)
        {
        this._canInteractProduct = false;
        this._hasPicked = true;
        }
         if(productTypeOfConveyor instanceof Product){
            try {
              // Warte auf das Ergebnis der asynchronen Geldentfernung
              await firstValueFrom(this._playerService.removeMoney(productTypeOfConveyor.costs));
              // wenn dies erfolgreich ist, fahre mit der Logik fort
            } catch (error) {
              // wenn dies fehlschlägt (ein Fehler wird ausgelöst), behandle ihn hier
              console.error("Bezahlung für Förderbandprodukt fehlgeschlagen:", error);
              this.thoughts = PlayerThoughtsType.NOT_ENOUGH_MONEY;
              setTimeout(() => {
                this.thoughts = PlayerThoughtsType.NONE;
              }, 1000);              
              return null; // Ausführung stoppen

            }
            
         }

           //versuche zuerst ein Produkt vom Förderband aufzunehmen
           const productFromConveyor: Product | Package | null = this.takeProductFromConveyor();
           if (productFromConveyor) {
               this._inventory = productFromConveyor;
               this._canInteractProduct = false;
               this._hasPicked = true;
               Products.deleteGeneratedProduct(this._inventory)
               this._inventory.renderObject.priority = 200
               console.log("Produkt vom Förderband aufgenommen:", this._inventory);
               Products.generatedProducts.push(productFromConveyor);
               this._inventory!.z = 50
               return this._inventory;
           }
       }
       let nearestObj = Products.checkForInteraction(this._hitbox);
       if (this._canInteractProduct && this._inventory === null && nearestObj) {
           this._inventory = nearestObj;
           this._canInteractProduct = false;
           this._hasPicked = true;
           Products.deleteGeneratedProduct(this._inventory)
           this._inventory.renderObject.priority = 200
           if (nearestObj instanceof Package) {
               Products.deleteGeneratedProduct(nearestObj);
           }
           this._inventory!.z = 50
           return this._inventory;
       }
       else if (this._canInteractProduct && this._inventory instanceof Package && nearestObj && nearestObj instanceof Product)
       {
           this._inventory.products.push(nearestObj);
           this._canInteractProduct = false;
           nearestObj.destroy();
           Products.deleteGeneratedProduct(nearestObj);
           return this._inventory;
       }
       return null;
   }


   /**
    * Versucht ein getragenes Produkt abzulegen, wenn E gedrückt wurde.
    * addToMap: true → Produkt in Weltliste aufnehmen, false → nur aus Hand entfernen
    */
   dropProduct(): Product | Package | null{
        // Übergibt das Produkt an die PrepMachine, wenn möglich
       if (this._canInteractProduct && this._inventory instanceof Product){
            const nearestMachine = this.getNearestPrepMachine();
            if (nearestMachine && nearestMachine.canAcceptProduct(this._inventory)) {
                if (nearestMachine.acceptProduct(this._inventory)){
                    console.log("Produkt der PrepMachine übergeben:", this._inventory);

                    //Entferne das Produkt aus dem Inventar
                    const placedProduct = this._inventory;
                    placedProduct.destroy();
                    this._inventory = null;
                    this._canInteractProduct = false;
                    this._hasPicked = false;

                    return null;
                }
            }
       }
       if (this._inventory instanceof Package && Products.checkForInteraction(this._hitbox) instanceof Product) {return null;}
       if (this._canInteractProduct && this._inventory !== null) {
           const droppedProduct = this._inventory;
           Products.generatedProducts.push(droppedProduct)
           this._inventory!.z = 0;
           this._inventory = null;
           this._canInteractProduct = false;
           this._hasPicked = false;
           console.log(this._inventory)

           if (droppedProduct instanceof Package) {
              Products.addPackage(droppedProduct);
           }
           let itemState = Products.checkOnTable(droppedProduct, this._gamefield.interactableObjects);
           if(itemState === 1)
           {
               this._inventory = droppedProduct;
               this._inventory!.z = 50;
               return null;
           }
           droppedProduct.renderObject.priority = 100;
           return droppedProduct;
       }
       return null;
   }

   getConveyorBeltProduct(): Product | Package | null{
     const conveyor = ConveyorBeltManager.getConveyorAt(
       this._hitbox.x + this._hitbox.width / 2,
       this._hitbox.y + this._hitbox.height / 2
     );
     console.log(conveyor)
     if (!conveyor)
       return null;

     const playerCenterX = this._hitbox.x + this._hitbox.width / 2;
     const playerCenterY = this._hitbox.y + this._hitbox.height / 2;
     const playerCenter = new Coordinates(playerCenterX, playerCenterY);
     // return conveyor.removeProductAtPosition(playerCenter)
     return conveyor.getProductAtPosition(playerCenter)
   }

   takeProductFromConveyor(): Product | Package |null {
       //console.log('Checking for conveyor at player position:', this._hitbox.x, this._hitbox.y, 'size:', this._hitbox.width, this._hitbox.height);
       const conveyor = ConveyorBeltManager.getConveyorAt(
           this._hitbox.x + this._hitbox.width / 2,
            this._hitbox.y + this._hitbox.height / 2
       );
       if (conveyor) {
           const playerCenterX = this._hitbox.x + this._hitbox.width / 2;
           const playerCenterY = this._hitbox.y + this._hitbox.height / 2;
           const playerCenter = new Coordinates(playerCenterX, playerCenterY);

           // Try position-based pickup first (picks nearest product within 50px)
           let product = conveyor.removeProductAtPosition(playerCenter);

           // If no product nearby, try taking the furthest product
           /*if (!product) {
               product = conveyor.takeItem();
           }*/
          

           if (product) {
           //console.log(`Produkt ${product.name} vom Förderband ${conveyor.getConveyorId()} aufgenommen.`);
           
               return product;
           } else {
               //console.log('kein Produkt zum Aufnehmen gefunden auf dem Förderband');
           }
       } else {
           //console.log('kein Förderband an der Spielerposition gefunden');
       }
       return null;
   }

   /**
    * Findet die nächste PrepMachine in Reichweite des Spielers.
    * @returns Die nächste PrepMachine oder null, wenn keine gefunden wurde.
    */
   private getNearestPrepMachine(): PrepMachine | null {
        let nearestMachine: PrepMachine | null = null;
        let shortestDistance: number = Infinity;

        for (const obj of this._gamefield.interactableObjects){
            if (obj.name.startsWith('PrepMachine')) {
                const machine = obj as PrepMachine;
                const distance = Math.sqrt(
                    Math.pow((this._position.x + this._hitbox.width/2) - (machine.x + machine.width/2), 2) +
                    Math.pow((this._position.y + this._hitbox.height/2) - (machine.y + machine.height/2), 2)
                );

                if (distance < Gamefield.fieldsize * 1.0 && distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestMachine = machine;
                }
            }
        }

        return nearestMachine;
   }

   /**
    * Gibt die PrepMachine zurück, die gerade bearbeitet werden soll (Overcooked-Style).
    * Fortschritt steigt nur, wenn Spieler in Reichweite ist und E gedrückt hält.
    */
   getWorkingPrepMachine(): PrepMachine | null {
        const nearestMachine = this.getNearestPrepMachine();
        if (!nearestMachine) {
            return null;
        }
        if (!nearestMachine.isProcessingActive()) {
            return null;
        }
        if (!this._pressedInteract) {
            return null;
        }
        return nearestMachine;
   }
   /**
    * 
    * @returns boolean - ob eine Interaktion mit der PrepMachine stattgefunden hat
    */
   private handlePrepMachineInteraction(): boolean {
        const nearestMachine = this.getNearestPrepMachine();
        if (!nearestMachine) {
            return false;
        }
        // Nimmt das Ausgangsprodukt von der PrepMachine auf
        if (!this._inventory && nearestMachine.isOutputReady()){
            const output = nearestMachine.collectOutput();
            if (output){
                output.init(new Coordinates(this.position.x, this.position.y))

                this._inventory = output;
                this._canInteractProduct = false;
                this._hasPicked = true;
                this._inventory.renderObject.priority = 200;

                Products.generatedProducts.push(output);
                this._inventory!.z = 50;

                console.log("Produkt von PrepMachine aufgenommen:", this._inventory);
                return true;
            }
        }
        // Übergibt das Produkt an die PrepMachine
        if (this._inventory instanceof Product && nearestMachine.canAcceptProduct(this._inventory)){
            if (nearestMachine.acceptProduct(this._inventory)){
                console.log("Produkt der PrepMachine übergeben:", this._inventory);

                this._inventory.destroy();
                this._inventory = null;
                this._canInteractProduct = false;
                this._hasPicked = false;

                return true;
            }

            
        }
        return false;
   }
   hasPicked(): boolean {
       return this._hasPicked;
   }

   // Getters / Setters
   get hitbox(): Hitbox { return this._hitbox; }
   set hitbox(v: Hitbox) { this._hitbox = v; }


   get img(): string { return this._img; }
   set img(v: string) { this._img = v; }


   get velocity(): number { return this._velocity; }
   set velocity(v: number) { this._velocity = v; }


   get inventory(): Product | Package | null { return this._inventory; }
   set inventory(v: Product | Package | null) { this._inventory = v; }

   get canInteractProduct(): boolean { return this._canInteractProduct; }

   get z(): number {return this._z}
   set z(v: number) {
        this._z = v;
        this._renderingObject.z = v;
    }
  get camera(): Camera { return Player._camera; }

  set cameraFix(v: boolean) { Player._cameraFix = v; }
  get cameraFix(): boolean { return Player._cameraFix; }


  get position(): Coordinates { return this._position; }

  get thoughts(): PlayerThoughtsType { return this._thoughts; }
  set thoughts(v: PlayerThoughtsType) { this._thoughts = v; }

  get pressedInteract(): boolean { return this._pressedInteract; }

  get id(): number { return this._id; }
}
