import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealidadComponent } from './realidad.component';

describe('RealidadComponent', () => {
  let component: RealidadComponent;
  let fixture: ComponentFixture<RealidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
