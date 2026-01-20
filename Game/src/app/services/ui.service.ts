import {Injectable} from '@angular/core';
import {Machine} from '../models/machine/machine';
import {Package} from '../models/package/package';
import {Product} from '../models/product/product';
import {Rect} from './ui/rect.interface';
import {loadTheme} from './ui/theme.manager';
import {CanvasHelper} from './ui/canvas.helper';
import {ItemPopupDrawer} from './ui/item-popup.drawer';
import {MachinePopupDrawer} from './ui/machine-popup.drawer';
import {Player} from '../models/player/player';
import {PlayerThoughtsDrawer, PlayerThoughtsType} from './ui/player-thoughts.drawer';
import {Coordinates} from '../models/coordinates/coordinates';
import { GameTimer } from './ui/game.timer';

@Injectable({
  providedIn: 'root'
})
export class UIService {
  private ctxUI!: CanvasRenderingContext2D;
  private angle!: number;
  private images: { [key: string]: HTMLImageElement } = {};

  // Drawer instances
  private itemPopupDrawer!: ItemPopupDrawer;
  private machinePopupDrawer!: MachinePopupDrawer;
  private playerThoughtsDrawer!: PlayerThoughtsDrawer;
  private gameTimer!: GameTimer;

  // State management for drawn elements that need clearing
  private machinePopups: Rect[] = [];
  private itemPopups: Rect[] = [];
  private neededItemPopups: Rect[] = [];
  private producingPopups: Rect[] = [];
  private playerThoughtsPopups: Rect[] = [];
  private timerText: Rect[] = [];

  constructor() {}

  /**
   * Initializes the UIService with the canvas context and other required resources.
   * This must be called before any drawing operations can be performed.
   * @param ctxUI The 2D rendering context for the UI canvas.
   * @param angle The isometric projection angle of the game world.
   * @param images A dictionary of pre-loaded image assets.
   */
  public init(
    ctxUI: CanvasRenderingContext2D,
    angle: number,
    images: { [key: string]: HTMLImageElement }
  ): void {
    this.ctxUI = ctxUI;
    this.angle = angle;
    this.images = images;

    // Load the theme and initialize drawer classes
    loadTheme();
    this.itemPopupDrawer = new ItemPopupDrawer(this.ctxUI, this.images);
    this.machinePopupDrawer = new MachinePopupDrawer(this.ctxUI, this.images);
    this.playerThoughtsDrawer = new PlayerThoughtsDrawer(this.ctxUI, this.images);
    this.gameTimer = new GameTimer(this.ctxUI, this.images);
  }

  // ==========================================================================
  // --- Popup Drawing Methods (Delegation) ---
  // ==========================================================================

  /** Draws a popup for a product or package on the ground. */
  public drawItemPopup(item: Product | Package, offsetCamera: [number, number], fov: number): void {
    this.clearItemPopup();
    this.itemPopups = this.itemPopupDrawer.draw(item, offsetCamera, fov);
  }

  /** Clears the currently visible item popup. */
  public clearItemPopup(): void {
    //this.itemPopups.forEach(rect => CanvasHelper.clearRectRounded(this.ctxUI, rect, rect.radius ?? 10, true));
    this.itemPopups = [];
  }

  /** Draws the detailed information popup for a machine. */
  public drawMachinePopUp(machine: Machine, player: Player): void {
    this.machinePopups.push(...this.machinePopupDrawer.drawDetails(machine, player));
  }

  /** Clears the currently visible machine detail popup. */
  public clearMachinePopUp(): void {
    //this.machinePopups.forEach(popUp => CanvasHelper.clearRectRounded(this.ctxUI, popUp, popUp.radius ?? 10, true));
    this.machinePopups = [];
  }

  /** Draws indicators for items needed by machines. */
  public drawMachineNeedsPopup(machines: Machine[], offsetCamera: [number, number], fov: number, players: Player[] | null): void {
    //this.neededItemPopups.forEach(rect => CanvasHelper.clearRectRounded(this.ctxUI, rect, rect.radius ?? 10, true));
    this.neededItemPopups = [];
    this.neededItemPopups = this.machinePopupDrawer.drawNeeds(machines, offsetCamera, fov, players);
  }

  /** Draws progress rings for machines that are currently producing. */
  public drawMachineProducingPopup(machines: Machine[], offsetCamera: [number, number], fov: number): void {
    this.producingPopups = [];
    this.producingPopups = this.machinePopupDrawer.drawProductionProgress(machines, offsetCamera, fov);
  }

  public drawPlayerThoughts(player: Player, offsetCamera: [number, number], fov: number): void {
    //this.playerThoughtsPopups.forEach(rect => CanvasHelper.clearRectRounded(this.ctxUI, rect, rect.radius ?? 10, true));
    this.playerThoughtsPopups = [];
    switch (player.thoughts) {
      case PlayerThoughtsType.NOT_ENOUGH_MONEY:
        this.playerThoughtsPopups = this.playerThoughtsDrawer.drawNotEnoughMoney(player.position, offsetCamera, fov);
        break;
      default: break;
    }
  }

  public clearAll()
  {
    this.ctxUI.clearRect(0, 0, this.ctxUI.canvas.width, this.ctxUI.canvas.height)
  }

  public drawTimer()
  {
    this.timerText.forEach(rect => CanvasHelper.clearRectRounded(this.ctxUI, rect, rect.radius ?? 0, true))
    this.timerText = [];
    this.timerText = this.gameTimer.drawTimer();
    this.gameTimer.updateTimer();
  }

  /**
   * A generic method to clear a rectangular area with rounded corners.
   * Note: Prefer specific clear methods like `clearItemPopup` if available.
   * This is retained for compatibility or special cases.
   * @param rect The rectangle to clear.
   * @param radius The corner radius.
   */
  public clearRectRounded(rect: Rect, radius: number = 10): void {
    CanvasHelper.clearRectRounded(this.ctxUI, rect, radius, true);
  }
}
