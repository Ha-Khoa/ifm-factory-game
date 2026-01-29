import { PrepMachine } from './prep-machine';

describe('PrepMachine', () => {
  it('should create an instance', () => {
    expect(new PrepMachine(0, 0, 100, 100)).toBeTruthy();
  });
});
