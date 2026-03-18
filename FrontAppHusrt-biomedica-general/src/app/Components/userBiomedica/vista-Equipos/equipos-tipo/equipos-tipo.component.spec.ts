import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposTipoComponent } from './equipos-tipo.component';

describe('EquiposTipoComponent', () => {
  let component: EquiposTipoComponent;
  let fixture: ComponentFixture<EquiposTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquiposTipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquiposTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
