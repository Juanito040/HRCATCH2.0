import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasificacionServicioComponent } from './clasificacion-servicio.component';

describe('ClasificacionServicioComponent', () => {
  let component: ClasificacionServicioComponent;
  let fixture: ComponentFixture<ClasificacionServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClasificacionServicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClasificacionServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
