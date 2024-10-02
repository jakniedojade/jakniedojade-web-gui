import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-navigation-buttons',
  standalone: true,
  imports: [MatButton],
  templateUrl: './navigation-buttons.component.html',
  styleUrl: './navigation-buttons.component.scss'
})
export class NavigationButtonsComponent {
  @Input() nextDisabled: boolean = true;

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  onPrevious() {
    this.previous.emit();
  }

  onNext() {
    this.next.emit();
  }
}
