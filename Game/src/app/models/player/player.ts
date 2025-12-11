import { Hitbox } from '../../interfaces/hitbox';
import { Coordinates } from '../coordinates/coordinates';
import { Product } from "../product/product";
import { Products } from '../product/products';
import { Collision } from "../collision/collision";
import { Gamefield } from '../gamefield/gamefield';
import { RenderingService } from '../../services/rendering.service';
import { Direction, KEY_TO_DIRECTION } from '../../enums/direction';
import { RenderObject } from '../rendering/render-object';
import { ConveyorBeltManager } from '../conveyor-belt/conveyor-belt-manager';
import { Package } from '../package/package';
import { TimerManagerService } from '../../services/timer-manager.service';


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


   constructor(hitbox: Hitbox, velocity: number, gamefield: Gamefield) {
        this._lastDirection = Direction.RIGHT;
       this._img = "/images/fox/fox.png";
       this._walkingAnimation = ["/images/fox/walking_5.png", "/images/fox/walking_2.png", "/images/fox/walking_3.png", "/images/fox/walking_4.png"]
       this._holdingAnimation = ["/images/fox/4-fox-holding.png", "/images/fox/3-fox-holding.png", "/images/fox/2-fox-holding.png", "/images/fox/1-fox-holding.png"]
       this._hasPicked = false;
       this._hitbox = hitbox;
       this._position = hitbox.position
       this._velocity = velocity;
       this._gamefield = gamefield;
       this._direction = null;
       this._z = 140;
       this._renderingObject = new RenderObject(
           "player",
           "gif",
           this._position.x,
           this._position.y,
           this._z,
           this._hitbox.width,
           this._hitbox.height,
           (this._z - 50) * -4,
           this.img,
           undefined,
           undefined,
           undefined,
           this._walkingAnimation,
           8
       );

  
       RenderingService.instance().addRenderObject(this._renderingObject);
   }




   /**
    * Aktualisiert die Position des RenderObjects basierend auf der aktuellen Hitbox.
    */
   render() {
       this._renderingObject.x = this._position.x;
       this._renderingObject.y = this._position.y;
       RenderingService.instance().updateRenderingObject("player", this._renderingObject);
   }


   updateProductInHand() {

        if (this._inventory === null) { return }
        if(!this._directionPressed)
         {
            let newPositionX = this._position.x + this._hitbox.width / 2 - this._inventory.size / 2 + 3
            this._inventory.z = 0;
            this._inventory.x = newPositionX
            this._inventory.y = this._position.y;
            return
         }
        

       // Stabilize narrowed properties in locals so TS knows they won't change within this method
       const dir = this._direction;
       const inv = this._inventory;
       let newPositionX = dir === Direction.RIGHT ? this._position.x + this._hitbox.width -  inv.size / 2 :
                            dir === Direction.LEFT ? this._position.x - inv.size / 2 :
                            this._lastDirection === Direction.RIGHT ? this._position.x + this._hitbox.width -  inv.size / 2:
                            this._lastDirection === Direction.LEFT ? this._position.x - inv.size / 2:
                            this._position.x + this._hitbox.width / 2 - this._inventory.size / 2 + 3;
       let newZ = ((dir === Direction.LEFT || dir === Direction.RIGHT) && inv instanceof Product) ? 50 :
                  ((dir === Direction.LEFT || dir === Direction.RIGHT) && inv instanceof Package) ? 70 :
                  ((this._lastDirection === Direction.LEFT || this._lastDirection === Direction.RIGHT) && inv instanceof Product) ? 50 :
                  ((this._lastDirection === Direction.LEFT || this._lastDirection === Direction.RIGHT) && inv instanceof Package) ? 70 : 0;
       inv.x= newPositionX
       inv.y = this._position.y
       inv.z = newZ;
   }


  
   /**
    * Setzt die Eingabe-Richtung basierend auf gedrückten Tasten.
    * @param input Record mit Tastenstatus (z.B. {'w': true, 'a': false})
    */
   setInput(input: Record<string, boolean>) {
       this._input  = input;
       let numPressed = 0;
       for (const [key, pressed] of Object.entries(input)) {
           if (pressed && key in KEY_TO_DIRECTION) {
               this._direction = KEY_TO_DIRECTION[key];
               numPressed++;
           }
       }
       if (numPressed === 0) {
           this._directionPressed = false;
       }
       else
       {
           this._directionPressed = true;
       }
       if(this._direction === Direction.RIGHT)
       {
        this._renderingObject.animationDirection = Direction.RIGHT;
       }
       else if (this._direction === Direction.LEFT)
        {
            this._renderingObject.animationDirection = Direction.LEFT;
        }
       
   }




   /**
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
   updatePlayer() {
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
                       this._position.y = this._gamefield.fieldsize * this._gamefield.rows - this.hitbox.height;
                       break;
                   case Direction.LEFT:
                       this._position.x = 0;
                       break;
                   case Direction.RIGHT:
                       this._position.x = this._gamefield.fieldsize * this._gamefield.cols - this.hitbox.width;
                       break;
               }
               return;
           }


       }
       // Keine Kollision, bewege den Spieler
       this._position.x += velocityX;
       this._position.y += velocityY;
   }
   
}

    updatePlayerAnimation()
    {
        if(this._directionPressed)
        {
            this._renderingObject.type = "gif"
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
        else
        {
            this._renderingObject.type = "static Img"
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
   pickProduct(): Product | Package | null {
       if (this._input['e']) {
           if (!this._interacted) {
               this._canInteractProduct = true;
               this._interacted = true;
           }
       } else {
           this._interacted = false;
           this._canInteractProduct = false;
           this._hasPicked = false;
       }
       if (this._canInteractProduct && this._inventory === null) {
           //versuche zuerst ein Produkt vom Förderband aufzunehmen
           const productFromConveyor = this.takeProductFromConveyor();
           if (productFromConveyor) {
               this._inventory = productFromConveyor;
               this._canInteractProduct = false;
               this._hasPicked = true;
               this._inventory.renderObject.priority = 300
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
           if (nearestObj instanceof Package) {
               Products.deleteGeneratedProduct(nearestObj);
           }
           this._inventory.renderObject.priority = 300
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
       if (this._inventory instanceof Package && Products.checkForInteraction(this._hitbox) instanceof Product) {return null;}
       if (this._canInteractProduct && this._inventory !== null) {
           const droppedProduct = this._inventory;
           this._inventory!.z = 0;
           this._inventory = null;
           this._canInteractProduct = false;
           this._hasPicked = false;
          
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


   takeProductFromConveyor(): Product | Package |null {
       //console.log('Checking for conveyor at player position:', this._hitbox.x, this._hitbox.y, 'size:', this._hitbox.width, this._hitbox.height);
       const conveyor = ConveyorBeltManager.getConveyorAt(
           this._hitbox.x,
           this._hitbox.y,
           this._hitbox.width,
           this._hitbox.height
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


}
