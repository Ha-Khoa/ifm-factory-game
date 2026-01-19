import { Component, ViewChild, ElementRef, OnDestroy, AfterViewInit, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { HudComponent } from './components/hud/hud.component';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './components/settings/settings.component';
import { OrderComponent } from "./components/order/order.component";
import { StartScreenComponent } from './components/start-screen/start-screen.component'; // New import
import { Subscription } from 'rxjs';
import { RenderingService } from './services/rendering.service';
import { ApiService } from './services/api.service';
import { PlayerService } from './services/player.service';
import { InputService } from './services/input.service';

@Component({
  selector: 'app-root',
  standalone: true, // Assuming standalone based on `imports` usage
  imports: [HudComponent, SettingsComponent, CommonModule, OrderComponent, StartScreenComponent], // Add StartScreenComponent
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy, OnInit {
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

  private gameLoopSubscription!: Subscription;
  private alignSubscription!: Subscription;
  private escapePressedLastFrame = false;

  constructor(
    private game: GameService,
    private apiService: ApiService,
    private playerService: PlayerService,
    private inputService: InputService
  ) { }

  ngOnInit(): void {
    this.apiService.getPlayers().subscribe(players => {
      if (players.length === 0) {
        // No players exist, create 'Player1' automatically
        this.apiService.createPlayer('Player1').subscribe(newPlayer => {
          this.playerService.setPlayer(newPlayer);
        });
      } else {
        // Load the first player if available
        this.playerService.setPlayer(players[0]);
      }
    });
  }

  async ngAfterViewInit() {
    this.gameContainer.nativeElement.style.maxWidth = this.cwidth.toString();
    const canvas = this.canvasRef.nativeElement;
    const canvasUI = this.canvasUIRef.nativeElement;

    this.ctx = canvas.getContext('2d')!;
    this.ctxUI = canvasUI.getContext('2d')!;

    this.game.init(this.ctx, this.ctxUI);

        this.alignSubscription = this.game.gameLoopTick$.subscribe(() =>
    {
      RenderingService.instance().camera.setCameraInBounds();
    })

    this.gameLoopSubscription = this.game.gameLoopTick$.subscribe(() => {
      if (this.startScreen && this.startScreen.isHidden) {
        this.startScreen.updatePosition();
      }

      const escapePressed = this.inputService.keyboardState['escape'];
      if (escapePressed && !this.escapePressedLastFrame) {
        if (!this.showStartScreen) {
            if (this.isSettingsOpen) this.settingsMenu?.closeSettingsMenu();
            else this.isSettingsOpen = true;
        }
      }
      this.escapePressedLastFrame = escapePressed;
    });

  }

  ngOnDestroy(): void {
    this.game.stopGame();
    if (this.gameLoopSubscription) {
      this.gameLoopSubscription.unsubscribe();
    }
    if (this.alignSubscription) {
        this.alignSubscription.unsubscribe();
    }
  }

  async onStartGame(): Promise<void> {
    this.game.startGame();
    this.startScreen?.zoomOut();
    if (this.game.twoPlayerMode === true) {
      this.apiService.setTwoPlayerMode(this.playerService.player!.name, true).subscribe({
        next: () => { /* Successfully updated backend */ },
        error: (err) => { /* Handle error if needed */ }
      });
    }
    setTimeout(() => {
     this.showStartScreen = false;
      this.alignSubscription.unsubscribe();
    }, 2000);
  }

  onSettingsOpen(): void {
    this.isSettingsOpen = true;
  }
}
