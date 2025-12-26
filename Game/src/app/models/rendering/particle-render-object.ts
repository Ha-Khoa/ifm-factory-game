import { RenderObject } from "./render-object";
import { Particles } from "../particle/particles";
import { RenderType } from "../../enums/render-type";

export class ParticleRenderObject extends RenderObject {
    
    private _particles: Particles;
    private _render: boolean;

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
        super(id, RenderType.PARTICLE, x, y, z, width, height, 300);
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
        this._render = false;
    }

    get particles(): Particles { return this._particles; }
    set particles(v: Particles) { this._particles = v; }

    get render(): boolean { return this._render }
    set render(v: boolean) { this._render = v }

    get ptype(): string { return this._particles.type; }
    set ptype(v: string) { this._particles.type = v; }

    get spawnType(): string { return this._particles.spawnType; }
    set spawnType(v: string) { this._particles.spawnType = v; }

    get colors(): string[] { return this._particles.colors; }
    set colors(v: string[]) { this._particles.colors = v; }


}
