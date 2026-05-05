import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeintranetComponent } from './homeintranet.component';

describe('HomeintranetComponent', () => {
  let component: HomeintranetComponent;
  let fixture: ComponentFixture<HomeintranetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeintranetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeintranetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
