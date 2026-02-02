import { UI_THEME } from '../../services/ui/theme.manager';
import { GameService } from '../../services/game.service';
import { PlayerInterface } from '../../interfaces/ui/playerInterface';

/**
 * Diese Klasse kapselt die gesamte Logik zum Zeichnen des Startbildschirms auf dem Canvas.
 */
export class StartScreenRenderer {
  // Button-Rechtecke für die Klickerkennung
  private buttonRect = { x: 0, y: 0, width: 0, height: 0 };
  private playerModeButtonRect = { x: 0, y: 0, width: 0, height: 0 };
  private controlsButtonRect = { x: 0, y: 0, width: 0, height: 0 };
  private tutorialButtonRect = { x: 0, y: 0, width: 0, height: 0 };

  constructor(
    private ctx: CanvasRenderingContext2D,
    private width: number,
    private height: number,
    private gameService: GameService,
  ) {}

  /**
   * Zeichnet einen kompletten Frame des Startbildschirms.
   * Dies ist die Haupt-Einstiegsmethode für das Rendern.
   */
  public drawFrame(
    time: number,
    backgroundVideo: HTMLVideoElement,
    onePlayerHighScores: PlayerInterface[],
    twoPlayerHighScores: PlayerInterface[],
    selectedButtonIndex: number
  ): void {
    const pulse = (Math.sin(time / 200) + 1) / 2;

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Video-Hintergrund zeichnen
    if (backgroundVideo.readyState >= 2) {
      this.ctx.drawImage(backgroundVideo, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    } else {
      this.ctx.fillStyle = "#050505";
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    // Overlay zum Abdunkeln
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.drawRetroGrid(time);
    this.drawScoreboards(onePlayerHighScores, twoPlayerHighScores);
    this.drawTitle(time);
    this.drawButtons(pulse, selectedButtonIndex);
  }

  /**
   * Prüft, ob ein Klick auf einen der Buttons stattgefunden hat.
   * @gibt den Index des geklickten Buttons (0-3) oder null zurück.
   */
  public getClickedButtonIndex(x: number, y: number): number | null {
    if (this.isPointInRect(x, y, this.buttonRect)) return 0;
    if (this.isPointInRect(x, y, this.playerModeButtonRect)) return 1;
    if (this.isPointInRect(x, y, this.tutorialButtonRect)) return 2;
    if (this.isPointInRect(x, y, this.controlsButtonRect)) return 3;
    return null;
  }

  /**
   * Zeichnet ein animiertes Retro-Gitter (Synthwave-Stil).
   */
  private drawRetroGrid(time: number): void {
    this.ctx.strokeStyle = "rgba(255, 102, 0, 0.2)";
    this.ctx.lineWidth = 2;
    const offset = (time / 40) % 60;

    for(let y = 0; y < this.height; y += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + offset);
      this.ctx.lineTo(this.width, y + offset);
      this.ctx.stroke();
    }
  }

  /**
   * Koordiniert das Zeichnen der beiden Highscore-Tafeln.
   */
  private drawScoreboards(onePlayerHighScores: PlayerInterface[], twoPlayerHighScores: PlayerInterface[]): void {
    const scoreboardWidth = 400;
    const padding = 50;
    const leftBoardX = padding;
    const rightBoardX = this.width - scoreboardWidth - padding;
    const boardY = 280;

    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = UI_THEME.secondary;
    this.ctx.fillStyle = UI_THEME.secondary;

    this.drawSingleScoreboard('1 SPIELER High Scores', onePlayerHighScores, leftBoardX, boardY, scoreboardWidth);
    this.drawSingleScoreboard('2 SPIELER High Scores', twoPlayerHighScores, rightBoardX, boardY, scoreboardWidth);

    this.ctx.shadowBlur = 0;
  }

  /**
   * Zeichnet eine einzelne Anzeigetafel.
   */
  private drawSingleScoreboard(title: string, highScores: PlayerInterface[], x: number, y: number, width: number): void {
    if (highScores.length === 0) return;

    const lineHeight = 40;
    const listY = y + lineHeight + 15;
    const padding = 10;
    const originalTextAlign = this.ctx.textAlign;

    this.ctx.font = `bold 32px "Courier New", monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, x + width / 2, y);

    this.ctx.font = `28px "Courier New", monospace`;
    this.ctx.fillStyle = "#eee";

    highScores.forEach((player, index) => {
      const scoreY = listY + index * lineHeight;
      if(index === 0) this.ctx.fillStyle = "#FFFF00";
      else this.ctx.fillStyle = "#fff";

      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${index + 1}.`, x, scoreY);
      this.ctx.textAlign = 'center';
      this.ctx.fillText(player.name, x + width / 2, scoreY);
      this.ctx.textAlign = 'right';
      this.ctx.fillText(player.score.toLocaleString(), x + width - padding, scoreY);
    });
    this.ctx.textAlign = originalTextAlign;
  }

  /**
   * Zeichnet den Spieltitel.
   */
  private drawTitle(time: number): void {
    const title = 's.FACTORY';
    const hue = (time / 20) % 360;
    this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    this.ctx.shadowColor = UI_THEME.secondary;
    this.ctx.shadowBlur = 30;

    this.ctx.font = `italic 900 100px "Courier New", monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const scale = 1 + Math.sin(time / 200) * 0.05;
    this.ctx.save();
    this.ctx.translate(this.ctx.canvas.width / 2, this.ctx.canvas.height / 4);
    this.ctx.scale(scale, scale);
    this.ctx.fillText(title, 0, 0);
    this.ctx.restore();

    this.ctx.shadowBlur = 0;
  }

  /**
   * Zeichnet das Hauptmenü.
   */
  private drawButtons(pulse: number, selectedButtonIndex: number): void {
    const buttonWidth = 350;
    const buttonHeight = 70;
    const buttonGap = 20;
    const buttonX = this.ctx.canvas.width / 2 - buttonWidth / 2;

    const totalHeight = (buttonHeight * 4) + (buttonGap * 3);
    const startY = (this.ctx.canvas.height - totalHeight) / 2 + 150;

    this.buttonRect = { x: buttonX, y: startY, width: buttonWidth, height: buttonHeight };
    this.playerModeButtonRect = { x: buttonX, y: startY + buttonHeight + buttonGap, width: buttonWidth, height: buttonHeight };
    this.tutorialButtonRect = { x: buttonX, y: startY + (buttonHeight + buttonGap) * 2, width: buttonWidth, height: buttonHeight };
    this.controlsButtonRect = { x: buttonX, y: startY + (buttonHeight + buttonGap) * 3, width: buttonWidth, height: buttonHeight };

    this.drawArcadeButton('STARTEN', this.buttonRect, selectedButtonIndex === 0);
    const playerModeText = this.gameService.twoPlayerMode ? '2 SPIELER' : '1 SPIELER';
    this.drawArcadeButton(playerModeText, this.playerModeButtonRect, selectedButtonIndex === 1);
    this.drawArcadeButton('TUTORIAL', this.tutorialButtonRect, selectedButtonIndex === 2);
    const controlModeText = GameService.gamePad ? 'ARCADE' : 'TASTATUR'
    this.drawArcadeButton(controlModeText, this.controlsButtonRect, selectedButtonIndex === 3);
  }

  /**
   * Hilfsfunktion zum Zeichnen eines einzelnen Buttons.
   */
  private drawArcadeButton(text: string, rect: { x: number, y: number, width: number, height: number }, isSelected: boolean): void {
    const scale = isSelected ? 1.1 : 1.0;
    const w = rect.width * scale;
    const h = rect.height * scale;
    const x = rect.x - (w - rect.width) / 2;
    const y = rect.y - (h - rect.height) / 2;

    this.ctx.fillStyle = isSelected ? "rgba(255, 102, 0, 0.25)" : "rgba(0, 0, 0, 0.8)";
    this.ctx.strokeStyle = isSelected ? UI_THEME.secondary : "#555";
    this.ctx.lineWidth = 4;

    if (isSelected) {
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = UI_THEME.secondary;
    } else {
      this.ctx.shadowBlur = 0;
    }

    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeRect(x, y, w, h);

    this.ctx.fillStyle = isSelected ? "#fff" : "#aaa";
    this.ctx.font = `bold 35px "Courier New", monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    if (isSelected && Math.floor(Date.now() / 100) % 2 === 0) {
      this.ctx.fillStyle = UI_THEME.secondary;
    }

    this.ctx.fillText(text, x + w / 2, y + h / 2);
    this.ctx.shadowBlur = 0;
  }

  /**
   * Prüft, ob ein Punkt innerhalb eines Rechtecks liegt.
   */
  private isPointInRect(x: number, y: number, rect: { x: number, y: number, width: number, height: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }
}
