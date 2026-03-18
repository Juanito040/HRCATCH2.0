import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidadorQRComponent } from './validador-qr.component';

describe('ValidadorQRComponent', () => {
  let component: ValidadorQRComponent;
  let fixture: ComponentFixture<ValidadorQRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidadorQRComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidadorQRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
