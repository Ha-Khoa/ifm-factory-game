import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import {Player} from '../../interfaces/ui/player';

@Component({
  selector: 'app-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.css'
})
export class HudComponent implements OnInit {
  player: Player | null = null;
  playerScore: number = 0;
  playerMoney: number = 0;
  playerName: string = "Benjamin"; // irgendein Name kann später durch DB geändert werden

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadPlayer();
  }

  loadPlayer() {
    this.api.getPlayer(this.playerName).subscribe({
      next: (data: Player) => {
        this.player = data;
        console.log("Player geladen:", this.player);
        this.playerScore = data.score;
        this.playerMoney = data.money;
      },
      error: (err) => {
        console.error("Fehler beim Laden des Players:", err);
      }
    });
  }

  addPlayerScore(score: number) {
    this.playerScore += score;
    this.api.updateScore(this.playerName, this.playerScore).subscribe({
      next: () => {
        console.log("Score aktualisiert!");
      },
      error: (err) => {
        console.error("Fehler beim Aktualisieren:", err);
      }
    });
  }

  addPlayerMoney(amount: number) {
    this.api.addMoney(this.playerName, amount).subscribe({
      next: () => {
        this.playerMoney += amount;
        console.log("Geld hinzugefügt!");
      },
      error: (err) => {
        console.error("Fehler:", err);
      }
    });
  }
}
