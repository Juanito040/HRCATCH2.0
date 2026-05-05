import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemaforizacionComponent } from './semaforizacion.component';

describe('SemaforizacionComponent', () => {
  let component: SemaforizacionComponent;
  let fixture: ComponentFixture<SemaforizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemaforizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemaforizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
