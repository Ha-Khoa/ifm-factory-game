import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ApiService} from './api.service';
import {PlayerInterface} from '../interfaces/ui/playerInterface';


@Injectable({ providedIn: 'root' })
export class PlayerService {
  private playerSubject = new BehaviorSubject<PlayerInterface | null>(null);
  player$ = this.playerSubject.asObservable();

  constructor(private api: ApiService) {
  }

  get player(): PlayerInterface | null {
    return this.playerSubject.value;
  }

  setPlayer(player: PlayerInterface) {
    this.playerSubject.next(player);
  }

  getScore(): number {
    return this.player?.score ?? 0;
  }

  addScore(amount: number) {
    if (!this.player) return;

    this.api.addScore(this.player.name, amount).subscribe({
      next: (score:number) => {
        this.playerSubject.next({
          ...this.player!,
          score
        });
      },
      error: console.error
    });
  }
  removeScore(amount: number) {
    if (!this.player) return;

    this.api.removeScore(this.player.name, amount).subscribe({
      next: (score:number) => {
        this.playerSubject.next({
          ...this.player!,
          score
        });
      },
      error: console.error
    });
  }

  getMoney(): number {
    return this.player?.money ?? 0;
  }

  addMoney(amount: number) {
    if (!this.player) return;

    this.api.addMoney(this.player.name, amount).subscribe({
      next: (money:number) => {
        this.playerSubject.next({
          ...this.player!,
          money
        })
      },
      error: console.error
    })
  }

  removeMoney(amount: number): boolean {
    if (!this.player) return false;
    if (this.player.money < amount) {
      return false;
    }

    this.api.removeMoney(this.player.name, amount).subscribe({
        next: (money:number) => {
        this.playerSubject.next({
          ...this.player!,
          money
        })
      },
        error: (error) => {
          console.error(error);
        }
    });
    return true;
  }

  setMoney(amount: number) {
    if (!this.player) return;

    this.api.setMoney(this.player.name, amount).subscribe({
      next: (money: number) => {
        this.playerSubject.next({
          ...this.player!,
          money
        });
      },
      error: console.error
    });
  }

  setScore(amount: number) {
    if (!this.player) return;

    this.api.updateScore(this.player.name, amount).subscribe({
      next: (score: number) => {
        this.playerSubject.next({
          ...this.player!,
          score
        });
      },
      error: console.error
    });
  }

}
