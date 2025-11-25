import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  @Output() closeSettings = new EventEmitter<void>();

  close(): void {
    this.closeSettings.emit();
  }
}
