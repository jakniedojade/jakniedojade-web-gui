import { TestBed } from '@angular/core/testing';

import { LinesOnPoleService } from './lines-on-pole.service';

describe('LinesOnPoleService', () => {
  let service: LinesOnPoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinesOnPoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
