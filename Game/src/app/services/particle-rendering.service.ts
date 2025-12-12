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

  constructor() { }

  private static _instance: ParticleRenderingService | null = null;

  static instance(): ParticleRenderingService {
    if (!this._instance) {
      this._instance = new ParticleRenderingService();
    }
    return this._instance;
  }

  init(ctx: CanvasRenderingContext2D, angle: number)
  {
    this._ctx = ctx
    this._angle = angle
  }

  render(particleObject: Particles, deltaTime: number)
  {
    particleObject.spawnParticles(deltaTime);
    particleObject.updateParticles(deltaTime);
    const particles = particleObject.particles;
    for (let particle of particles) {
      
      this.drawCircle(particle);
    }
  }

  drawCircle(particle: Particle)
  {
    this._angle = RenderingService.instance().angle
    this._ctx.beginPath();
    this._ctx.arc(particle.x, particle.y * Math.cos(this._angle) - particle.z * Math.sin(this._angle), particle.size, 0, 2 * Math.PI, false);
    this._ctx.fillStyle = particle.color;
    this._ctx.fill();
    this._ctx.closePath();
  }

}
