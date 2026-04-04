import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearMantenimientoComponent } from './reporte-mantenimiento.component';

describe('CrearMantenimientoComponent', () => {
  let component: CrearMantenimientoComponent;
  let fixture: ComponentFixture<CrearMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearMantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
