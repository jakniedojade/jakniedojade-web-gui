import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrongRouteScreenComponent } from './wrong-route-screen.component';

describe('WrongRouteScreenComponent', () => {
  let component: WrongRouteScreenComponent;
  let fixture: ComponentFixture<WrongRouteScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrongRouteScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrongRouteScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
