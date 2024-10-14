import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoleAnalysisTypeSelectionComponent } from './pole-analysis-type-selection.component';

describe('PoleAnalysisTypeSelectionComponent', () => {
  let component: PoleAnalysisTypeSelectionComponent;
  let fixture: ComponentFixture<PoleAnalysisTypeSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoleAnalysisTypeSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoleAnalysisTypeSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
