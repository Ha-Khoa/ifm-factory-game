import { Package } from './package';
import { Coordinates } from '../coordinates/coordinates';

describe('Package', () => {
  it('should create an instance', () => {
    expect(new Package(new Coordinates(0, 0))).toBeTruthy();
  });
});
