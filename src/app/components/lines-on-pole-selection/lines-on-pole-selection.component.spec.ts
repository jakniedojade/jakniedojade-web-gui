import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinesOnPoleSelectionComponent } from './lines-on-pole-selection.component';

describe('LinesOnPoleSelectionComponent', () => {
  let component: LinesOnPoleSelectionComponent;
  let fixture: ComponentFixture<LinesOnPoleSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinesOnPoleSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinesOnPoleSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
