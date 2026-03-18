import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmtiposequipoComponent } from './admtiposequipo.component';

describe('AdmtiposequipoComponent', () => {
  let component: AdmtiposequipoComponent;
  let fixture: ComponentFixture<AdmtiposequipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmtiposequipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmtiposequipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
