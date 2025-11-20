
// Importiere die Machine-Klasse
import { Machine } from './machine';


// Teste die Machine-Klasse
describe('Machine', () => {
  it('should create an instance', () => {
    // Erstelle eine neue Machine mit Beispielkoordinaten
    expect(new Machine(1, 2, "machine", 10, "north", "product", {"resource": 5})).toBeTruthy();
  });
});
