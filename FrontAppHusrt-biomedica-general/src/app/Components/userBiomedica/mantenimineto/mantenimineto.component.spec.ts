import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManteniminetoComponent } from './mantenimineto.component';

describe('ManteniminetoComponent', () => {
  let component: ManteniminetoComponent;
  let fixture: ComponentFixture<ManteniminetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManteniminetoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManteniminetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
