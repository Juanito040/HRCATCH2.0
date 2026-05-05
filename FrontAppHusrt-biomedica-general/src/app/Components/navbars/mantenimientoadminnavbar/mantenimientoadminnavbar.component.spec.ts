import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoadminnavbarComponent } from './mantenimientoadminnavbar.component';

describe('MantenimientoadminnavbarComponent', () => {
  let component: MantenimientoadminnavbarComponent;
  let fixture: ComponentFixture<MantenimientoadminnavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoadminnavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoadminnavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
