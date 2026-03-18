import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasificacionInventarioComponent } from './clasificacion-inventario.component';

describe('ClasificacionInventarioComponent', () => {
  let component: ClasificacionInventarioComponent;
  let fixture: ComponentFixture<ClasificacionInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClasificacionInventarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClasificacionInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
