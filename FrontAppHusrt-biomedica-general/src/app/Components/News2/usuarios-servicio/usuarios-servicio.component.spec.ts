import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosServicioComponent } from './usuarios-servicio.component';

describe('UsuariosServicioComponent', () => {
  let component: UsuariosServicioComponent;
  let fixture: ComponentFixture<UsuariosServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosServicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
