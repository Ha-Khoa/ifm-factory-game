import { ConveyorBeltManager } from './conveyor-belt-manager';
import { Gamefield } from '../gamefield/gamefield';

describe('ConveyorBeltManager', () => {
  it('should create an instance', () => {
    expect(new ConveyorBeltManager(new Gamefield())).toBeTruthy();
  });
});
