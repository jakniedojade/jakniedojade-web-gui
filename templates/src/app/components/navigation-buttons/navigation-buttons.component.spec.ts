import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationButtonsComponent } from './navigation-buttons.component';

describe('NavigationButtonsComponent', () => {
  let component: NavigationButtonsComponent;
  let fixture: ComponentFixture<NavigationButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationButtonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
