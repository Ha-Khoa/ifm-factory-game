import { Hitbox } from "../../interfaces/hitbox";
import { Coordinates } from "../coordinates/coordinates";
import { Gamefield } from "../gamefield/gamefield";

/**
 * Collision-Klasse: Statische Methoden für Kollisionserkennung zwischen Hitboxen.
 * Prüft Punkt-, Hitbox- und Rand-Kollisionen.
 */
export class Collision {

    // Referenz zum Spielfeld für Rand-Kollisionsprüfung
    private static _gamefield: Gamefield;

    /**
     * Prüft Kollision zwischen zwei Hitboxen durch Eckpunkt-Test.
     * @param obj1 Erstes Objekt (z.B. Spieler)
     * @param obj2 Zweites Objekt (z.B. Wand)
     * @returns obj2 wenn Kollision, sonst null
     */
    static checkCollision(obj1: Hitbox, obj2: Hitbox): Hitbox | null {
        if (obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y) {
            return obj2;
        }
        return null;
    }


  /**
   * Prüft ob ein Punkt innerhalb einer Hitbox liegt.
   * @param x X-Koordinate des Punkts
   * @param y Y-Koordinate des Punkts
   * @param obj Hitbox zum Prüfen
   * @returns true wenn Punkt in Hitbox, sonst false
   */
    static checkPointCollision(x: number, y: number, obj: Hitbox): boolean {
        return obj.x < x && x < obj.x + obj.width && obj.y < y && y < obj.y + obj.height;
    }


  /**
   * Prüft Kollision im nächsten Frame unter Berücksichtigung der Geschwindigkeit.
   * @param obj1 Bewegtes Objekt
   * @param obj2 Kollisionsobjekt
   * @param velocityX Geschwindigkeit in X-Richtung
   * @param velocityY Geschwindigkeit in Y-Richtung
   * @returns obj2 wenn Kollision im nächsten Frame, sonst null
   */
    static checkCollisionNextFrame(obj1: Hitbox, obj2: Hitbox, velocityX: number, velocityY: number): Hitbox | null {
        const nextFrameHitbox = Collision.calculateNextFrame(obj1, velocityX, velocityY);
        return this.checkCollision(nextFrameHitbox, obj2);
    } 


  /**
   * Prüft Kollision der gesamten Spieler-Hitbox mit Objekten.
   * Überprüft die vier Ecken der Hitbox in Bewegungsrichtung.
   * @returns Das kollidierte Objekt oder null
   */
    static checkObjectOutBoarder(hitbox: Hitbox, velocityX: number, velocityY: number, gamefield: Gamefield): boolean {
        Collision._gamefield = gamefield;
        const nextHitbox = Collision.calculateNextFrame(hitbox, velocityX, velocityY);
        
        const top = nextHitbox.y;
        const bottom = nextHitbox.y + nextHitbox.height;
        const left = nextHitbox.x;
        const right = nextHitbox.x + nextHitbox.width;
        
        return Collision.checkPointOutOfBoarder(left, bottom) ||
               Collision.checkPointOutOfBoarder(right, bottom) ||
               Collision.checkPointOutOfBoarder(left, top) ||
               Collision.checkPointOutOfBoarder(right, top);
    }




  /**
   * Prüft ob ein Punkt außerhalb des Spielfelds liegt.
   * @param x X-Koordinate
   * @param y Y-Koordinate
   * @returns true wenn außerhalb, sonst false
   */
    static checkPointOutOfBoarder(x: number, y: number): boolean {
        return x < 0 || x > Gamefield.fieldsize * Gamefield.cols || y < 0 || y > Gamefield.fieldsize * Gamefield.rows;
    }

    /**
     * Berechnet die Hitbox eines Objekts im nächsten Frame.
     * @param hitbox Aktuelle Hitbox
     * @param velocityX Geschwindigkeit in X-Richtung
     * @param velocityY Geschwindigkeit in Y-Richtung
     * @returns Neue Hitbox nach Bewegung
     */
    private static calculateNextFrame(hitbox: Hitbox, velocityX: number, velocityY: number): Hitbox {
        return new Hitbox(new Coordinates(hitbox.x + velocityX, hitbox.y + velocityY), hitbox.width, hitbox.height);
    }

    /**
     * Prüft Überlappung zwischen zwei projizierten Rechtecken (für Rendering-Sortierung).
     * Nutzt AABB-Overlap mit optionalem Epsilon für Rundungsfehler.
     * @param proj1 Erstes projiziertes Rechteck
     * @param proj2 Zweites projiziertes Rechteck
     * @returns true wenn Überlappung, sonst false
     */
    static checkRenderingCollision(proj1: Hitbox, proj2: Hitbox): boolean {
        const eps = 0.5; // Toleranz für Floating-Point-Rundungsfehler
        const p1Right = proj1.x + proj1.width;
        const p1Bottom = proj1.y + proj1.height;
        const p2Right = proj2.x + proj2.width;
        const p2Bottom = proj2.y + proj2.height;

        // AABB-Overlap: true wenn NICHT getrennt
        return !(p1Right < proj2.x - eps ||
                 p2Right < proj1.x - eps ||
                 p1Bottom < proj2.y - eps ||
                 p2Bottom < proj1.y - eps);
    }
}
