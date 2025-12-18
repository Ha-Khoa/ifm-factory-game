import { Injectable } from '@angular/core';
import { Particles } from '../models/particle/particles'
import { Particle } from '../models/particle/particle'
import { RenderingService } from './rendering.service';

@Injectable({
  providedIn: 'root'
})
export class ParticleRenderingService {

  private _ctx!: CanvasRenderingContext2D;

  private _angle!: number;
  
  private _xOffset!: number;

  private _yOffset!: number;

  private _fov!: number;

  constructor() { }

  private static _instance: ParticleRenderingService | null = null;

  static instance(): ParticleRenderingService {
    if (!this._instance) {
      this._instance = new ParticleRenderingService();
    }
    return this._instance;
  }

  init(ctx: CanvasRenderingContext2D, angle: number, xOffset: number, yOffset: number, fov: number)
  {
    this._ctx = ctx
    this._angle = angle
    this._xOffset = xOffset;
    this._yOffset = yOffset;
    this._fov = fov;
  }

  render(particleObject: Particles, deltaTime: number)
  {
    particleObject.spawnParticles(deltaTime);
    const particles = particleObject.particles;
    //Anpassung an die Kamera, damit immer richtige Position
    for(let particle of particles)
    {
      particle.x = (particle.worldCoordinates.x + this._xOffset / this._fov) * this._fov
      particle.y = (particle.worldCoordinates.y * this._fov) + this._yOffset
    }
    particleObject.updateParticles(deltaTime);
    

    for (let particle of particles) {
      this.drawCircle(particle);
    }
  }

  drawCircle(particle: Particle)
  {
    this._angle = RenderingService.instance().angle
    this._ctx.beginPath();
    this._ctx.arc(particle.x, particle.y * Math.cos(this._angle) - particle.z * Math.sin(this._angle), this._fov * particle.size, 0, 2 * Math.PI, false);
    this._ctx.fillStyle = particle.color;
    this._ctx.fill();
    this._ctx.closePath();
  }


  set xOffset(v: number) { this._xOffset = v }
  set yOffset(v: number) { this._yOffset = v }
  set fov(v: number) { this._fov = v }

}
