import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Orders } from '../../models/orders/orders';
import { Products } from '../../models/product/products';
import { Product } from '../../models/product/product';

@Component({
  selector: 'app-debug-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './debug-menu.component.html',
  styleUrls: ['./debug-menu.component.css']
})
export class DebugMenuComponent implements OnInit {
  playerMoney = 0;
  playerScore = 0;
  playerName = 'Benjamin'; // Hardcoded player name

  // Custom order
  products: Product[] = [];
  selectedProductId: number = 1;
  quantity: number = 1;
  reward: number = 10;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.products = Products.getAllProducts();
  }

  setMoney() {
    this.api.setMoney(this.playerName, this.playerMoney).subscribe({
      next: () => console.log('Money updated'),
      error: (err) => console.error('Error updating money', err)
    });
  }

  setScore() {
    this.api.updateScore(this.playerName, this.playerScore).subscribe({
      next: () => console.log('Score updated'),
      error: (err) => console.error('Error updating score', err)
    });
  }

  createRandomOrder() {
    Orders.generateRandomOrders();
    console.log('Random order created');
  }

  createCustomOrder() {
    const items = [{ productId: Number(this.selectedProductId), quantity: this.quantity }];
    Orders.addOrder(items, this.reward);
    console.log('Custom order created');
  }

  completeAllOrders() {
    Orders.completeAllOrders();
    console.log('All orders completed');
  }
}
