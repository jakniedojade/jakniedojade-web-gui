import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectionMeanlatencyRouteSelectionComponent } from './direction-meanlatency-route-selection.component';

describe('DirectionMeanlatencyRouteSelectionComponent', () => {
  let component: DirectionMeanlatencyRouteSelectionComponent;
  let fixture: ComponentFixture<DirectionMeanlatencyRouteSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectionMeanlatencyRouteSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectionMeanlatencyRouteSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
