import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeadminbiomedicaComponent } from './homeadminbiomedica.component';

describe('HomeadminbiomedicaComponent', () => {
  let component: HomeadminbiomedicaComponent;
  let fixture: ComponentFixture<HomeadminbiomedicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeadminbiomedicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeadminbiomedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
