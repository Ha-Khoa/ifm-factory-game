import { Component, HostListener } from '@angular/core'
import { Orders } from '../../models/orders/orders';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-order',
  imports: [NgClass],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent {
  activeOrders = Orders.getActiveOrders();
  state = '';

  @HostListener('window:keydown', ['$event']) // später durch richtige taste ersetzen
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'o') {
      if (this.state == '') {
        this.state = 'hidden';
        return;
      }
      else {
        this.state = '';
        return;
      }
    }
  }
}
