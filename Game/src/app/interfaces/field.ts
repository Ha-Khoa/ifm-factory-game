export interface Field {
    readonly fieldSize: number;
    readonly rows: number;  // Optional: Anzahl Zeilen als readonly-Property
  readonly cols: number;  // Optional: Anzahl Spalten als readonly-Property
  readonly grid: readonly number[][];
}
