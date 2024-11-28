import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekdaysSelectionComponent } from './weekdays-selection.component';

describe('WeekdaysSelectionComponent', () => {
  let component: WeekdaysSelectionComponent;
  let fixture: ComponentFixture<WeekdaysSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekdaysSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeekdaysSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
