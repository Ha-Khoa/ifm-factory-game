import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Game';
  @ViewChild('game') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private game: GameService = new GameService();

  ngAfterViewInit()
  {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.game.init(this.ctx);
    this.game.startGame();

  }


}
