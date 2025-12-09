import { Component, HostListener, OnDestroy, OnInit } from '@angular/core'
import { Orders } from '../../models/orders/orders';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { Order } from '../../interfaces/order';

@Component({
  selector: 'app-order',
  imports: [NgClass],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit, OnDestroy {
  activeOrders: Order[] = [];
  state = '';
  private ordersSubscription!: Subscription;

  ngOnInit(): void {
    this.ordersSubscription = Orders.activeOrders$.subscribe(orders => {
      this.activeOrders = orders;
    });
  }

  ngOnDestroy(): void {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  @HostListener('window:keydown', ['$event'])
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
