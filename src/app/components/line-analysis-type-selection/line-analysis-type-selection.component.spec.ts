import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineAnalysisTypeSelectionComponent } from './line-analysis-type-selection.component';

describe('LineAnalysisTypeSelectionComponent', () => {
  let component: LineAnalysisTypeSelectionComponent;
  let fixture: ComponentFixture<LineAnalysisTypeSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineAnalysisTypeSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineAnalysisTypeSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
