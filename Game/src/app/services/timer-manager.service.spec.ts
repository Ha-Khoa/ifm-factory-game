import { TestBed } from '@angular/core/testing';

import { TimerManagerService } from './timer-manager.service';

describe('TimerManagerService', () => {
  let service: TimerManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
