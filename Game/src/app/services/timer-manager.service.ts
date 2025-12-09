import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerManagerService {
  private timeoutId: number | null = null;
  private isRunningFlag: boolean = false;

  async start(delayMs: number): Promise<void> {
    if (this.isRunningFlag) {
      this.cancel();
    }

    this.isRunningFlag = true;

    return new Promise<void>((resolve) => {
      this.timeoutId = window.setTimeout(() => {
        this.timeoutId = null;
        this.isRunningFlag = false;
        resolve();
      }, delayMs);
    });
  }

  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      this.isRunningFlag = false;
    }
  }

  isRunning(): boolean {
    return this.isRunningFlag;
  }
}