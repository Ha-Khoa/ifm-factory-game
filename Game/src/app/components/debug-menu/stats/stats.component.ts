import { Component, OnDestroy, OnInit } from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../../services/player.service';
import { PlayerInterface } from '../../../interfaces/ui/playerInterface';
import { RenderingService } from '../../../services/rendering.service';


@Component({
  selector: 'app-stats',
  imports: [FormsModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./../../settings/settings-general.component.css', './stats.component.css', '../debug-menu.component.css']
})
export class StatsComponent implements OnInit, OnDestroy{

  gameFov = 2.5;

  playerMoney = 0;
  playerScore = 0;

  player$: Observable<PlayerInterface | null>;
  private playerSubscription: Subscription | undefined;

  constructor(private playerService: PlayerService,) {
    this.player$ = this.playerService.player$;
  }

  ngOnInit() {
    this.playerSubscription = this.player$.subscribe(player => {
      if (player) {
        this.playerMoney = player.money;
        this.playerScore = player.score;
      }
    });
    this.gameFov = RenderingService.instance().gameFov
  }

  ngOnDestroy() {
    this.playerSubscription?.unsubscribe();
  }

  setMoney() {
    this.playerService.setMoney(this.playerMoney);
  }

  setScore() {
    this.playerService.setScore(this.playerScore);
  }

  setGameFov() {
    RenderingService.instance().gameFov = this.gameFov
  }


}
