import { TestBed } from '@angular/core/testing';

import { News2Service } from './news2.service';

describe('News2Service', () => {
  let service: News2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(News2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
