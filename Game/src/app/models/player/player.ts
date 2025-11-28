import { Hitbox } from '../../interfaces/hitbox';
import { Coordinates } from '../coordinates/coordinates';
import { Product } from "../../interfaces/product";
import { Products } from '../product/products';
import { Collision } from "../collision/collision";
import { Gamefield } from '../gamefield/gamefield';
import { RenderingService } from '../../services/rendering.service';
import { Direction, KEY_TO_DIRECTION } from '../../enums/direction';
import { RenderObject } from '../rendering/render-object';

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
    private _inventory: Product | null = null;
    // Zeitpunkt des letzten Frames für deltaTime-Berechnung
    private _lastFrameTime = performance.now();
    // Referenz zum Spielfeld für Kollisionsprüfung
    private _gamefield: Gamefield;
    // Aktuelle Bewegungsrichtung
    private _direction!: Direction | null;

    // RenderObject für die Darstellung auf dem Canvas
    private _renderingObject: RenderObject;
    private _z!: number;
    private _input: Record<string, boolean> = {};
    private _canInteractProduct: boolean = false;
    private _interacted: boolean = false;
    constructor(hitbox: Hitbox, img: string, velocity: number, gamefield: Gamefield, private _renderer: RenderingService) {
        this._hitbox = hitbox;
        this._position = hitbox.position
        this._img = img;
        this._velocity = velocity;
        this._gamefield = gamefield;
        this._direction = null;
        this._z = 50;
        this._renderingObject = new RenderObject(
            "player",
            "rect",
            this._position.x,
            this._position.y,
            this._z,
            this._hitbox.width,
            this._hitbox.height,
            (this._z - 50) * -4,
            undefined,
            undefined,
            "red",
            ["red"]
        );

        this._renderer.addRenderObject(this._renderingObject);
    }


    /**
     * Aktualisiert die Position des RenderObjects basierend auf der aktuellen Hitbox.
     */
    render() {
        this._renderingObject.x = this._position.x;
        this._renderingObject.y = this._position.y;
        this._renderer.updateRenderingObject("player", this._renderingObject);
    }

    updateProductInHand() {
        const direction = this._direction;
        if(direction === null) { return; }
        const newPositionX = this._direction === Direction.RIGHT ? this._position.x + this._hitbox.width -  Products.size / 2 :
                     this._direction === Direction.LEFT ? this._position.x - Products.size / 2 :
                     this._direction === Direction.UP ? this._position.x + this._hitbox.width / 2 - Products.size / 2 :
                     this._direction === Direction.DOWN ? this._position.x + this._hitbox.width / 2 - Products.size / 2 :
                     this._position.x;
        const newPositionY = this._direction === Direction.DOWN ? this._position.y + this._hitbox.height - Products.size / 2 :
                     this._direction === Direction.UP ? this._position.y - Products.size / 2 :
                     this._direction === Direction.LEFT ? this._position.y + this._hitbox.height / 2 - Products.size / 2 :
                     this._direction === Direction.RIGHT ? this._position.y + this._hitbox.height / 2 - Products.size / 2 :
                     this._position.y;
        if(this._inventory !== null) {
            const renderName = `product:${this._inventory.name}`;
            const productRenderObject = new RenderObject(
                renderName,
                "rect",
                newPositionX,
                newPositionY,
                40,
                20,
                20,
                1000,
                undefined,
                undefined,
                "blue",
                []
            );
            const existing = this._renderer.getRenderingObjektByName(renderName);
            if (!existing) {
                this._renderer.addRenderObject(productRenderObject);
            } else {
                this._renderer.updateRenderingObject(renderName, productRenderObject);
            }
            this._inventory.position = new Coordinates(newPositionX, newPositionY);
    
        }}
    
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
            this._direction = null;
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
        
        // Debug FPS
        // const fps = 1000 / deltaTime;
        // console.log('FPS:', fps);
    }   

  /**
   * Aktualisiert die Spielerposition basierend auf Eingaben und prüft Kollisionen.
   * Bewegt den Spieler, solange kein Objekt oder Rand im Weg ist.
   */
    updatePlayer() {
        const velocityX = this._direction === Direction.RIGHT ? this._frameVelocity
                        : this._direction === Direction.LEFT ? -this._frameVelocity : 0;
        const velocityY = this._direction === Direction.DOWN ? this._frameVelocity
                        : this._direction === Direction.UP ? -this._frameVelocity : 0;
        
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


    /**
     * Versucht ein Produkt aufzunehmen, wenn E gedrückt wurde und kein Produkt getragen wird.
     */
    pickProduct(): Product | null {
        if (this._input['e']) {
            if (!this._interacted) {
                this._canInteractProduct = true;
                this._interacted = true;
            }
        } else {
            this._interacted = false;
        }
        if (this._canInteractProduct && this._inventory === null) {
            this._inventory = Products.checkForInteraction(this._hitbox);
            console.log("Produkt aufgenommen:", this._inventory);
            this._canInteractProduct = false;
            return this._inventory;
        }
        return null;
    }

    /**
     * Versucht ein getragenes Produkt abzulegen, wenn E gedrückt wurde.
     * addToMap: true → Produkt in Weltliste aufnehmen, false → nur aus Hand entfernen
     */
    dropProduct(addToMap: boolean): Product | null {
        if (this._input['e']) {
            if (!this._interacted) {
                this._canInteractProduct = true;
                this._interacted = true;
            }
        } else {
            this._interacted = false;
        }
        if (this._canInteractProduct && this._inventory !== null) {
            console.log("Produkt abgelegt:", this._inventory);
            const droppedProduct = this._inventory;
            if (!addToMap) {
                Products.deleteGeneratedProduct(this._inventory);
            }
            this._inventory = null;
            this._canInteractProduct = false;
            return droppedProduct;
        }
        return null;
    }
    
    // Getters / Setters
    get hitbox(): Hitbox { return this._hitbox; }
    set hitbox(v: Hitbox) { this._hitbox = v; }

    get img(): string { return this._img; }
    set img(v: string) { this._img = v; }

    get velocity(): number { return this._velocity; }
    set velocity(v: number) { this._velocity = v; }

    get inventory(): Product | null { return this._inventory; }
    set inventory(v: Product | null) { this._inventory = v; }
}
