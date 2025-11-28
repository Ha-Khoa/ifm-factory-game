import { ConveyorBelt } from './conveyor-belt';

describe('ConveyorBelt', () => {
  it('should create an instance', () => {
    expect(new ConveyorBelt(0, 0, 100, 10)).toBeTruthy();
  });
});
