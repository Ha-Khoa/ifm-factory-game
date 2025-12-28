import { Component, OnInit } from '@angular/core';
import { Orders } from '../../../models/orders/orders';
import { Product } from '../../../models/product/product';
import { Products } from '../../../models/product/products';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./../../settings/settings-general.component.css', './orders.component.css', '../debug-menu.component.css']
})
export class OrdersComponent implements OnInit{

  // Custom order
  products: Product[] = [];
  selectedProductId: number = 1;
  quantity: number = 1;

  ngOnInit(): void {
    this.products = Products.getAllProducts();
  }

  createRandomOrder() {
    Orders.generateRandomOrder();
    console.log('Random order created');
  }

  createCustomOrder() {
    const items = [{ productId: Number(this.selectedProductId), quantity: this.quantity }];
    Orders.addOrder(items);
    console.log('Custom order created');
  }

  completeAllOrders() {
    Orders.completeAllOrders();
    console.log('All orders completed');
  }

}
