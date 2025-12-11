import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugMenuComponent } from '../debug-menu/debug-menu.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, DebugMenuComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./../settings/settings-general.component.css','./settings.component.css']
})
export class SettingsComponent {
  @Output() closeSettings = new EventEmitter<void>();
  showDebugMenu = false;

  close(): void {
    this.closeSettings.emit();
  }
}
