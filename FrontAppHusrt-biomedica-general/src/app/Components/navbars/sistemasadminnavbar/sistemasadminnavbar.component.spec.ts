import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SistemasadminnavbarComponent } from './sistemasadminnavbar.component';

describe('SistemasadminnavbarComponent', () => {
  let component: SistemasadminnavbarComponent;
  let fixture: ComponentFixture<SistemasadminnavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SistemasadminnavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SistemasadminnavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
