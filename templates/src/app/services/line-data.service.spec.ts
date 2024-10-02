import { TestBed } from '@angular/core/testing';

import { LineDataService } from './line-data.service';

describe('LineDataService', () => {
  let service: LineDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LineDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
