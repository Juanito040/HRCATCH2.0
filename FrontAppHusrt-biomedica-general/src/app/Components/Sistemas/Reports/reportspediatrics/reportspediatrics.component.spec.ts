import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportspediatricsComponent } from './reportspediatrics.component';

describe('ReportspediatricsComponent', () => {
  let component: ReportspediatricsComponent;
  let fixture: ComponentFixture<ReportspediatricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportspediatricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportspediatricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
