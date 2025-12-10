import { TestBed } from '@angular/core/testing';

import { ParticleRenderingService } from './particle-rendering.service';

describe('ParticleRenderingService', () => {
  let service: ParticleRenderingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParticleRenderingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
