// Service Klasse, die Anfragen ans backend macht um zb Score etc zu holen und updaten.. Kann erweitert werden später

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5077/api/Game';

  constructor(private http: HttpClient) { }

  // Holt den Score für einen Spieler (Name oder ID)
  getScore(identifier: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/Score/${identifier}`);
  }

  // Holt das Geld
  getMoney(identifier: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/Money/${identifier}`);
  }
  
  // Erstellt einen Spieler (falls noch nicht da)
  createPlayer(username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/Player/${username}`, {});
  }

  updateScore(identifier: string, newScore: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Score/${identifier}/${newScore}`, {});
  }
}