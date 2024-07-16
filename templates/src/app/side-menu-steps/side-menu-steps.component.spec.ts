import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SideMenuStepsComponent } from './side-menu-steps.component';

describe('SideMenuStepsComponent', () => {
  let component: SideMenuStepsComponent;
  let fixture: ComponentFixture<SideMenuStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideMenuStepsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SideMenuStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
