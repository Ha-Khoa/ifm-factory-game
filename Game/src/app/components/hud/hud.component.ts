import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service'; 

@Component({
  selector: 'app-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.css'
})
export class HudComponent implements OnInit {
  money: number = 0;
  score: number = 0;
  playerName: string = "Benjamin"; // irgendein Name kann später durch DB geändert werden

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    // 1. Erstmal versuchen den Spieler zu erstellen (falls die DB leer ist)
    this.api.createPlayer(this.playerName).subscribe({
      next: () => console.log("Spieler gefunden!"),
      error: (err) => console.log("Spieler existiert schon oder DB Fehler", err),
      complete: () => this.loadStats() // laden der stats
    });
  }

  loadStats() {
    // 2. Geld holen
    this.api.getMoney(this.playerName).subscribe(val => this.money = val);
    // 3. Score holen
    this.api.getScore(this.playerName).subscribe(val => this.score = val);
  }
  addScore() {
  const newScore = this.score + 1;
  this.score = newScore;

  this.api.updateScore(this.playerName, newScore).subscribe({
    next: () => {
      console.log("Score gespeichert");
      this.loadStats(); // Score aus db holen
    },
    error: (err) => console.error("Fehler beim Speichern:", err)
  });
  }
}