import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Orders } from '../../models/orders/orders';
import { Products } from '../../models/product/products';
import { Product } from '../../models/product/product';
import {Observable, Subscription} from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { PlayerInterface } from '../../interfaces/ui/playerInterface';

@Component({
  selector: 'app-debug-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './debug-menu.component.html',
  styleUrls: ['./../settings/settings-general.component.css','./debug-menu.component.css']
})
export class DebugMenuComponent implements OnInit, OnDestroy {
  @Output() closeDebugMenuRequest = new EventEmitter<void>();
  isClosing = false;

  playerMoney = 0;
  playerScore = 0;
  player$: Observable<PlayerInterface | null>;
  private playerSubscription: Subscription | undefined;

  // Custom order
  products: Product[] = [];
  selectedProductId: number = 1;
  quantity: number = 1;

  constructor(private playerService: PlayerService) {
    this.player$ = this.playerService.player$;
  }

  ngOnInit() {
    this.products = Products.getAllProducts();
    this.playerSubscription = this.player$.subscribe(player => {
      if (player) {
        this.playerMoney = player.money;
        this.playerScore = player.score;
      }
    });
  }

  ngOnDestroy() {
    this.playerSubscription?.unsubscribe();
  }

  closeDebugMenu() {
    this.isClosing = true;

    // Zeit warten, damit CSS Animation ablaufen kann
    setTimeout(() => {
      this.closeDebugMenuRequest.emit();
    }, 300);
  }

  setMoney() {
    this.playerService.setMoney(this.playerMoney);
  }

  setScore() {
    this.playerService.setScore(this.playerScore);
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
