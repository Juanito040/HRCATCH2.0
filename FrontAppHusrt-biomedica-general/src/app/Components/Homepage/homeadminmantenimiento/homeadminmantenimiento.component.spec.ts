import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeadminmantenimientoComponent } from './homeadminmantenimiento.component';

describe('HomeadminmantenimientoComponent', () => {
  let component: HomeadminmantenimientoComponent;
  let fixture: ComponentFixture<HomeadminmantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeadminmantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeadminmantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
