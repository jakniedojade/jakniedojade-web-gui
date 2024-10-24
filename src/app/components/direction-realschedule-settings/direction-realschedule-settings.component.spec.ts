import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectionRealscheduleSettingsComponent } from './direction-realschedule-settings.component';

describe('DirectionRealscheduleSettingsComponent', () => {
  let component: DirectionRealscheduleSettingsComponent;
  let fixture: ComponentFixture<DirectionRealscheduleSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectionRealscheduleSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectionRealscheduleSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
