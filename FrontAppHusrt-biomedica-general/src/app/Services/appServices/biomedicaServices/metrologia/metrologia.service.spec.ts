import { TestBed } from '@angular/core/testing';

import { MetrologiaService } from './metrologia.service';

describe('MetrologiaService', () => {
  let service: MetrologiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetrologiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
