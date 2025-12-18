import { RenderObject } from "../rendering/render-object";
import { Coordinates } from "../coordinates/coordinates";
import { Hitbox } from "../../interfaces/hitbox";
import { Direction } from "../../enums/direction";
import { Gamefield } from "../gamefield/gamefield";
import { ParticleRenderObject } from "../rendering/particle-render-object";

export class InteractableObject {
    protected _renderObject: RenderObject;
    protected _hitbox: Hitbox;
    protected _position: Coordinates;
    protected _width: number;
    protected _height: number;
    protected _directions: Direction[];
    protected _particleRenderObjects: ParticleRenderObject[] = [];

    constructor(
        name: string,
        position: Coordinates,
        width: number,
        height: number,
        z: number,
        directions: Direction[],
        type: string,
        img?: string,
        imgWall?: string,
        color?: string,
        colorLayers?: string[]
    ) {
        this._position = position;
        this._width = width;
        this._height = height;
        this._directions = directions;

        // Base hitbox is aligned to the object's position and size
        this._hitbox = new Hitbox(position, width, height);


        // Create a render object based on provided args
        this._renderObject = new RenderObject(
            name,
            type,
            this._position.x,
            this._position.y,
            z,
            this._width,
            this._height,
            90,
            img,
            imgWall,
            color,
            colorLayers
        );

        let xParticles;
        let yParticles;
        let i = 0;
        for(let direction of this.directions)
        {
        xParticles = direction === Direction.RIGHT ? this.position.x + this.width :
                     direction === Direction.LEFT ? this.position.x - Gamefield.fieldsize : this.position.x;
        yParticles = direction === Direction.DOWN ? this.position.y + this.height :
                     direction === Direction.UP ? this.position.y - Gamefield.fieldsize : this.position.y;
        width = direction === Direction.LEFT || direction === Direction.RIGHT ? Gamefield.fieldsize : this.width;
        height = direction === Direction.UP || direction === Direction.DOWN ? Gamefield.fieldsize : this.height;
        
        this._particleRenderObjects.push(new ParticleRenderObject(
                  `particle-${i}`,
                  xParticles,
                  yParticles,
                  0,
                  width,
                  height,
                  200,  
                  "straightUp",
                  "rect",
                  ["#ffffffff", "#d8d876ff", "#f1f1f1ff", "#FFFF00"]
                ))
            i++;
            }
    }

    // Accessors
    get position(): Coordinates {
        return this._position;
    }
    get width(): number {
        return this._width;
    }
    get height(): number {
        return this._height;
    }
    get hitbox(): Hitbox {
        return this._hitbox;
    }

    get directions(): Direction[] {
        return this._directions;
    }

    // Update position and keep hitboxes in sync
    set position(pos: Coordinates) {
        this._position = pos;
        this._hitbox.x = pos.x;
        this._hitbox.y = pos.y;
    }

    // Update size and keep hitboxes in sync
    setSize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._hitbox.width = width;
        this._hitbox.height = height;
        // Interaction hitbox matches exactly the object's size

    }

    // Update allowed directions
    setDirections(directions: Direction[]) {
        this._directions = directions;
    }

      /** RenderObject für die visuelle Darstellung */
    get renderObject(): RenderObject { return this._renderObject; }
    set renderObject(v: RenderObject) { this._renderObject = v; }

    get particleRenderObjects(): ParticleRenderObject[] { return this._particleRenderObjects }
    
    

}

