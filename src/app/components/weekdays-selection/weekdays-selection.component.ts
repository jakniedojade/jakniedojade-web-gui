import { Component, model, OnInit, output, signal } from '@angular/core';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, Subject, takeUntil, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MeanlatencyChildComponents } from '../../pages/line/direction-meanlatency-settings/direction-meanlatency-settings.component';

export interface Weekdays {
  mondays: boolean;
  tuesdays: boolean;
  wednesdays: boolean;
  thursdays: boolean;
  fridays: boolean;
  saturdays: boolean;
  sundays: boolean;
  holidays: boolean;
}

export const regularWeekdays: Weekdays = {
  mondays: true,
  tuesdays: true,
  wednesdays: true,
  thursdays: true,
  fridays: true,
  saturdays: false,
  sundays: false,
  holidays: false
}

export const saturdaysAndHolidays: Weekdays = {
  mondays: false,
  tuesdays: false,
  wednesdays: false,
  thursdays: false,
  fridays: false,
  saturdays: true,
  sundays: true,
  holidays: true
}

export const noWeekdaySelected: Weekdays = {
  mondays: false,
  tuesdays: false,
  wednesdays: false,
  thursdays: false,
  fridays: false,
  saturdays: false,
  sundays: false,
  holidays: false
}

@Component({
  selector: 'app-weekdays-selection',
  imports: [NavigationButtonsComponent, MatButtonToggleModule, MatChipsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './weekdays-selection.component.html',
  styleUrl: './weekdays-selection.component.scss'
})
export class WeekdaysSelectionComponent implements OnInit {
  selectSettings = output<MeanlatencyChildComponents>();

  toggleControl = new FormControl('');
  
  chipControl = new FormGroup({
    mondays: new FormControl(false),
    tuesdays: new FormControl(false),
    wednesdays: new FormControl(false),
    thursdays: new FormControl(false),
    fridays: new FormControl(false),
    saturdays: new FormControl(false),
    sundays: new FormControl(false),
    holidays: new FormControl(false)
  });

  private destroy$ = new Subject<void>();

  weekdaysState = model<Weekdays>();

  ngOnInit(): void {
    this.chipControl.patchValue(this.weekdaysState() as Weekdays);
    this.updateToggles();
  }

  constructor() {
    this.toggleControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(value => {
        if (value === 'regular') {
          this.chipControl.setValue(regularWeekdays);
        } else if (value === 'holidays') {
          this.chipControl.setValue(saturdaysAndHolidays);
        } else if (value === 'custom') {
          if (JSON.stringify(this.chipControl.value) === JSON.stringify(regularWeekdays) || JSON.stringify(this.chipControl.value) === JSON.stringify(saturdaysAndHolidays)) {
            this.chipControl.setValue(noWeekdaySelected);
          }
        }
      })
    ).subscribe();
    this.toggleControl.setValue('regular');
  }

  private $nextDisabled = this.chipControl.valueChanges.pipe(
    map(value => {
      return JSON.stringify(value) === JSON.stringify(noWeekdaySelected)
    })
  ) 
  nextDisabled = toSignal(this.$nextDisabled);

  toggleChip(day: keyof Weekdays): void {
    const regularWeekdaysArray = ['mondays', 'tuesdays', 'wednesdays', 'thursdays', 'fridays'];
    const saturdaysAndHolidaysArray = ['saturdays', 'sundays', 'holidays'];
    const currentState = this.chipControl.value[day];

    if (regularWeekdaysArray.includes(day)) {
      this.chipControl.patchValue({
        ['saturdays']: false,
        ['sundays']: false,
        ['holidays']: false
      });
    } else if (saturdaysAndHolidaysArray.includes(day)) {
      this.chipControl.patchValue({
        ['mondays']: false,
        ['tuesdays']: false,
        ['wednesdays']: false,
        ['thursdays']: false,
        ['fridays']: false,
      })
    }
    this.chipControl.patchValue({
      [day]: !currentState
    });

    this.updateToggles();
  }

  private updateToggles(): void {
    if (JSON.stringify(this.chipControl.value) === JSON.stringify(regularWeekdays)) {
      this.toggleControl.setValue("regular");
    } else if (JSON.stringify(this.chipControl.value) === JSON.stringify(saturdaysAndHolidays)) {
      this.toggleControl.setValue("holidays");
    } else {
      this.toggleControl.setValue("custom");
    }
  }

  returnWeekdaysAndGoToSettings(): void {
    this.weekdaysState.set(this.chipControl.value as Weekdays);
    this.goToSettings();
  }

  goToSettings(): void {
    this.selectSettings.emit(MeanlatencyChildComponents.Settings);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
