import {Component, Output, EventEmitter, ViewChild} from '@angular/core';
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
  @Output() closeSettingsRequest = new EventEmitter<void>();
  isClosing = false;

  @ViewChild(DebugMenuComponent) debugMenu?: DebugMenuComponent;
  showDebugMenu = false;

  handleDebugMenu(): void {
    if(this.showDebugMenu) this.debugMenu?.closeDebugMenu();
    else this.showDebugMenu = true;
  }

  closeSettingsMenu(): void {
    this.isClosing = true;

    console.log("Closing settings menu");
    // Zeit warten, damit CSS Animation ablaufen kann
    setTimeout(() => {
      console.log("Closing settings menu done");

      this.closeSettingsRequest.emit();
    }, 300);
  }
}
