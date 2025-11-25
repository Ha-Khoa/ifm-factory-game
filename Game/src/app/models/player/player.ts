import { Hitbox } from '../../interfaces/hitbox';
import { Coordinates } from '../coordinates/coordinates';
import { Product } from "../../interfaces/product";
import { Collision } from "../collision/collision";
import { Gamefield } from '../gamefield/gamefield';
import { Rendering } from '../rendering/rendering';
import { Direction, KEY_TO_DIRECTION } from '../../enums/direction';
import { RenderObject } from '../rendering/render-object';

/**
 * Player-Klasse: Repräsentiert den Spieler mit Bewegung, Kollision und Inventar.
 */
export class Player {

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
    // Referenz zum Renderer
    private _renderer: Rendering
    // RenderObject für die Darstellung auf dem Canvas
    private _renderingObject: RenderObject;
    
    constructor(hitbox: Hitbox, img: string, velocity: number, gamefield: Gamefield, renderer: Rendering) {
        this._hitbox = hitbox;
        this._img = img;
        this._velocity = velocity;
        this._gamefield = gamefield;
        this._renderer = renderer;
        this._direction = null;

        this._renderingObject = new RenderObject(
            "player",
            "rect",
            this._hitbox.x,
            this._hitbox.y,
            0,
            this._hitbox.width,
            this._hitbox.height,
            3,
            undefined,
            undefined,
            "red",
            []
        );

        renderer.addRenderObject(this._renderingObject);
    }


    /**
     * Aktualisiert die Position des RenderObjects basierend auf der aktuellen Hitbox.
     */
    render() {
        this._renderingObject.x = this.hitbox.x;
        this._renderingObject.y = this.hitbox.y;
        this._renderer.updateRenderingObject("player", this._renderingObject);
    }

    /**
     * Setzt die Eingabe-Richtung basierend auf gedrückten Tasten.
     * @param input Record mit Tastenstatus (z.B. {'w': true, 'a': false})
     */
    setInput(input: Record<string, boolean>) {
        let numPressed = 0;
        for (const [key, pressed] of Object.entries(input)) {
            if (pressed) {
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
                        this._hitbox.y = collision.y + collision.height;
                        break;
                    case Direction.DOWN:
                        this._hitbox.y = collision.y - this._hitbox.height;
                        break;
                    case Direction.LEFT:
                        this._hitbox.x = collision.x + collision.width;
                        break;
                    case Direction.RIGHT:
                        this._hitbox.x = collision.x - this._hitbox.width;
                        break;
                }
                return;
            }
            
            if (borderCollision) {
                switch (this._direction) {
                    case Direction.UP:
                        this._hitbox.y = 0;
                        break;
                    case Direction.DOWN:
                        this._hitbox.y = this._gamefield.fieldsize * this._gamefield.rows - this.hitbox.height;
                        break;
                    case Direction.LEFT:
                        this._hitbox.x = 0;
                        break;
                    case Direction.RIGHT:
                        this._hitbox.x = this._gamefield.fieldsize * this._gamefield.cols - this.hitbox.width;
                        break;
                }
                return;
            }

        }
        // Keine Kollision, bewege den Spieler
        this._hitbox.x += velocityX;
        this._hitbox.y += velocityY;
    } 


    /**
     * Nimmt ein Produkt auf und legt es ins Inventar.
     * @param product Das aufzunehmende Produkt
     */
    pickUpProduct(product: Product) {
        this._inventory = product;
    }
    
    /**
     * Lässt das Produkt aus dem Inventar fallen.
     * @returns Das gefallene Produkt oder null, wenn Inventar leer
     */
    dropProduct(): Product | null {
        const droppedProduct = this._inventory;
        this._inventory = null;
        return droppedProduct;
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
