import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MachineState {
  id: number;
  name: string;
  productionProgress: number;
  level: number;
  // weitere Statusinformationen
}

@Injectable({
  providedIn: 'root'
})
export class UistateService {

  private _machineState = new BehaviorSubject<MachineState | null>(null);

  public machineStates$: Observable<MachineState | null> = this._machineState.asObservable();

  constructor() { }

  setMachineState(machineState: MachineState | null) {
    this._machineState.next(machineState);
  }

  getMachineState(): MachineState | null {
    return this._machineState.value;
  }

  clearMachineState() {
    this._machineState.next(null);
  }
}
