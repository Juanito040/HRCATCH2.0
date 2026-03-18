import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeuserbiomedicaComponent } from './homeuserbiomedica.component';

describe('HomeuserbiomedicaComponent', () => {
  let component: HomeuserbiomedicaComponent;
  let fixture: ComponentFixture<HomeuserbiomedicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeuserbiomedicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeuserbiomedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
