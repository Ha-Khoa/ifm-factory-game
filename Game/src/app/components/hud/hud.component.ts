import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PlayerInterface} from '../../interfaces/ui/playerInterface';
import {Observable} from 'rxjs';
import {PlayerService} from '../../services/player.service';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.css'
})
export class HudComponent implements OnInit {
  player$: Observable<PlayerInterface | null>;
  public isVisible = true;

  constructor(
    private hudState: PlayerService,
    private gameService: GameService
  ) {
    this.player$ = this.hudState.player$
  }

  ngOnInit(): void {
    this.gameService.gameOver$.subscribe(() => {
      this.isVisible = false;
    });
  }
}
