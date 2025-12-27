import { Component, OnInit, ElementRef, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { UI_THEME, loadTheme } from '../../services/ui/theme.manager';
import { RenderingService } from '../../services/rendering.service';
import { Gamefield } from '../../models/gamefield/gamefield';

@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [],
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.css']
})
export class StartScreenComponent implements OnInit {
  @ViewChild('startScreenCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('startScreenContainer') containerRef!: ElementRef<HTMLDivElement>;
  @Output() startClicked = new EventEmitter<void>();

  private ctx!: CanvasRenderingContext2D;
  private buttonRect = { x: 0, y: 0, width: 0, height: 0 };
  public isHidden = false;

  private width: number = window.innerWidth;
  private height: number = window.innerHeight;


  constructor() { }

  ngOnInit(): void {
    loadTheme();
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.setCanvasSize();
    this.draw();
  }

  private setCanvasSize(): void {
    this.canvasRef.nativeElement.width = window.innerWidth;
    this.canvasRef.nativeElement.height = window.innerHeight;
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Background
    this.ctx.fillStyle = UI_THEME.bgColor;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Title
    const title = 'IFM GAME';
    this.ctx.fillStyle = UI_THEME.textColor;
    this.ctx.font = `80px ${UI_THEME.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, this.ctx.canvas.width / 2, this.ctx.canvas.height / 3);


    // Start Button
    const buttonWidth = 300;
    const buttonHeight = 80;
    const buttonX = this.ctx.canvas.width / 2 - buttonWidth / 2;
    const buttonY = this.ctx.canvas.height / 2;
    this.buttonRect = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };

    this.ctx.fillStyle = UI_THEME.highlightColor;
    this.ctx.fillRect(this.buttonRect.x, this.buttonRect.y, this.buttonRect.width, this.buttonRect.height);

    this.ctx.fillStyle = UI_THEME.primary;
    this.ctx.font = `40px ${UI_THEME.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('START', this.ctx.canvas.width / 2, buttonY + buttonHeight / 2);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.setCanvasSize();
    this.draw();
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.isHidden) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x >= this.buttonRect.x && x <= this.buttonRect.x + this.buttonRect.width &&
        y >= this.buttonRect.y && y <= this.buttonRect.y + this.buttonRect.height) {
      this.startClicked.emit();
    }
  }

  public zoomOut() {
    this.isHidden = true;
    const style = this.containerRef.nativeElement.style;
    const renderingService = RenderingService.instance();
    // Calculate position dynamically
    const angle = renderingService.angle;
    const fov = renderingService.fov;
    const x = 0;
    const y = 0;

    const width = window.innerWidth + 'px';
    const height = window.innerHeight + 'px';

    style.setProperty('top', `${y}px`);
    style.setProperty('left', `${x}px`);
    style.setProperty('width', width);
    style.setProperty('height', height);

    style.setProperty('pointer-events', 'none');
  }

  public updatePosition() {
    //RenderingService.instance().camera.setCameraInBounds();
    const style = this.containerRef.nativeElement.style;
    const renderingService = RenderingService.instance();
    const angle = renderingService.angle;
    const fov = renderingService.fov;
    const newWidth = fov * this.width / 60;
    const newHeight = fov * this.height * Math.cos(angle) / 60;
    const gameY = fov * ((Gamefield.fieldsize * 5 + Gamefield.fieldsize / 2) + renderingService.yOffset / fov) * Math.cos(angle) - newHeight / 2 + renderingService.rotationZ

    const width = `${newWidth}px`;
    const height = `${newHeight}px`;
    style.setProperty('width', width);
    style.setProperty('height', height);


    // Calculate position dynamically
    const x = fov * (Gamefield.fieldsize * 10 + Gamefield.fieldsize / 2) + renderingService.xOffset - newWidth / 2;
    style.setProperty('top', `${gameY}px`);
    style.setProperty('left', `${x}px`);

  }
}
