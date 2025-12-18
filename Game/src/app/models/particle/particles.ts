import { Coordinates } from "../coordinates/coordinates";
import { Particle } from "./particle";

export class Particles {

    private static lastId : number = 0;
    private _id : number;
    private _particles: Particle[];
    private _spawnRate: number; // particles per second
    private _type: string;
    private _spawnType: string;
    private _x: number;
    private _y: number;
    private _z: number;
    private _width: number;
    private _height: number;
    private _colors: string[];
    private _timeSinceLastSpawn: number = 0;
    private _worldCoordinates: Coordinates;
    private _standardWidth: number;
    private _standardHeight: number;

    constructor(x: number, y: number, z: number,
                width: number, height: number,
                spawnRate: number, type: string, spawnType: string, colors: string[]) {
        this._id = Particles.lastId++;
        this._particles = [];
        this._x = x;
        this._y = y;
        this._z = z;
        this._width = width;
        this._height = height;
        this._spawnRate = spawnRate;
        this._type = type;
        this._spawnType = spawnType;
        this._colors = colors;
        this._worldCoordinates = new Coordinates(x, y)
        this._standardHeight = this._height;
        this._standardWidth = this._width
    }

    spawnParticles(deltaTime: number) {
        switch(this._spawnType) {
            case "rect":
                this.spawnParticlesRect(deltaTime);
                break;
            case "empty":
                this.spawnParticleEmptyRect(deltaTime);
                break;
            default:
                break;
        }
    }

    updateParticles(deltaTime: number) {
        switch(this._type) {
            case "straightUp":
                this.particleBehaviorStraightUp(deltaTime);
                break;
            case "rotate":
                this.particleRotatetUP(deltaTime);
                break;
            default:
                break;
        }

    }

    spawnParticlesRect(deltaTime: number) {
        if(!deltaTime) return
        this._timeSinceLastSpawn += deltaTime / 1000 * this._spawnRate;
        while (this._timeSinceLastSpawn > 1) {
            const rx = this._x + Math.random() * this._width;
            const ry = this._y + Math.random() * this._height;
            const rz = this._z;
            const rvx = 0;
            const rvy = 0;
            const rvz = - 30 - Math.random() * 70;
            const lifeTime = 2 + Math.random() * 1 ;
            const size = 0.2 + Math.random() * 0.5;
            const color = this._colors[Math.floor(Math.random() * this._colors.length)];
            const type = "circle";
            const particle = new Particle(rx, ry, rz, rvx, rvy, rvz, lifeTime, size, color, type);
            this._particles.push(particle);
            this._timeSinceLastSpawn -= 1;
        }
    }

    spawnParticleEmptyRect(deltaTime: number)
    {
        if(!deltaTime) return
        this._timeSinceLastSpawn += deltaTime / 1000 * this._spawnRate;
        while (this._timeSinceLastSpawn > 1)
        {
            let rx = 0;
            let ry = 0;
            const side = Math.round(Math.random() * 4)
            switch(side) {
               case 0:
                rx = this._x + Math.random() * this._width;
                ry = this._y;
                break;
                case 1:
                rx = this._x + Math.random() * this._width;
                ry = this._y + this._height;
                break;
                case 2:
                rx = this._x
                ry = this._y + Math.random() * this._height
                break;
                case 3:
                rx = this._x + this._width;
                ry = this._y + Math.random() * this._height
                break;
            }
            const rz = this._z;
            const rvx = 0;
            const rvy = 0;
            const rvz = -50;
            const lifeTime = 2 + Math.random() * 1 ;
            const size = 0.2 + Math.random() * 0.5;
            const color = this._colors[Math.floor(Math.random() * this._colors.length)];
            const type = "circle";
            const particle = new Particle(rx, ry, rz, rvx, rvy, rvz, lifeTime, size, color, type);
            this._particles.push(particle);
            this._timeSinceLastSpawn -= 1;
        }
    }

    particleBehaviorStraightUp(deltaTime: number)
    {
        for (let particle of this._particles)
        {
            particle.z -= particle.vz * deltaTime / 1000;
            particle.age += deltaTime / 1000;
        }
        this._particles = this._particles.filter(p => p.age < p.lifeTime);
    }

    particleRotatetUP(deltaTime: number) {
        for (let particle of this._particles) {
            particle.z -= particle.vz * deltaTime / 1000;
            particle.age += deltaTime / 1000;
            let speed = 10;

            if((particle.x - this.x) - (particle.y - this.y) < 0 && (particle.x - this.x) + (particle.y - this.y) < this._width)
            {
                particle.y += speed * deltaTime / 1000;
            }
            else if((particle.x - this.x) - (particle.y - this.y) >= 0 && (particle.x - this.x) + (particle.y - this.y) >= this._width)
            {
                particle.y -= speed * deltaTime / 1000;
            }
            else if((particle.x - this.x) - (particle.y - this.y) < 0 && (particle.x - this.x) + (particle.y - this.y) >= this._width)
            {
                particle.x += speed * deltaTime / 1000;
            }
            else
            {
                particle.x -= speed * deltaTime / 1000;
            }
        }
        this._particles = this._particles.filter(p => p.age < p.lifeTime);
    }

    get id(): number { return this._id; }
    get particles(): Particle[] { return this._particles; }
    get spawnRate(): number { return this._spawnRate; }
    get type(): string { return this._type; }
    get x(): number { return this._x; }
    get y(): number { return this._y; }
    get z(): number { return this._z; }
    get width(): number { return this._width; }
    get height(): number { return this._height; }
    get worldCoordinates(): Coordinates { return this._worldCoordinates }
    get standartWidth(): number { return this._standardWidth }
    get standartHeight(): number { return this._standardHeight }
    get spawnType(): string { return this._spawnType }
    get colors(): string[] { return this._colors; }

    set particles(v: Particle[]) { this._particles = v; }
    set spawnRate(v: number) { this._spawnRate = v; }
    set type(v: string) { this._type = v; }
    set x(v: number) { this._x = v; }
    set y(v: number) { this._y = v; }
    set z(v: number) { this._z = v; }
    set width(v: number) { this._width = v; }
    set height(v: number) { this._height = v; }     
    set spawnType(v: string) { this._spawnType = v; }
    set colors(v: string[]) { this._colors = v; }
}
