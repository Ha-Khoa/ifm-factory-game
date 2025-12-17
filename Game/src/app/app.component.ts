import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { GameService } from './services/game.service';
import { HudComponent } from './components/hud/hud.component';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './components/settings/settings.component';
import { OrderComponent } from "./components/order/order.component";

@Component({
  selector: 'app-root',
  imports: [HudComponent, SettingsComponent, CommonModule, OrderComponent],
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
  //Slotmachine Canvas
  @ViewChild('slotMachine') canvasSlotMachineRef!: ElementRef<HTMLCanvasElement>;
  private ctxSlotMachine!: CanvasRenderingContext2D
  // Game Container
  @ViewChild('gameContainer') gameContainer!: ElementRef;

  // Settings
  @ViewChild(SettingsComponent) settingsMenu?: SettingsComponent;
  isSettingsOpen: boolean = false;

  constructor(private game: GameService) { }

  async ngAfterViewInit() {
    this.gameContainer.nativeElement.style.maxWidth = this.cwidth.toString();
    const canvas = this.canvasRef.nativeElement;
    const canvasUI = this.canvasUIRef.nativeElement;
    const canvasSlotMachine = this.canvasSlotMachineRef.nativeElement;

    this.ctx = canvas.getContext('2d')!;
    this.ctxUI = canvasUI.getContext('2d')!;
    this.ctxSlotMachine = canvasSlotMachine.getContext('2d')!;

    await this.game.init(this.ctx, this.ctxUI, this.ctxSlotMachine);
    this.game.startGame();

  }

  @HostListener('window:keydown', ['$event']) // später durch richtige taste ersetzen
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if(this.isSettingsOpen) this.settingsMenu?.closeSettingsMenu();
      else this.isSettingsOpen = true;
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
