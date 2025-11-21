import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameService } from './services/game.service';
import { HudComponent } from './components/hud/hud.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HudComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Game';
  @ViewChild('game') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private game: GameService = new GameService();

  async ngAfterViewInit()
  {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    await this.game.init(this.ctx);
    this.game.startGame();

  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.game.setInput(event.key, true);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    this.game.setInput(event.key, false);
  }

  ngOnDestroy(): void {
    this.game.stopGame(); 
  }


}
