import { TestBed } from '@angular/core/testing';

import { UistateService } from './uistate.service';

describe('UistateService', () => {
  let service: UistateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UistateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
