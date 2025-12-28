import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsComponent } from './stats/stats.component';
import { OrdersComponent } from './orders/orders.component';

@Component({
  selector: 'app-debug-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, StatsComponent, OrdersComponent],
  templateUrl: './debug-menu.component.html',
  styleUrls: ['./../settings/settings-general.component.css','./debug-menu.component.css']
})
export class DebugMenuComponent{
  @Output() closeDebugMenuRequest = new EventEmitter<void>();
  isClosing = false;
  tab: 'stats' | 'orders' = 'stats';

  closeDebugMenu() {
    this.isClosing = true;
    // Zeit warten, damit CSS Animation ablaufen kann
    setTimeout(() => {
      this.closeDebugMenuRequest.emit();
    }, 300);
  }

  changeToStats() {
    this.tab = 'stats';
  }
  changeToOrders() {
    this.tab = 'orders';
  }

}
