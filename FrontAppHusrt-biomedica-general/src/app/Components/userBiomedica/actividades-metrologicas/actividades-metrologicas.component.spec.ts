import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActividadesMetrologicasComponent } from './actividades-metrologicas.component';

describe('ActividadesMetrologicasComponent', () => {
  let component: ActividadesMetrologicasComponent;
  let fixture: ComponentFixture<ActividadesMetrologicasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActividadesMetrologicasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActividadesMetrologicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
