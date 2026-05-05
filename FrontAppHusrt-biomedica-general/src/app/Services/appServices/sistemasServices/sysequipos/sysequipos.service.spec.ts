import { TestBed } from '@angular/core/testing';

import { SysequiposService } from './sysequipos.service';

describe('SysequiposService', () => {
  let service: SysequiposService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SysequiposService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
