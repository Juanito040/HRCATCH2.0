import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HojavidaComponent } from './hojavida.component';

describe('HojavidaComponent', () => {
  let component: HojavidaComponent;
  let fixture: ComponentFixture<HojavidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HojavidaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HojavidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
