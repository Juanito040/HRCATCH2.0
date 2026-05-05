import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeadminmesaserviciosComponent } from './homeadminmesaservicios.component';

describe('HomeadminmesaserviciosComponent', () => {
  let component: HomeadminmesaserviciosComponent;
  let fixture: ComponentFixture<HomeadminmesaserviciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeadminmesaserviciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeadminmesaserviciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
