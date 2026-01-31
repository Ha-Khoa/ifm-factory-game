import { GameService } from '../game.service';
import { CanvasHelper } from './canvas.helper';
import { UI_THEME } from './theme.manager';

// Definiert die Struktur für einen einzelnen Steuerungshinweis.
interface ControlHint {
  key: string; // Der Name der Taste/des Buttons, der gezeichnet werden soll.
  text: string; // Der Text, der neben dem Icon angezeigt wird.
}

// Definiert die Layouts für verschiedene Eingabegeräte.
const controlLayouts: { [inputType: string]: { [state: string]: ControlHint[] } } = {
  keyboard: {
    default: [
      { key: 'P', text: 'Pause' },
      { key: 'Space', text: 'Sprinten' },
      { key: 'E', text: 'Interact'}
    ],
  },
  gamepad: {
    default: [
      { key: 'Start', text: 'Pause' },
      { key: 'B', text: 'Sprinten' },
      { key: 'Y', text: 'Interact'}
    ],
  },
};

export class ControlsDrawer {
  /**
   * @param ctx The canvas rendering context.
   * @param images A map of loaded image elements (wird für Kompatibilität beibehalten).
   */
  constructor(
    private ctx: CanvasRenderingContext2D,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private images: { [key: string]: HTMLImageElement },
  ) {}

  /**
   * Zeichnet die Steuerungshinweise auf dem Canvas, basierend auf dem aktuellen Eingabegerät.
   */
  public draw() {
    this.ctx.save();

    const inputType = GameService.gamePad ? 'gamepad' : 'keyboard';
    const hintsToDraw = controlLayouts[inputType]['default'];

    const keySize = 40;
    const padding = 10;
    const margin = 20;
    const hintSpacing = 25;

    let currentX = this.ctx.canvas.width - margin;
    const yPos = this.ctx.canvas.height - margin - 5;

    this.ctx.font = `20px ${UI_THEME.fontFamily}`;
    this.ctx.fillStyle = UI_THEME.white;
    this.ctx.shadowColor = UI_THEME.black;
    this.ctx.shadowBlur = 5;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    for (const hint of hintsToDraw) {
      const drawnWidth = this.drawHint(hint, currentX, yPos, keySize, padding);
      currentX -= drawnWidth + hintSpacing;
    }

    this.ctx.restore();
  }

  /**
   * Zeichnet einen einzelnen Steuerungshinweis und gibt seine Breite zurück.
   */
  private drawHint(hint: ControlHint, x: number, y: number, keySize: number, padding: number): number {
    const hintTextWidth = this.ctx.measureText(hint.text).width;
    const keyHeight = keySize;
    const keyText = hint.key;
    let keyWidth: number;

    if (keyText.length === 1) {
      keyWidth = keyHeight;
    } else {
      const oldFont = this.ctx.font;
      const keyFontSize = keyHeight * (keyText.length > 2 ? 0.35 : 0.5);
      this.ctx.font = `bold ${keyFontSize}px ${UI_THEME.fontFamily}`;
      keyWidth = this.ctx.measureText(keyText).width + 20; // Innenabstand für die Taste
      this.ctx.font = oldFont;
    }

    const keyX = x - hintTextWidth - padding - keyWidth;
    const keyY = y - keyHeight / 2;

    CanvasHelper.drawKey(this.ctx, keyText, keyX, keyY, keyWidth, keyHeight);
    this.ctx.fillText(hint.text, x, y);

    return hintTextWidth + padding + keyWidth;
  }
}
