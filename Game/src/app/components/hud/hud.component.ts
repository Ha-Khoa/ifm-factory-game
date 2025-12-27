import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ApiService} from '../../services/api.service';
import {PlayerInterface} from '../../interfaces/ui/playerInterface';
import {Observable} from 'rxjs';
import {PlayerService} from '../../services/player.service';

@Component({
  selector: 'app-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.css'
})
export class HudComponent implements OnInit {
  player$: Observable<PlayerInterface | null>;

  constructor(
    private api: ApiService,
    private hudState: PlayerService
  ) {
    this.player$ = this.hudState.player$
  }

  ngOnInit() {
    this.api.getPlayer('Player1').subscribe({
      next:(player) => {
      this.hudState.setPlayer(player);
      },
      error: () => {
        this.api.createPlayer('Player1').subscribe(player => this.hudState.setPlayer(player));
      }
    });
  }
}
