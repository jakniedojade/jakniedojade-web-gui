import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectionSelectionComponent } from './direction-selection.component';

describe('DirectionSelectionComponent', () => {
  let component: DirectionSelectionComponent;
  let fixture: ComponentFixture<DirectionSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectionSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectionSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
