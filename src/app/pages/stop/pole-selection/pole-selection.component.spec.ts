import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoleSelectionComponent } from './pole-selection.component';

describe('PoleSelectionComponent', () => {
  let component: PoleSelectionComponent;
  let fixture: ComponentFixture<PoleSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoleSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoleSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
