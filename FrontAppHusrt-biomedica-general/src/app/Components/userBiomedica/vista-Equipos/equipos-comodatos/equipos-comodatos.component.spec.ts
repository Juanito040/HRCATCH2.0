import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposComodatosComponent } from './equipos-comodatos.component';

describe('EquiposComodatosComponent', () => {
  let component: EquiposComodatosComponent;
  let fixture: ComponentFixture<EquiposComodatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquiposComodatosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquiposComodatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
