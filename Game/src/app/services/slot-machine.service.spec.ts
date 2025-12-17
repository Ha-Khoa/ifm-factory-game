import { TestBed } from '@angular/core/testing';

import { SlotMachineService } from './slot-machine.service';

describe('SlotMachineService', () => {
  let service: SlotMachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotMachineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
