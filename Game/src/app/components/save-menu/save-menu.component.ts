import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PlayerService } from '../../services/player.service';
import { PlayerInterface } from '../../interfaces/ui/playerInterface';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-save-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './save-menu.component.html',
  styleUrls: ['./../settings/settings-general.component.css', './save-menu.component.css']
})
export class SaveMenuComponent implements OnInit {
  @Output() closeSaveMenuRequest = new EventEmitter<void>();
  isClosing = false;

  players$!: Observable<PlayerInterface[]>;
  newPlayerName = '';

  constructor(private apiService: ApiService, private playerService: PlayerService) {
  }

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.players$ = this.apiService.getPlayers();
  }

  createNewPlayer(): void {
    if (this.newPlayerName.trim()) {
      this.apiService.createPlayer(this.newPlayerName).subscribe(() => {
        this.loadPlayers();
        this.newPlayerName = '';
      });
    }
  }

  deletePlayer(identifier: string): void {
    this.apiService.deletePlayer(identifier).subscribe(() => {
      this.loadPlayers();
    });
  }

  switchPlayer(player: PlayerInterface): void {
    this.playerService.setPlayer(player);
    this.closeSaveMenu();
  }


  closeSaveMenu(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.closeSaveMenuRequest.emit();
    }, 300);
  }
}
