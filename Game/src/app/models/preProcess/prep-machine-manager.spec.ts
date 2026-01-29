import { PrepMachineManager } from './prep-machine-manager';
import { Gamefield } from '../gamefield/gamefield';
describe('PrepMachineManager', () => {
  it('should create an instance', () => {
    const gamefield = new Gamefield();
    expect(new PrepMachineManager(gamefield)).toBeTruthy();
  });
});
