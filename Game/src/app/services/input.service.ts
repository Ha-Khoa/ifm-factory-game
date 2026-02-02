
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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

  private inputState: 'game' | 'menu' | 'tutorial' = 'menu';

  private menuUpSubject = new Subject<void>();
  public menuUp$ = this.menuUpSubject.asObservable();

  private menuDownSubject = new Subject<void>();
  public menuDown$ = this.menuDownSubject.asObservable();

  private menuLeftSubject = new Subject<void>();
  public menuLeft$ = this.menuLeftSubject.asObservable();

  private menuRightSubject = new Subject<void>();
  public menuRight$ = this.menuRightSubject.asObservable();

  private menuConfirmSubject = new Subject<void>();
  public menuConfirm$ = this.menuConfirmSubject.asObservable();

  private tutorialNextSubject = new Subject<void>();
  public tutorialNext$ = this.tutorialNextSubject.asObservable();

  private tutorialPrevSubject = new Subject<void>();
  public tutorialPrev$ = this.tutorialPrevSubject.asObservable();

  private tutorialCloseSubject = new Subject<void>();
  public tutorialClose$ = this.tutorialCloseSubject.asObservable();

  private pauseSubject = new Subject<void>();
  public pause$ = this.pauseSubject.asObservable();

  private upgradeSubject = new Subject<number>();
  public upgrade$ = this.upgradeSubject.asObservable();

  private menuUpHeldTime = 0;
  private menuDownHeldTime = 0;
  private menuLeftHeldTime = 0;
  private menuRightHeldTime = 0;
  private lastMenuConfirm = false;

  private lastTutorialNext = false;
  private lastTutorialPrev = false;
  private lastTutorialClose = false;
  private lastPause = false;

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

  public setInputState(state: 'game' | 'menu' | 'tutorial') {
    this.inputState = state;
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

  private processPauseInput() {
    let pause = this.keyboardState['p'];

    for (const gamepad of this.gamepads) {
      if (gamepad && gamepad.buttons[9].pressed) {
        pause = true;
        break;
      }
    }

    if (pause && !this.lastPause) {
      this.pauseSubject.next();
    }
    this.lastPause = !!pause;
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
    this.processPauseInput();
    if (this.inputState === 'menu') {
      this.processMenuInputs();
    } else if (this.inputState === 'tutorial') {
      this.processTutorialInputs();
    } else {
      this.processGameInputs();
    }
  }

    private processTutorialInputs() {
    // Reset game inputs
    this.player1Input = { horizontal: 0, vertical: 0, interact: false, boost: false };
    this.player2Input = { horizontal: 0, vertical: 0, interact: false, boost: false };

    let tutorialNext = this.keyboardState['d'] || this.keyboardState['arrowright'];
    let tutorialPrev = this.keyboardState['a'] || this.keyboardState['arrowleft'];
    let tutorialClose = this.keyboardState['e'] || this.keyboardState['escape'] || this.keyboardState['enter'];

    const gamepad1 = this.gamepads[0];
    if (gamepad1) {
      const deadzone = 0.5;
      const axisX = gamepad1.axes[0];
      tutorialNext = tutorialNext || gamepad1.buttons[15].pressed || axisX > deadzone;
      tutorialPrev = tutorialPrev || gamepad1.buttons[14].pressed || axisX < -deadzone;
      tutorialClose = tutorialClose || gamepad1.buttons[0].pressed || gamepad1.buttons[1].pressed;
    }

    if (tutorialNext && !this.lastTutorialNext) this.tutorialNextSubject.next();
    if (tutorialPrev && !this.lastTutorialPrev) this.tutorialPrevSubject.next();
    if (tutorialClose && !this.lastTutorialClose) this.tutorialCloseSubject.next();

    this.lastTutorialNext = tutorialNext;
    this.lastTutorialPrev = tutorialPrev;
    this.lastTutorialClose = tutorialClose;
  }

  private processMenuInputs() {
    // Reset game inputs
    this.player1Input = { horizontal: 0, vertical: 0, interact: false, boost: false };
    this.player2Input = { horizontal: 0, vertical: 0, interact: false, boost: false };

    // --- Get current state from devices ---
    let menuUp = this.keyboardState['w'] || this.keyboardState['arrowup'];
    let menuDown = this.keyboardState['s'] || this.keyboardState['arrowdown'];
    let menuLeft = this.keyboardState['a'] || this.keyboardState['arrowleft'];
    let menuRight = this.keyboardState['d'] || this.keyboardState['arrowright'];
    let menuConfirm = this.keyboardState['e'] || this.keyboardState['enter'];

    const gamepad1 = this.gamepads[0];
    if (gamepad1) {
      const deadzone = 0.5;
      const axisY = gamepad1.axes[1];
      const axisX = gamepad1.axes[0];
      menuUp = menuUp  || axisY < -deadzone;
      menuDown = menuDown || axisY > deadzone;
      menuLeft = menuLeft || axisX < -deadzone;
      menuRight = menuRight || axisX > deadzone;
      menuConfirm = menuConfirm || gamepad1.buttons[3].pressed; // 'Y' button
    }

    // --- Process directional inputs with hold-to-repeat logic ---
    const initialDelay = 20; // Frames to wait before repeating (~333ms at 60fps)
    const repeatInterval = 6;  // Frames between repeats (~100ms at 60fps)

    // Up
    if (menuUp) this.menuUpHeldTime++; else this.menuUpHeldTime = 0;
    if (this.menuUpHeldTime > 0) {
        if (this.menuUpHeldTime === 1 || (this.menuUpHeldTime > initialDelay && (this.menuUpHeldTime - initialDelay) % repeatInterval === 0)) {
            this.menuUpSubject.next();
        }
    }

    // Down
    if (menuDown) this.menuDownHeldTime++; else this.menuDownHeldTime = 0;
    if (this.menuDownHeldTime > 0) {
        if (this.menuDownHeldTime === 1 || (this.menuDownHeldTime > initialDelay && (this.menuDownHeldTime - initialDelay) % repeatInterval === 0)) {
            this.menuDownSubject.next();
        }
    }

    // Left
    if (menuLeft) this.menuLeftHeldTime++; else this.menuLeftHeldTime = 0;
    if (this.menuLeftHeldTime > 0) {
        if (this.menuLeftHeldTime === 1 || (this.menuLeftHeldTime > initialDelay && (this.menuLeftHeldTime - initialDelay) % repeatInterval === 0)) {
            this.menuLeftSubject.next();
        }
    }

    // Right
    if (menuRight) this.menuRightHeldTime++; else this.menuRightHeldTime = 0;
    if (this.menuRightHeldTime > 0) {
        if (this.menuRightHeldTime === 1 || (this.menuRightHeldTime > initialDelay && (this.menuRightHeldTime - initialDelay) % repeatInterval === 0)) {
            this.menuRightSubject.next();
        }
    }

    // --- Process confirm (no repeat) ---
    if (menuConfirm && !this.lastMenuConfirm) this.menuConfirmSubject.next();
    this.lastMenuConfirm = menuConfirm;
  }

  private processGameInputs() {
    // Player 1
    let p1Horizontal = (this.keyboardState['d'] ? 1 : 0) - (this.keyboardState['a'] ? 1 : 0);
    let p1Vertical = (this.keyboardState['s'] ? 1 : 0) - (this.keyboardState['w'] ? 1 : 0);
    let p1Interact = this.keyboardState['e'] || false;
    let p1Boost = this.keyboardState[' '] || false;
    const p1Upgrade = this.keyboardState['u'] || false;

    const gamepad1 = this.gamepads[0];
    if (gamepad1) {

      const deadzone = 0.2;
      const axis0 = gamepad1.axes[0];
      const axis1 = gamepad1.axes[1];
      if (Math.abs(axis0) > deadzone) p1Horizontal = axis0;
      if (Math.abs(axis1) > deadzone) p1Vertical = axis1;
      p1Interact = p1Interact || gamepad1.buttons[3].pressed; // Y
      p1Boost = p1Boost || gamepad1.buttons[2].pressed; // B

      if (gamepad1.buttons[1].pressed) {  // A
        this.upgradeSubject.next(0);
      }
    }

    if (p1Upgrade) {
      this.upgradeSubject.next(0);
    }

    this.player1Input = { horizontal: p1Horizontal, vertical: p1Vertical, interact: p1Interact, boost: p1Boost };

    // Player 2
    let p2Horizontal = (this.keyboardState['arrowright'] ? 1 : 0) - (this.keyboardState['arrowleft'] ? 1 : 0);
    let p2Vertical = (this.keyboardState['arrowdown'] ? 1 : 0) - (this.keyboardState['arrowup'] ? 1 : 0);
    let p2Interact = this.keyboardState['enter'] || false;
    let p2Boost = this.keyboardState['shift'] || false;
    const p2Upgrade = this.keyboardState['numpad0'] || false; // Assuming a different key for P2 upgrade

    const gamepad2 = this.gamepads[1];
    if (gamepad2) {
      const deadzone = 0.2;
      const axis0 = gamepad2.axes[0];
      const axis1 = gamepad2.axes[1];
      if (Math.abs(axis0) > deadzone) p2Horizontal = axis0;
      if (Math.abs(axis1) > deadzone) p2Vertical = axis1;
      p2Interact = p2Interact || gamepad2.buttons[3].pressed; // 'Y' button
      p2Boost = p2Boost || gamepad2.buttons[2].pressed; // 'B' button
      if (gamepad2.buttons[1].pressed) { // 'A' button
        this.upgradeSubject.next(1);
      }
    }

    if (p2Upgrade) {
      this.upgradeSubject.next(1);
    }

    this.player2Input = { horizontal: p2Horizontal, vertical: p2Vertical, interact: p2Interact, boost: p2Boost };
  }

  public getPlayerInput(playerIndex: number): PlayerInput {
    return playerIndex === 0 ? this.player1Input : this.player2Input;
  }
}
