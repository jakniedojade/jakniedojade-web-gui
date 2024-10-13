import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {
  readonly dialog = inject(MatDialog);

  openErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { errorMessage: message }
    });
  }
}
