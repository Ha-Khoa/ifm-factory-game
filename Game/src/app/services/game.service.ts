
// Importiere notwendige Angular- und Projektmodule
import { Injectable } from '@angular/core';
import { Gamefield } from '../models/gamefield/gamefield';
import { Machine } from '../models/machine/machine';
import { Player } from '../models/player/player';
import { MachineManager } from '../models/machine/machine-manager';
import { Hitbox } from '../interfaces/hitbox';
import { Rendering } from '../models/rendering/rendering';
import { RenderObject } from '../models/rendering/render-object';

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
  //private playerSize!: number;
  // Geschwindigkeit des Spielers wird jetzt im Player-Objekt gehalten
  // Winkel für Projektion (z.B. Pseudo-3D-Effekt)
  private angle!: number;
  // Höhe der Tische
  private tableHeight!: number;
  private machines: Machine[] = [];
  private player!: Player;
  private machineManager!: MachineManager; 
  private renderer!: Rendering;

  constructor() { }


  /**
   * Initialisiert das Spiel, setzt Startwerte und lädt Bilder vor.
   * @param ctx CanvasRenderingContext2D zum Zeichnen
   */
  async init(ctx: CanvasRenderingContext2D) {
    this.tableHeight = 40; // Höhe der Tische
    const startSize = 40; // Startgröße des Spielers (Breite und Höhe)
    const startVelocity = 2; // Startgeschwindigkeit des Spielers
    this.angle = 30/360*2*Math.PI; // Startwinkel für Projektion
    // Initialisiere Eingaben
    this.inputs['w'] = false;
    this.inputs['a'] = false;
    this.inputs['s'] = false;
    this.inputs['d'] = false;
    // Setze Startposition
    this.player = new Player(100, 100, "player", startSize, startSize, startVelocity);
    this.ctx = ctx;
    this.gamefield = new Gamefield();
    this.machineManager = new MachineManager(this.gamefield);
    this.machines = this.machineManager.getMachines();
    this.gamefield.updateMachines(this.machines); 
    
    // Lade benötigte Texturen vor
    await this.preloadImages(["/images/StoneFloorTexture.png", "/images/wall.png", "/images/Concrete-Floor-Tile.png"]);

    this.renderer = new Rendering(this.ctx, this.images, this.angle);

      this.renderInteractableObjects();
      this.renderEnvironment()
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
      
      this.renderer.render();
      // Optional: Karte rotieren
      //this.rotateMap();

      // Spielfeld und Spieler rendern
      //this.renderEnvironment();
      this.renderPlayer();
      //this.renderInteractableObjects();
      this.checkForInteraction();


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
        this.player.y += this.player.velocity;
      }
      else if (this.inputs['w']) {
        this.player.y -= this.player.velocity;
      }
      else if (this.inputs['d']) {
        this.player.x += this.player.velocity;
      }
      else if (this.inputs['a']) {
        this.player.x -= this.player.velocity;
      }
    }
    // Falls Objekt oder Rand im Weg, setze Spieler direkt an Grenze
    else {
      if (this.inputs['s'] ) {
        if(Obj){
          this.player.y = Obj.y - this.player.height / 2;
        }
        else{
          this.player.y = this.gamefield.rows * this.gamefield.fieldsize - this.player.height / 2;
        }
      }
      else if (this.inputs['w']) {
        if (Obj)
        {
          this.player.y = Obj.y + Obj.height + this.player.height / 2;
        }
        else
        {
          this.player.y = this.player.height / 2
        }
      }
      else if (this.inputs['d']) {
        if (Obj){
          this.player.x = Obj.x - this.player.width / 2;
        }
        else
        {
          this.player.x = this.gamefield.cols * this.gamefield.fieldsize - this.player.width / 2;
        }
      }
      else if (this.inputs['a']) {
        if (Obj){
          this.player.x = Obj.x + Obj.width + this.player.width / 2;
        }
        else {
          this.player.x = this.player.width / 2;
        }
      }
    }
  } 

  /**
   * 
   * Prüft, ob der Spieler sich in Reichweite einer Maschine befindet und hebt die Interaktionszone hervor.
   * 
   */
  checkForInteraction()
  {
    this.machines.forEach(machine => {
      const accessDirection = machine.accessDirection;
      const interactionX = accessDirection === "right" ? machine.x + this.gamefield.fieldsize :
                           accessDirection === "left" ? machine.x - this.gamefield.fieldsize : machine.x;
      const interactionY = accessDirection === "down" ? machine.y + this.gamefield.fieldsize :
                           accessDirection === "up" ? machine.y - this.gamefield.fieldsize : machine.y;
      const interactionwidth = this.gamefield.fieldsize;
      const interactionheight = this.gamefield.fieldsize;

      const interactionHitbox: Hitbox = { // Hitbox der Interaktionszone
        x: interactionX,
        y: interactionY,
        width: interactionwidth,
        height: interactionheight
      };
      const playerHitbox: Hitbox = { // Hitbox des Spielers
        x: this.player.x - this.player.width / 2,
        y: this.player.y - this.player.height / 2,
        width: this.player.width,
        height: this.player.height
      }; 

      const collision = this.checkCollision(playerHitbox, interactionHitbox); // Prüfe Kollision zwischen Spieler und Interaktionszone
      if (collision)
      {
      if(accessDirection === "right")
      {
        this.ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      }
      else if(accessDirection === "left")
      {
        this.ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      }
      else if(accessDirection === "up")
      {
        this.ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      }
      else if(accessDirection === "down")
      {
        this.ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      }
    }
  });
  }

  //prüft Kollision zweier Hitbox Objekte
  checkCollision(obj1: Hitbox, obj2: Hitbox) : boolean
  {
    if(this.checkPointCollision(obj1.x, obj1.y, obj2) ||
      this.checkPointCollision(obj1.x + obj1.width, obj1.y, obj2) ||
      this.checkPointCollision(obj1.x, obj1.y + obj1.height, obj2) ||
      this.checkPointCollision(obj1.x + obj1.width, obj1.y + obj1.height, obj2)
    )
    {
      return true;
    }
    return false;
  }

  //prüft Kollision eines Punktes mit einem Hitbox Objekt
  checkPointCollision(x: number, y: number, obj: Hitbox) : boolean
  {
    if(obj.x < x && x < obj.x + obj.width && obj.y < y && y < obj.y + obj.height)
    {
      return true;
    }
    return false
  }





  /**
   * Prüft, ob ein einzelner Punkt (z.B. Ecke der Hitbox) im nächsten Frame mit einem Objekt kollidiert.
   * @param x X-Koordinate
   * @param y Y-Koordinate
   * @returns Das kollidierte Objekt oder null
   */
  checkPoint(x: number, y: number): RenderObject | null {
    const Objects = this.gamefield.interactableObjects;
    let nextX = x;
    let nextY = y;
    let collidedObject = null;

    // Berechne nächste Position je nach Eingabe
    if (this.inputs['s']) {
      nextY = y + this.player.velocity;
    }
    else if (this.inputs['w']) {
      nextY = y - this.player.velocity;
    }
    else if (this.inputs['d']) {
      nextX = x+ this.player.velocity;
    }
    else if (this.inputs['a']) {
      nextX = x - this.player.velocity;
    }
    // Prüfe, ob ein Objekt an der neuen Position ist
     // Hitbox des Spielers
    Objects.forEach(Obj => {
      
      const ObjHitbox: Hitbox = {
        x: Obj.x,
        y: Obj.y,
        width: Obj.width,
        height: Obj.height
      };

      if (this.checkPointCollision(nextX, nextY, ObjHitbox)) {
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
  checkObject(): RenderObject | null {
    // Hitbox-Ecken berechnen
    const halfSizeX = this.player.width / 2;
    const halfSizeY = this.player.height / 2;
    const top = this.player.y - halfSizeY;
    const bottom = this.player.y + halfSizeY;
    const left = this.player.x - halfSizeX;
    const right = this.player.x + halfSizeX;

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
    let nextX = this.player.x;
    let nextY = this.player.y;
    let collision = false;

    // Berechne nächste Position je nach Eingabe
    if (this.inputs['s']) {
      nextY = this.player.y + this.player.velocity;
    }
    else if (this.inputs['w']) {
      nextY = this.player.y - this.player.velocity;
    }
    else if (this.inputs['d']) {
      nextX = this.player.x + this.player.velocity;
    }
    else if (this.inputs['a']) {
      nextX = this.player.x - this.player.velocity;
    }

    // Prüfe Kollision mit Spielfeldgrenzen
    if (nextX - this.player.width / 2 < 0) {
      collision = true;
    }
    else if (nextX + this.player.width / 2 > cols * this.gamefield.fieldsize) {
      collision = true;
    }
    if (nextY - this.player.height / 2 < 0) {
      collision = true;
    }
    else if (nextY + this.player.height / 2 > rows * this.gamefield.fieldsize) {
      collision = true;
    }
    return collision;
  }



  /**
   * Zeichnet den Spieler als rotes Rechteck auf das Canvas.
   */
  renderPlayer() {
   this.renderer.deleteRenderingObjektByName("player");
   this.renderer.addRenderObject(new RenderObject(
    "player",
    "rect",
    this.player.x - this.player.width / 2,
    this.player.y - this.player.height / 2,
    0,
    this.player.width,
    this.player.height,
    undefined,
    undefined,
    "red",
    []
  ));
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
    const type = interactable ? "rect" : "img";
    const z = interactable ? 50 : -1;
    this.renderer.addRenderObject(Obj
      );
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