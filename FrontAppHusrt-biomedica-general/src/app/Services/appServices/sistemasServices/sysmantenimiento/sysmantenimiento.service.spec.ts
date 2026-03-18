import { TestBed } from '@angular/core/testing';

import { SysmantenimientoService } from './sysmantenimiento.service';

describe('SysmantenimientoService', () => {
  let service: SysmantenimientoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SysmantenimientoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
