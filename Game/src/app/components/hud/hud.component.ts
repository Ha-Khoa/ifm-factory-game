import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
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
export class HudComponent {
  player$: Observable<PlayerInterface | null>;

  constructor(
    private hudState: PlayerService
  ) {
    this.player$ = this.hudState.player$
  }
}
