// Service Klasse, die Anfragen ans backend macht um zb Score etc zu holen und updaten.. Kann erweitert werden später

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {PlayerInterface} from '../interfaces/ui/playerInterface';
import {Machine} from '../interfaces/ui/machine';
import {Factory} from '../interfaces/ui/factory';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5077/api/Game';

  constructor(private http: HttpClient) { }

  // Player Management
  getPlayers(): Observable<PlayerInterface[]> {
    return this.http.get<PlayerInterface[]>(`${this.baseUrl}/Players`);
  }

  getPlayer(identifier: string): Observable<PlayerInterface> {
    return this.http.get<PlayerInterface>(`${this.baseUrl}/Player/${identifier}`);
  }

  createPlayer(username: string): Observable<PlayerInterface> {
    return this.http.post<PlayerInterface>(`${this.baseUrl}/Player/${username}`, {});
  }

  deletePlayer(identifier: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Player/${identifier}`);
  }

  // Score Management
  getScore(identifier: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/Score/${identifier}`);
  }

  updateScore(identifier: string, newScore: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Score/${identifier}/${newScore}`, {});
  }

  addScore(identifier: string, amount: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Score/${identifier}/Add/${amount}`, {}, {responseType: 'text'});
  }

  removeScore(identifier: string, amount: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Score/${identifier}/Remove/${amount}`, {}, {responseType: 'text'});
  }

  // Money Management
  getMoney(identifier: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/Money/${identifier}`);
  }

  setMoney(identifier: string, value: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Money/${identifier}/${value}`, {});
  }

  addMoney(identifier: string, value: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Money/${identifier}/Add/${value}`, {}, {responseType: 'text'});
  }

  removeMoney(identifier: string, value: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Money/${identifier}/Remove/${value}`, {}, {responseType: 'text'});
  }

  // Machine Management
  getMachine(factoryId: number, machineId: number): Observable<Machine> {
    return this.http.get<Machine>(`${this.baseUrl}/Machine/${factoryId}/${machineId}`);
  }

  upgradeMachine(factoryId: number, machineId: number, level: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Machine/${factoryId}/${machineId}/${level}`, {});
  }

  // Factory Management
  getFactory(factoryId: number): Observable<Factory> {
    return this.http.get<Factory>(`${this.baseUrl}/Factory/${factoryId}`);
  }
}
