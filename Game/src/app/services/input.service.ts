
import { Injectable } from '@angular/core';

export interface PlayerInput {
  horizontal: number;
  vertical: number;
  interact: boolean;
  boost: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InputService {
  private player1Input: PlayerInput = { horizontal: 0, vertical: 0, interact: false, boost: false };
  private player2Input: PlayerInput = { horizontal: 0, vertical: 0, interact: false, boost: false };

  public keyboardState: Record<string, boolean> = {};
  private gamepads: (Gamepad | null)[] = [];
  private isPolling = false;
  private lastGamepadLogTime = 0;

  constructor() {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      console.log('Gamepad connected at index %d: %s.', e.gamepad.index, e.gamepad.id);
      this.gamepads[e.gamepad.index] = e.gamepad;
    });

    window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
      console.log('Gamepad disconnected from index %d: %s', e.gamepad.index, e.gamepad.id);
      this.gamepads[e.gamepad.index] = null;
    });
  }

  public start() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    if (!this.isPolling) {
      this.isPolling = true;
      this.poll();
    }
  }

  public stop() {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    this.isPolling = false;
  }

  private handleKeyDown(event: KeyboardEvent) {
    this.keyboardState[event.key.toLowerCase()] = true;
  }

  private handleKeyUp(event: KeyboardEvent) {
    this.keyboardState[event.key.toLowerCase()] = false;
  }

  private poll() {
    if (!this.isPolling) return;
    this.pollGamepads();
    this.processInputs();
    requestAnimationFrame(() => this.poll());
  }

  private pollGamepads() {
    const gps = navigator.getGamepads();
    for (let i = 0; i < gps.length; i++) {
      if (gps[i]) {
        this.gamepads[i] = gps[i];
      }
    }
  }

  private processInputs() {
    // Player 1
    let p1Horizontal = (this.keyboardState['d'] ? 1 : 0) - (this.keyboardState['a'] ? 1 : 0);
    let p1Vertical = (this.keyboardState['s'] ? 1 : 0) - (this.keyboardState['w'] ? 1 : 0);
    let p1Interact = this.keyboardState['e'] || false;
    let p1Boost = this.keyboardState[' '] || false;

    const gamepad1 = this.gamepads[0];
    if (gamepad1) {
      const now = performance.now();
      if (now - this.lastGamepadLogTime > 500) { // Throttle logging to every 500ms
        const pressedButtons = gamepad1.buttons
          .map((button, index) => ({ index, pressed: button.pressed }))
          .filter(b => b.pressed);

        const axesToLog = gamepad1.axes
            .map((axis, index) => ({ index, value: axis }))
            .filter(a => Math.abs(a.value) >= 0.1);

        if (axesToLog.length > 0) {
            console.log('Axes:');
            axesToLog.forEach(a => {
                console.log(`  Axis ${a.index}: ${a.value.toFixed(2)}`);
            });
        }
        if (pressedButtons.length > 0) {
          console.log('Pressed Buttons:', pressedButtons.map(b => b.index));
        }
        this.lastGamepadLogTime = now;
      }

      const deadzone = 0.2;
      const axis0 = gamepad1.axes[0];
      const axis1 = gamepad1.axes[1];
      if (Math.abs(axis0) > deadzone) p1Horizontal = axis0;
      if (Math.abs(axis1) > deadzone) p1Vertical = axis1;
      p1Interact = p1Interact || gamepad1.buttons[0].pressed; // 'A' button
      p1Boost = p1Boost || gamepad1.buttons[2].pressed; // 'X' button
    }

    this.player1Input = { horizontal: p1Horizontal, vertical: p1Vertical, interact: p1Interact, boost: p1Boost };

    // Player 2
    let p2Horizontal = (this.keyboardState['arrowright'] ? 1 : 0) - (this.keyboardState['arrowleft'] ? 1 : 0);
    let p2Vertical = (this.keyboardState['arrowdown'] ? 1 : 0) - (this.keyboardState['arrowup'] ? 1 : 0);
    let p2Interact = this.keyboardState['enter'] || false;
    let p2Boost = this.keyboardState['shift'] || false;

    const gamepad2 = this.gamepads[1];
    if (gamepad2) {
      const deadzone = 0.2;
      const axis0 = gamepad2.axes[0];
      const axis1 = gamepad2.axes[1];
      if (Math.abs(axis0) > deadzone) p2Horizontal = axis0;
      if (Math.abs(axis1) > deadzone) p2Vertical = axis1;
      p2Interact = p2Interact || gamepad2.buttons[0].pressed; // 'A' button
      p2Boost = p2Boost || gamepad2.buttons[2].pressed; // 'X' button
    }

    this.player2Input = { horizontal: p2Horizontal, vertical: p2Vertical, interact: p2Interact, boost: p2Boost };
  }

  public getPlayerInput(playerIndex: number): PlayerInput {
    return playerIndex === 0 ? this.player1Input : this.player2Input;
  }
}
