import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoleRealscheduleSettingsComponent } from './pole-realschedule-settings.component';

describe('PoleRealscheduleSettingsComponent', () => {
  let component: PoleRealscheduleSettingsComponent;
  let fixture: ComponentFixture<PoleRealscheduleSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoleRealscheduleSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoleRealscheduleSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
