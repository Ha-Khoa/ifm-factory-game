import { Injectable } from '@angular/core';
import { Machine } from '../models/machine/machine';
import { Package } from '../models/package/package';
import { Product } from '../models/product/product';
import { Rect } from './ui/rect.interface';
import { loadTheme } from './ui/theme.manager';
import { CanvasHelper } from './ui/canvas.helper';
import { ItemPopupDrawer } from './ui/item-popup.drawer';
import { MachinePopupDrawer } from './ui/machine-popup.drawer';

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

  // State management for drawn elements that need clearing
  private machinePopups: Rect[] = [];
  private itemPopups: Rect[] = [];
  private neededItemPopups: Rect[] = [];
  private producingPopups: Rect[] = [];

  constructor() {}

  /**
   * Initializes the UIService with the canvas context and other required resources.
   * This must be called before any drawing operations can be performed.
   * @param ctxUI The 2D rendering context for the UI canvas.
   * @param angle The isometric projection angle of the game world.
   * @param images A dictionary of pre-loaded image assets.
   */
  public init(ctxUI: CanvasRenderingContext2D, angle: number, images: { [key: string]: HTMLImageElement }): void {
    this.ctxUI = ctxUI;
    this.angle = angle;
    this.images = images;
    
    // Load the theme and initialize drawer classes
    loadTheme();
    this.itemPopupDrawer = new ItemPopupDrawer(this.ctxUI, this.images, this.angle);
    this.machinePopupDrawer = new MachinePopupDrawer(this.ctxUI, this.images, this.angle);
  }

  // ==========================================================================
  // --- Popup Drawing Methods (Delegation) ---
  // ==========================================================================

  /** Draws a popup for a product or package on the ground. */
  public drawItemPopup(item: Product | Package): void {
    this.clearItemPopup();
    this.itemPopups = this.itemPopupDrawer.draw(item);
  }

  /** Clears the currently visible item popup. */
  public clearItemPopup(): void {
    this.itemPopups.forEach(rect => CanvasHelper.clearRectRounded(this.ctxUI, rect, rect.radius ?? 10, true));
    this.itemPopups = [];
  }

  /** Draws the detailed information popup for a machine. */
  public drawMachinePopUp(machine: Machine): void {
    this.clearMachinePopUp();
    this.machinePopups = this.machinePopupDrawer.drawDetails(machine);
  }

  /** Clears the currently visible machine detail popup. */
  public clearMachinePopUp(): void {
    this.machinePopups.forEach(popUp => CanvasHelper.clearRectRounded(this.ctxUI, popUp, popUp.radius ?? 10, true));
    this.machinePopups = [];
  }

  /** Draws indicators for items needed by machines. */
  public drawMachineNeedsPopup(machines: Machine[]): void {
    this.neededItemPopups.forEach(rect => CanvasHelper.clearRectRounded(this.ctxUI, rect, rect.radius ?? 10, true));
    this.neededItemPopups = [];
    this.neededItemPopups = this.machinePopupDrawer.drawNeeds(machines);
  }

  /** Draws progress rings for machines that are currently producing. */
  public drawMachineProducingPopup(machines: Machine[]): void {
    this.producingPopups.forEach(rect => CanvasHelper.clearRectRounded(this.ctxUI, rect, rect.radius ?? 100, true));
    this.producingPopups = [];
    this.producingPopups = this.machinePopupDrawer.drawProductionProgress(machines);
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