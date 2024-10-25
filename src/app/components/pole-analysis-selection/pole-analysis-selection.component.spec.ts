import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoleAnalysisSelectionComponent } from './pole-analysis-selection.component';

describe('PoleAnalysisSelectionComponent', () => {
  let component: PoleAnalysisSelectionComponent;
  let fixture: ComponentFixture<PoleAnalysisSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoleAnalysisSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoleAnalysisSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
