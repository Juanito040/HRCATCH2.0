import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiomedicausernavbarComponent } from './biomedicausernavbar.component';

describe('BiomedicausernavbarComponent', () => {
  let component: BiomedicausernavbarComponent;
  let fixture: ComponentFixture<BiomedicausernavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiomedicausernavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiomedicausernavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
