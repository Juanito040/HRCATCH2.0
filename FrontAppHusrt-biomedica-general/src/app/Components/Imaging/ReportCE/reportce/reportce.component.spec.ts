import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportceComponent } from './reportce.component';

describe('ReportceComponent', () => {
  let component: ReportceComponent;
  let fixture: ComponentFixture<ReportceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
