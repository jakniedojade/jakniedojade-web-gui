import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectionMeanlatencySettingsComponent } from './direction-meanlatency-settings.component';

describe('DirectionMeanlatencySettingsComponent', () => {
  let component: DirectionMeanlatencySettingsComponent;
  let fixture: ComponentFixture<DirectionMeanlatencySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectionMeanlatencySettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectionMeanlatencySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
