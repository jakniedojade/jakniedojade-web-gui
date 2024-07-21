import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopSelectionComponent } from './stop-selection.component';

describe('StopSelectionComponent', () => {
  let component: StopSelectionComponent;
  let fixture: ComponentFixture<StopSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
