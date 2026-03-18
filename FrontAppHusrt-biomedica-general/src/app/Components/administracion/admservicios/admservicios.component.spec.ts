import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmserviciosComponent } from './admservicios.component';

describe('AdmserviciosComponent', () => {
  let component: AdmserviciosComponent;
  let fixture: ComponentFixture<AdmserviciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmserviciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmserviciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
