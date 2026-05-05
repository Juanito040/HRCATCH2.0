import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearHojavidaComponent } from './crear-hojavida.component';

describe('CrearHojavidaComponent', () => {
  let component: CrearHojavidaComponent;
  let fixture: ComponentFixture<CrearHojavidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearHojavidaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearHojavidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
