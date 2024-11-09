import { Component, output } from '@angular/core';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, Subject, takeUntil, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { MeanlatencyChildComponents } from '../direction-meanlatency-settings/direction-meanlatency-settings.component';

interface WeekdayFormValue {
  mondays: boolean;
  tuesdays: boolean;
  wednesdays: boolean;
  thursdays: boolean;
  fridays: boolean;
  saturdays: boolean;
  sundays: boolean;
}

@Component({
  selector: 'app-weekdays-selection',
  standalone: true,
  imports: [NavigationButtonsComponent, MatButtonToggleModule, MatChipsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './weekdays-selection.component.html',
  styleUrl: './weekdays-selection.component.scss'
})
export class WeekdaysSelectionComponent {
  selectSettings = output<MeanlatencyChildComponents>();

  toggleControl = new FormControl('custom');
  
  chipControl = new FormGroup({
    mondays: new FormControl(false),
    tuesdays: new FormControl(false),
    wednesdays: new FormControl(false),
    thursdays: new FormControl(false),
    fridays: new FormControl(false),
    saturdays: new FormControl(false),
    sundays: new FormControl(false)
  });

  regularWeekdays: WeekdayFormValue = {
    mondays: true,
    tuesdays: true,
    wednesdays: true,
    thursdays: true,
    fridays: true,
    saturdays: false,
    sundays: false
  }

  holidays: WeekdayFormValue = {
    mondays: false,
    tuesdays: false,
    wednesdays: false,
    thursdays: false,
    fridays: false,
    saturdays: true,
    sundays: true
  }

  noWeekdaySelected: WeekdayFormValue = {
    mondays: false,
    tuesdays: false,
    wednesdays: false,
    thursdays: false,
    fridays: false,
    saturdays: false,
    sundays: false
  }

  private destroy$ = new Subject<void>();

  constructor() {
    this.toggleControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(value => {
        if (value === 'regular') {
          this.chipControl.setValue(this.regularWeekdays);
        } else if (value === 'holidays') {
          this.chipControl.setValue(this.holidays);
        } else if (value === 'custom') {
          if (JSON.stringify(this.chipControl.value) === JSON.stringify(this.regularWeekdays) || JSON.stringify(this.chipControl.value) === JSON.stringify(this.holidays)) {
            this.chipControl.setValue(this.noWeekdaySelected);
          }
        }
      })
    ).subscribe();
  }

  private $nextDisabled = this.chipControl.valueChanges.pipe(
    map(value => {
      return JSON.stringify(value) === JSON.stringify(this.noWeekdaySelected)
    })
  ) 
  nextDisabled = toSignal(this.$nextDisabled);

  toggleChip(day: keyof WeekdayFormValue): void {
    const currentState = this.chipControl.value[day];
    this.chipControl.patchValue({
      [day]: !currentState
    });
    if (JSON.stringify(this.chipControl.value) === JSON.stringify(this.regularWeekdays)) {
      this.toggleControl.setValue("regular");
    } else if (JSON.stringify(this.chipControl.value) === JSON.stringify(this.holidays)) {
      this.toggleControl.setValue("holidays");
    } else {
      this.toggleControl.setValue("custom");
    }
  }

  goToSettings(): void {
    this.selectSettings.emit(MeanlatencyChildComponents.Settings);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
