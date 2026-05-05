import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeusersistemasComponent } from './homeusersistemas.component';

describe('HomeusersistemasComponent', () => {
  let component: HomeusersistemasComponent;
  let fixture: ComponentFixture<HomeusersistemasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeusersistemasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeusersistemasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
