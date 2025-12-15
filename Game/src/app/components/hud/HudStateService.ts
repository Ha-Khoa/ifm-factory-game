import {Injectable} from '@angular/core';
import {Player} from '../../interfaces/ui/player';
import {BehaviorSubject, tap} from 'rxjs';
import {ApiService} from '../../services/api.service';

@Injectable({ providedIn: 'root' })
export class HudStateService {
  private playerSubject = new BehaviorSubject<Player | null>(null);
  player$ = this.playerSubject.asObservable();

  constructor(private api: ApiService) {
  }

  get player(): Player | null {
    return this.playerSubject.value;
  }

  setPlayer(player: Player) {
    this.playerSubject.next(player);
  }

  getScore(): number {
    return this.player?.score ?? 0;
  }

  addScore(amount: number) {
    this.updateScore(this.getScore() + amount);
  }


  updateScore(score: number) {
    if (!this.player) return;

    this.api.updateScore(this.player.name, score).subscribe({
      next: () => {
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
    this.updateMoney(this.getMoney() + amount);
  }

  updateMoney(money: number) {
    if (!this.player) return;

    this.api.addMoney(this.player.name, money - this.player.money).subscribe({
      next: () => {
        this.playerSubject.next({
          ...this.player!,
          money
        });
      },
      error: console.error
    });
  }

}
