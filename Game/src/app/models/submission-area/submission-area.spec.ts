import { SubmissionArea } from './submission-area';
import { Coordinates } from '../coordinates/coordinates';
import { PlayerService } from '../../services/player.service';

describe('SubmissionArea', () => {
  it('should create an instance', () => {
    const playerService = jasmine.createSpyObj('PlayerService', ['method']);
    expect(new SubmissionArea(new Coordinates(0, 0), 10, 10, playerService)).toBeTruthy();
  });
});
