import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminnavbarComponent } from './superadminnavbar.component';

describe('SuperadminnavbarComponent', () => {
  let component: SuperadminnavbarComponent;
  let fixture: ComponentFixture<SuperadminnavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperadminnavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperadminnavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
