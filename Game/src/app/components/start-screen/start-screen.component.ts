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
  @ViewChild('topSection') topSectionRef!: ElementRef<HTMLDivElement>;
  @ViewChild('bottomSection') bottomSectionRef!: ElementRef<HTMLDivElement>;
  @ViewChild('screenContainer') screenContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('phone') phoneRef!: ElementRef<HTMLDivElement>;
  @ViewChild('homeButton') homeButtonRef!: ElementRef<HTMLDivElement>;
  @ViewChild('camera') startScreenContainerRef!: ElementRef<HTMLDivElement>;
  @Output() startClicked = new EventEmitter<void>();

  private ctx!: CanvasRenderingContext2D;
  private buttonRect = { x: 0, y: 0, width: 0, height: 0 };
  public isHidden = false;

  private height: number = 1080;
  private width: number = this.height * window.innerWidth / window.innerHeight;


  constructor() { }

  ngOnInit(): void {
    loadTheme();
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.setCanvasSize();
    this.draw();
  }

  private setCanvasSize(): void {
 this.canvasRef.nativeElement.width = this.width;
    this.canvasRef.nativeElement.height = this.height;
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
    // Scale coordinates from visual size to canvas pixel size
    const scaleX = this.canvasRef.nativeElement.width / rect.width;
    const scaleY = this.canvasRef.nativeElement.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

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
    const styleCanvas = this.canvasRef.nativeElement.style;
    const topSectionStyle = this.topSectionRef.nativeElement.style;
    const bottomSectionStyle = this.bottomSectionRef.nativeElement.style;
    const screenContainerStyle = this.screenContainerRef.nativeElement.style;
    const phoneStyle = this.phoneRef.nativeElement.style;
    const homeButtonStyle = this.homeButtonRef.nativeElement.style;
    const cameraStyle = this.startScreenContainerRef.nativeElement.style;
    const renderingService = RenderingService.instance();
    const angle = renderingService.angle;
    const fov = renderingService.fov;
    const startingFov = 60;
    const newWidth = (this.width) * fov / startingFov ;
    const newHeight = fov * this.height / startingFov;
    const gameY = fov * ((Gamefield.fieldsize * 5 + Gamefield.fieldsize / 2) + renderingService.yOffset / fov) * Math.cos(angle) + RenderingService.instance().rotationZ - this.height / 2 / startingFov * fov

    const width = `${newWidth}px`;
    const height = `${newHeight}px`;
    style.setProperty('width', width);
    style.setProperty('height', height);
    styleCanvas.setProperty('height', height);
    styleCanvas.setProperty('width', this.width * fov / startingFov + 'px');
    const newHeightTopBot = fov / startingFov * 100;
    bottomSectionStyle.setProperty('height', `${newHeightTopBot}px`);
    topSectionStyle.setProperty('height', `${newHeightTopBot}px`);
    const edgeWidth = fov / startingFov * 20;
    screenContainerStyle.setProperty('border-right', `${edgeWidth}px solid black`);
    screenContainerStyle.setProperty('border-left', `${edgeWidth}px solid black`);
    const phoneBeforeY = fov / startingFov * 50;
    const phoneAfterY = fov / startingFov * 120;
    const phoneBeforeSize = fov / startingFov * 30;
    const phoneAfterSize = fov / startingFov * 50;
    const widthPhone = fov / startingFov * 3;
    phoneStyle.setProperty('--width', `${widthPhone}px`);
    phoneStyle.setProperty('--before-height', `${phoneBeforeSize}px`);
    phoneStyle.setProperty('--after-height', `${phoneAfterSize}px`);
    phoneStyle.setProperty('--before-top', `${phoneBeforeY}px`);
    phoneStyle.setProperty('--after-top', `${phoneAfterY}px`);
    const homeButtonSize = fov / (window.innerHeight / 1080 * 60) * 50;
    homeButtonStyle.setProperty('width', `${homeButtonSize}px`);
    homeButtonStyle.setProperty('height', `${homeButtonSize}px`);
    const sizeIcon = fov / (window.innerHeight / 1080 * 60) * 30;
    homeButtonStyle.setProperty('--size-icon', `${sizeIcon}px`);
    const cameraSize = fov / (window.innerHeight / 1080 * 60) * 50;
    cameraStyle.setProperty('height', `${cameraSize}px`);

    // Calculate position dynamically
    const x = fov * (Gamefield.fieldsize * 10 + Gamefield.fieldsize / 2) + renderingService.xOffset - newWidth / 2
    style.setProperty('top', `${gameY}px`);
    style.setProperty('left', `${x}px`);

  }
}
