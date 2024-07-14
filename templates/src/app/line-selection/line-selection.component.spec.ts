import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineSelectionComponent } from './line-selection.component';

describe('LineSelectionComponent', () => {
  let component: LineSelectionComponent;
  let fixture: ComponentFixture<LineSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
