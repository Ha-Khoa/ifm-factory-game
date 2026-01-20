import { RenderingService } from "../rendering.service";

export class GameTimer {

    private timerMinutes: number = 0;
    private timerSeconds: number = 5;
    private time!: number;

      constructor(
    private ctx: CanvasRenderingContext2D,
    private images: { [key: string]: HTMLImageElement }
  ) {
    this.time = (60 * this.timerMinutes + this.timerSeconds) * 1000;
  }

  drawTimer()
  {
    let extraZero = this.timerSeconds < 10 ? 0 : "";
    const time = this.timerMinutes + ":" + extraZero + this.timerSeconds 
    const size = 100;
    this.ctx.fillStyle = "#053c85bb"
    this.ctx.font = `italic small-caps bold ${size}px arial`;
    this.ctx.fillText(time, this.ctx.canvas.width / 2 - this.ctx.measureText(time).width / 2, this.ctx.canvas.height - 20);
    return [{x: this.ctx.canvas.width / 2 - this.ctx.measureText(time).width / 2 - 1, y: - 1, width: this.ctx.measureText(time).width + 2, height: size + 2}]
  }

  updateTimer() : boolean
  {
    let dt = RenderingService.instance().deltaTime;
    if(!dt) dt = 1;
    this.time = this.time - dt <= 0 ? 0 : this.time - dt;
    const newMinutes = Math.round(this.time / 60000 - 0.5);
    const newSeconds = Math.round(this.time % 60000 / 1000 -0.5);
    this.timerMinutes = newMinutes;
    this.timerSeconds = newSeconds;
    if(this.time <= 0) return true;
    else return false
  }
}