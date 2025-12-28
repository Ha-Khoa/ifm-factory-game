import {Component, Output, EventEmitter, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugMenuComponent } from '../debug-menu/debug-menu.component';
import { SaveMenuComponent } from '../save-menu/save-menu.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, DebugMenuComponent, SaveMenuComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./../settings/settings-general.component.css','./settings.component.css']
})
export class SettingsComponent {
  @Output() closeSettingsRequest = new EventEmitter<void>();
  isClosing = false;

  @ViewChild(DebugMenuComponent) debugMenu?: DebugMenuComponent;
  showDebugMenu = false;

  @ViewChild(SaveMenuComponent) saveMenu?: SaveMenuComponent;
  showSaveMenu = false;

  handleDebugMenu(): void {
    if(this.showDebugMenu) this.debugMenu?.closeDebugMenu();
    else this.showDebugMenu = true;
  }

  handleSaveMenu(): void {
    if(this.showSaveMenu) this.saveMenu?.closeSaveMenu();
    else this.showSaveMenu = true;
  }

  closeSettingsMenu(): void {
    this.isClosing = true;
    // Zeit warten, damit CSS Animation ablaufen kann
    setTimeout(() => {

      this.closeSettingsRequest.emit();
    }, 300);
  }
}
