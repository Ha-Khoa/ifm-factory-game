import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ApiService} from '../../services/api.service';
import {HudStateService} from './HudStateService';
import {Player} from '../../interfaces/ui/player';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.css'
})
export class HudComponent implements OnInit {
  player$: Observable<Player | null>;

  constructor(
    private api: ApiService,
    private hudState: HudStateService
  ) {
    this.player$ = this.hudState.player$
  }

  ngOnInit() {
    this.api.getPlayer('Player1').subscribe(player => {
      this.hudState.setPlayer(player);
    });
  }
}
