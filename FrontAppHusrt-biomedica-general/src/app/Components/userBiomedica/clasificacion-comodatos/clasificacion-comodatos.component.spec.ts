import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasificacionComodatosComponent } from './clasificacion-comodatos.component';

describe('ClasificacionComodatosComponent', () => {
  let component: ClasificacionComodatosComponent;
  let fixture: ComponentFixture<ClasificacionComodatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClasificacionComodatosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClasificacionComodatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
