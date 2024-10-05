import { TestBed } from '@angular/core/testing';

import { PolesOnStopService } from './poles-on-stop.service';

describe('PolesOnStopService', () => {
  let service: PolesOnStopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolesOnStopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
