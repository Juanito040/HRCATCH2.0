import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasificacionTipoEquipoComponent } from './clasificacion-tipo-equipo.component';

describe('ClasificacionTipoEquipoComponent', () => {
  let component: ClasificacionTipoEquipoComponent;
  let fixture: ComponentFixture<ClasificacionTipoEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClasificacionTipoEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClasificacionTipoEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
