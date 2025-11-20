
// Importiere notwendige Angular- und Projektmodule
import { Injectable } from '@angular/core';
import { Gamefield } from '../models/gamefield/gamefield';
import { Field } from '../interfaces/field';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // Gibt an, ob das Spiel aktuell läuft
  private GameRunning!: boolean;
  // Canvas-Kontext zum Zeichnen
  private ctx!: CanvasRenderingContext2D
  // Spielfeld-Objekt
  private gamefield!: Gamefield;
  // Tasteneingaben (z.B. WASD)
  private inputs: Record<string, boolean> = {};
  // Vorgehaltene Bilder für die Darstellung
  private images: { [key: string]: HTMLImageElement } = {};
  // Größe des Spielers (Quadrat)
  private playerSize!: number;
  // Spielerposition X
  private playerX!: number;
  // Spielerposition Y
  private playerY!: number;
  // Geschwindigkeit des Spielers
  private velocity!: number;
  // Winkel für Projektion (z.B. Pseudo-3D-Effekt)
  private angle!: number;
  // Höhe der Tische
  private tableHeight!: number;

  constructor() { }


  /**
   * Initialisiert das Spiel, setzt Startwerte und lädt Bilder vor.
   * @param ctx CanvasRenderingContext2D zum Zeichnen
   */
  async init(ctx: CanvasRenderingContext2D) {
    this.tableHeight = 40; // Höhe der Tische
    this.playerSize = 40; // Spielergröße
    this.velocity = 2; // Bewegungsgeschwindigkeit
    this.angle = 0/360*2*Math.PI; // Startwinkel für Projektion
    // Initialisiere Eingaben
    this.inputs['w'] = false;
    this.inputs['a'] = false;
    this.inputs['s'] = false;
    this.inputs['d'] = false;
    // Setze Startposition
    this.playerX = 100;
    this.playerY = 100;
    this.ctx = ctx;
    this.gamefield = new Gamefield();
    // Lade benötigte Texturen vor
    await this.preloadImages(["/images/StoneFloorTexture.png", "/images/wall.png", "/images/Concrete-Floor-Tile.png"]);
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

      // Spielerposition aktualisieren
      this.updatePlayer();

      // Optional: Karte rotieren
      this.rotateMap();

      // Spielfeld und Spieler rendern
      this.renderEnvironment();
      this.renderPlayer();
      this.renderInteractableObjects();


      // Nächsten Frame anfordern
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
   * Erhöht den Winkel für die Projektion (Pseudo-3D-Effekt).
   */
  rotateMap()
  {
    if(this.angle <= 30/360*2*Math.PI)
    {
    this.angle+=0.003;
    }
  }



  /**
   * Aktualisiert die Spielerposition basierend auf Eingaben und prüft Kollisionen.
   * Bewegt den Spieler, solange kein Objekt oder Rand im Weg ist.
   */
  updatePlayer() {
    // Prüfe, ob der Spieler mit einem Objekt kollidiert
    let Obj = this.checkObject(); // Das Objekt mit dem kollidiert wurde (null | Field)

    // Normale Bewegung, wenn nichts im Weg
    if (!this.checkBorder() && !Obj) {
      if (this.inputs['s']) {
        this.playerY += this.velocity;
      }
      else if (this.inputs['w']) {
        this.playerY -= this.velocity;
      }
      else if (this.inputs['d']) {
        this.playerX += this.velocity;
      }
      else if (this.inputs['a']) {
        this.playerX -= this.velocity;
      }
    }
    // Falls Objekt oder Rand im Weg, setze Spieler direkt an Grenze
    else {
      if (this.inputs['s'] ) {
        if(Obj){
          this.playerY = Obj.y - this.playerSize / 2;
        }
        else{
          this.playerY = this.gamefield.rows * this.gamefield.fieldsize - this.playerSize / 2;
        }
      }
      else if (this.inputs['w']) {
        if (Obj)
        {
          this.playerY = Obj.y + Obj.height + this.playerSize / 2;
        }
        else
        {
          this.playerY = this.playerSize / 2
        }
      }
      else if (this.inputs['d']) {
        if (Obj){
          this.playerX = Obj.x - this.playerSize / 2;
        }
        else
        {
          this.playerX = this.gamefield.cols * this.gamefield.fieldsize - this.playerSize / 2;
        }
      }
      else if (this.inputs['a']) {
        if (Obj){
          this.playerX = Obj.x + Obj.width + this.playerSize / 2;
        }
        else {
          this.playerX = this.playerSize / 2;
        }
      }
    }
  } 



  /**
   * Prüft, ob ein einzelner Punkt (z.B. Ecke der Hitbox) im nächsten Frame mit einem Objekt kollidiert.
   * @param x X-Koordinate
   * @param y Y-Koordinate
   * @returns Das kollidierte Objekt oder null
   */
  checkPoint(x: number, y: number): Field | null {
    const Objects = this.gamefield.interactableObjects;
    let nextX = x;
    let nextY = y;
    let collidedObject = null;

    // Berechne nächste Position je nach Eingabe
    if (this.inputs['s']) {
      nextY = y + this.velocity;
    }
    else if (this.inputs['w']) {
      nextY = y - this.velocity;
    }
    else if (this.inputs['d']) {
      nextX = x+ this.velocity;
    }
    else if (this.inputs['a']) {
      nextX = x - this.velocity;
    }
    // Prüfe, ob ein Objekt an der neuen Position ist
    Objects.forEach(Obj => {
      if (Obj.y < nextY && nextY < Obj.y + Obj.height && Obj.x < nextX && nextX < Obj.x + Obj.width) {
        collidedObject = Obj;
      }
    });
    return collidedObject;
  }



  /**
   * Prüft Kollision der gesamten Spieler-Hitbox mit Objekten.
   * Überprüft die vier Ecken der Hitbox in Bewegungsrichtung.
   * @returns Das kollidierte Objekt oder null
   */
  checkObject(): Field | null {
    // Hitbox-Ecken berechnen
    const halfSize = this.playerSize / 2;
    const top = this.playerY - halfSize;
    const bottom = this.playerY + halfSize;
    const left = this.playerX - halfSize;
    const right = this.playerX + halfSize;

    // Prüfe alle vier Ecken
    const leftbot  = this.checkPoint(left,bottom);
    const rightbot = this.checkPoint(right, bottom);
    const lefttop = this.checkPoint(left, top);
    const righttop = this.checkPoint(right, top)
    
    // Prüfe relevante Ecken in Bewegungsrichtung
    if (this.inputs['s'] ) {
      if(leftbot) {
        return leftbot;
      } else if(rightbot) {
        return rightbot;
      }
    } else if (this.inputs['w']) {
      if(lefttop) {
        return lefttop;
      } else if(righttop) {
        return righttop;
      }
    } else if (this.inputs['d']) {
      if(rightbot) {
        return rightbot;
      } else if(righttop) {
        return righttop;
      }
    } else if (this.inputs['a']) {
      if(leftbot) {
        return leftbot;
      } else if(lefttop) {
        return lefttop;
      }
    }
    return null;
  }


  /**
   * Prüft, ob der Spieler im nächsten Frame den Spielfeldrand überschreiten würde.
   * @returns true, wenn eine Kollision mit dem Rand vorliegt
   */
  checkBorder(): boolean { 
    const rows = this.gamefield.rows;
    const cols = this.gamefield.cols;
    let nextX = this.playerX;
    let nextY = this.playerY;
    let collision = false;

    // Berechne nächste Position je nach Eingabe
    if (this.inputs['s']) {
      nextY = this.playerY + this.velocity;
    }
    else if (this.inputs['w']) {
      nextY = this.playerY - this.velocity;
    }
    else if (this.inputs['d']) {
      nextX = this.playerX + this.velocity;
    }
    else if (this.inputs['a']) {
      nextX = this.playerX - this.velocity;
    }

    // Prüfe Kollision mit Spielfeldgrenzen
    if (nextX - this.playerSize / 2 < 0) {
      collision = true;
    }
    else if (nextX + this.playerSize / 2 > cols * this.gamefield.fieldsize) {
      collision = true;
    }
    if (nextY - this.playerSize / 2 < 0) {
      collision = true;
    }
    else if (nextY + this.playerSize / 2 > rows * this.gamefield.fieldsize) {
      collision = true;
    }
    return collision;
  }



  /**
   * Zeichnet den Spieler als rotes Rechteck auf das Canvas.
   */
  renderPlayer() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "red";
    this.ctx.rect(
      this.playerX - this.playerSize / 2,
      (this.playerY - this.playerSize / 2) * Math.cos(this.angle),
      this.playerSize,
      this.playerSize * Math.cos(this.angle)
    );
    this.ctx.fill();
  }


  renderEnvironment()
  {
    for (let i = 0; i < this.gamefield.environmetObjects.length; i++) {
      this.renderField(i, false);
    }
  }

  renderInteractableObjects()
  {
    for (let i = 0; i < this.gamefield.interactableObjects.length; i++) {
      this.renderField(i, true);
    }
  }

  /**
   * Rendert ein einzelnes Feld (Umgebung oder interaktives Objekt) auf das Canvas.
   * @param x Index des Objekts
   * @param interactable true für interaktive Objekte, false für Umgebung
   */
  renderField(x: number, interactable: boolean) {
    let Obj;
    // Wähle das richtige Objekt-Array
    if (interactable) {
      Obj = this.gamefield.interactableObjects[x];
    } else {
      Obj = this.gamefield.environmetObjects[x];
    }

    const img = this.images[Obj.img];
    let projectionY = Obj.y * Math.cos(this.angle);

    // Zeichne Erhöhung für interaktive Objekte (z.B. Tische)
    if (interactable) {
      projectionY -= this.tableHeight * Math.sin(this.angle);
      // Schattierung für die Erhöhung

      this.ctx.beginPath();
      this.ctx.rect(
        Obj.x,
        (Obj.y + Obj.height) * Math.cos(this.angle) - this.tableHeight * Math.sin(this.angle),
        Obj.width,
        (this.tableHeight / 2) * Math.sin(this.angle)
      );
      this.ctx.fillStyle = "#b0b0b0";
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.rect(
        Obj.x,
        (Obj.y + Obj.height) * Math.cos(this.angle) - (this.tableHeight / 2) * Math.sin(this.angle),
        Obj.width,
        (this.tableHeight / 2) * Math.sin(this.angle)
      );
      this.ctx.fillStyle = "gray";
      this.ctx.fill();
       // Schatten zurücksetzen
    }

    // Zeichne Oberfläche
    if (img) {
      if (interactable) {
        // Tischoberfläche als gefülltes Rechteck
        this.ctx.fillStyle = "#dddddd";
        this.ctx.beginPath();
        this.ctx.rect(
          Obj.x,
          projectionY,
          Obj.width,
          Obj.height * Math.cos(this.angle) + 1 // +1 aufgrund von Rundungsfehlern bei Winkeln
        );
        this.ctx.fill();
      } else {
        // Boden als Bild
        this.ctx.drawImage(
          img,
          Obj.x,
          projectionY,
          Obj.width,
          Obj.height * Math.cos(this.angle)
        );
      }
    }
  }


  /**
   * Setzt den Status einer Taste (gedrückt/losgelassen).
   * @param key Taste (z.B. 'w', 'a', 's', 'd')
   * @param pressed true, wenn gedrückt
   */
  setInput(key: string, pressed: boolean) {
    this.inputs[key] = pressed;
  }
}