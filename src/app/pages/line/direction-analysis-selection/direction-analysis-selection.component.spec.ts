import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectionAnalysisSelectionComponent } from './direction-analysis-selection.component';

describe('DirectionAnalysisSelectionComponent', () => {
  let component: DirectionAnalysisSelectionComponent;
  let fixture: ComponentFixture<DirectionAnalysisSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectionAnalysisSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectionAnalysisSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
