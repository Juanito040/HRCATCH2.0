import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposServicioComponent } from './equipos-servicio.component';

describe('EquiposServicioComponent', () => {
  let component: EquiposServicioComponent;
  let fixture: ComponentFixture<EquiposServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquiposServicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquiposServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
