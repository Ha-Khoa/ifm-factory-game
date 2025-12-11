import { RenderObject } from "./render-object";
import { Particles } from "../particle/particles";

export class ParticleRenderObject extends RenderObject {
    
    private _particles: Particles;

    constructor(
        id: string,
        x: number,
        y: number,
        z: number,
        width: number,
        height: number,
        spawnRate: number,
        type: string,
        spawnType: string,
        colors: string[]
    ) {
        super(id, "particle", x, y, z, width, height, 5000);
        this._particles = new Particles(
            x,
            y,
            z,
            width,
            height,
            spawnRate, // spawnRate
            type, // type
            spawnType, // spawnType
            colors // colors
        );
    }

    get particles(): Particles { return this._particles; }
    set particles(v: Particles) { this._particles = v; }




}
