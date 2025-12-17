import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { GameService } from './services/game.service';
import { HudComponent } from './components/hud/hud.component';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './components/settings/settings.component';
import { OrderComponent } from "./components/order/order.component";
import { StartScreenComponent } from './components/start-screen/start-screen.component'; // New import

@Component({
  selector: 'app-root',
  standalone: true, // Assuming standalone based on `imports` usage
  imports: [HudComponent, SettingsComponent, CommonModule, OrderComponent, StartScreenComponent], // Add StartScreenComponent
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Game';
  cwidth = window.innerWidth;
  cheight = window.innerHeight;

  // Game canvas
  @ViewChild('game') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  // UI canvas
  @ViewChild('ui') canvasUIRef!: ElementRef<HTMLCanvasElement>;
  private ctxUI!: CanvasRenderingContext2D;
  // Game Container
  @ViewChild('gameContainer') gameContainer!: ElementRef;

  // Settings
  @ViewChild(SettingsComponent) settingsMenu?: SettingsComponent;
  @ViewChild(StartScreenComponent) startScreen?: StartScreenComponent;
  isSettingsOpen: boolean = false;
  showStartScreen: boolean = true;

  constructor(private game: GameService) { }

  async ngAfterViewInit() {
    this.gameContainer.nativeElement.style.maxWidth = this.cwidth.toString();
    const canvas = this.canvasRef.nativeElement;
    const canvasUI = this.canvasUIRef.nativeElement;

    this.ctx = canvas.getContext('2d')!;
    this.ctxUI = canvasUI.getContext('2d')!;
  }

  @HostListener('window:keydown', ['$event']) // später durch richtige taste ersetzen
  onKeyDown(event: KeyboardEvent): void {
    if (this.showStartScreen) return; // Ignore input if start screen is active

    if (event.key === 'Escape') {
      if(this.isSettingsOpen) this.settingsMenu?.closeSettingsMenu();
      else this.isSettingsOpen = true;
      return;
    }
    this.game.setInput(event.key, true);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (this.showStartScreen) return; // Ignore input if start screen is active
    this.game.setInput(event.key, false);
  }

  ngOnDestroy(): void {
    this.game.stopGame();
  }

  async onStartGame(): Promise<void> {
    await this.game.init(this.ctx, this.ctxUI);
    this.game.startGame();
    this.startScreen?.hide();
    setTimeout(() => {
      this.showStartScreen = false;

    }, 1500);
  }
}
