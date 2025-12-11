import { SubmissionArea } from './submission-area';
import { Coordinates } from '../coordinates/coordinates';

describe('SubmissionArea', () => {
  it('should create an instance', () => {
    expect(new SubmissionArea(new Coordinates(0, 0), 10, 10)).toBeTruthy();
  });
});
