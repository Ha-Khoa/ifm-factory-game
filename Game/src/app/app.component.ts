import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameService } from './services/game.service';
import { HudComponent } from './components/hud/hud.component';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './components/settings/settings.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HudComponent, SettingsComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Game';
  @ViewChild('game') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private game: GameService = new GameService();
  isSettingsOpen: boolean = false;

  async ngAfterViewInit()
  {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    await this.game.init(this.ctx);
    this.game.startGame();

  }

  @HostListener('window:keydown', ['$event']) // später durch richtige taste ersetzen
  onKeyDown(event: KeyboardEvent): void {
    if(event.key === 'Escape'){
      this.isSettingsOpen = !this.isSettingsOpen;
      return;
    }
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
