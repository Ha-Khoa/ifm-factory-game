import { Order, OrderItem } from '../../interfaces/order';
import {Products} from '../product/products';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {Product} from '../product/product';


export class Orders {
  /**
   * Represents the maximum order ID currently available or processed.
   * This variable is typically used to track the highest numerical
   * identifier for orders in the system to ensure uniqueness when
   * creating new order IDs.
   *
   * Variable may be updated as new orders are added.
   *
   * @type {number}
   */
  private static maxOderId: number = 0;


  /**
   * A BehaviorSubject that represents the current list of orders.
   *
   * ordersList$ emits the latest state of the orders as an array of Order objects.
   * Subscribers to this subject will receive the most recent state
   * immediately upon subscription, followed by any subsequent updates.
   *
   * Typically, this is used to maintain and observe a reactive stream of orders
   * in an application where states are updated dynamically.
   */
  private static ordersList$: BehaviorSubject<Order[]> = new BehaviorSubject<Order[]>([]);

  /**
   * An Observable stream that emits a filtered list of active orders.
   * The stream derives its data from `ordersList$` and contains only
   * the orders where the status is considered active (i.e., the `status`
   * property evaluates to a falsy value).
   *
   * This can be used to monitor and work with the subset of orders that
   * are currently active in the system.
   *
   * @type {Observable<Order[]>}
   */
  public static activeOrders$: Observable<Order[]> = this.ordersList$.pipe(
      map(orders => orders.filter(order => !order.status))
  );

  /**
   * Initializes a predefined list of orders with specific items and quantities.
   * Each order is created using the `createOrder` method and is initially marked with a `status` of `false`.
   * The orders are then emitted to the `ordersList$` observable.
   *
   * @return {void} Does not return anything. The method updates the `ordersList$` observable with the new orders.
   */
  public static initializeOrders(): void {
    const initialOrders: Order[] = [
      { ...this.createOrder([{id: 1, quantity: 1}]), status: false },
      { ...this.createOrder([{id: 2, quantity: 1}, {id: 3, quantity: 1}]), status: false },
      { ...this.createOrder([{id: 5, quantity: 2}]), status: false },
      { ...this.createOrder([{id: 4, quantity: 1}, {id: 5, quantity: 1}]), status: false },
      { ...this.createOrder([{id: 6, quantity: 1}]), status: false },
      { ...this.createOrder([{id: 4, quantity: 1}, {id: 5, quantity: 1}, {id: 6, quantity: 1}]), status: false }
    ];
    this.ordersList$.next(initialOrders);
  }

  /**
   * Creates a new order using the specified item specifications.
   *
   * @param {Array<{id: number, quantity: number}>} itemSpecs - An array of objects representing the items to be included in the order,
   * each containing a product ID and the desired quantity.
   * @return {Order} The newly created order object, including item details, calculated totals, and an assigned order ID.
   */
  private static createOrder(
    itemSpecs: Array<{id: number, quantity: number}>
  ) : Order {
    const items = itemSpecs.map(spec => ({
      product: Products.getProductById(spec.id)!,
      quantity: spec.quantity
    }));

    const totals = this.calculateOrderTotals(items);

    let id = this.getNextOrderId();
    return { status: false , id: id, items: items, ...totals,};
  }

  /**
   * Generates and returns the next unique order ID by incrementing the current maximum order ID.
   *
   * @return {number} The next unique order ID.
   */
  private static getNextOrderId(): number {
    this.maxOderId += 1;
    return this.maxOderId;
  }

  /**
   * Calculates the total rewards, grants, and costs for a list of order items.
   *
   * @param {Array<{product: Product, quantity: number}>} items - An array of order items, where each item contains a product and the corresponding quantity.
   * @return {{reward: number, grants: number, costs: number}} An object containing the aggregated totals for rewards, grants, and costs across all items in the order.
   */
  private static calculateOrderTotals(items: Array<{product: Product, quantity: number}>): { reward: number; grants: number; costs: number } {
    return items.reduce((prd, item) => ({
      reward: prd.reward + item.product.reward * item.quantity,
      grants: prd.grants + item.product.grants * item.quantity,
      costs: prd.costs + item.product.costs * item.quantity,
    }), { reward: 0, grants: 0, costs: 0 });
  }

    /**
     * Retrieves a list of active orders from the current orders list.
     *
     * Active orders are determined by filtering out orders that have a defined status.
     *
     * @return {Order[]} An array of active orders.
     */
    static getActiveOrders(): Order[] {
        return this.ordersList$.getValue().filter(order => !order.status);
    }

    /**
     * Marks an order as complete by updating its status to true.
     *
     * @param {number} orderId - The unique identifier of the order to complete.
     * @return {boolean} Returns true if the order was successfully completed, otherwise false.
     */
    static completeOrder(orderId: number): boolean {
        const order =  this.ordersList$.getValue().find(order => !order.status && order.id === orderId);

        if (order) {
            order.status = true;
            this.ordersList$.next([...this.ordersList$.getValue()]);
            return true;
        }

        return false;
    }

    /**
     * Marks all orders in the current orders list as completed by setting their status to true.
     * Updates the orders list after modifying the statuses.
     *
     * @return {void} Does not return a value.
     */
    static completeAllOrders(): void {
      const currentOrders = this.ordersList$.getValue();
      currentOrders.forEach(order => {
        if (!order.status) {
          order.status = true;
        }
      });
      this.ordersList$.next([...currentOrders]);
    }

    /**
     * Retrieves an order by its unique identifier.
     *
     * @param {number} id - The unique identifier of the order to retrieve.
     * @return {Order | undefined} The order object if found, or undefined if no order is found with the given id.
     */
    static getOrderById(id: number): Order | undefined {
        return this.ordersList$.getValue().find(order => order.id === id);
    }

    /**
     * Adds a new order to the orders list based on the provided items.
     * Each item must include a product ID and quantity.
     * Throws an error if a product with the given ID is not found.
     *
     * @param {Array<{productId: number, quantity: number}>} items - Array of objects representing the products and their quantities to be ordered.
     * @return {Order} The newly created order.
     */
    static addOrder(items: {productId: number, quantity: number}[]): Order {
        const newOrderItems: OrderItem[] = [];

        for (const item of items) {
            const product = Products.getProductById(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            newOrderItems.push({product: product, quantity: item.quantity});
        }
        const newOrder: Order = {
            ...this.createOrder(newOrderItems.map(item => ({id: item.product.id, quantity: item.quantity}))),
            status: false
        };
        this.ordersList$.next([...this.ordersList$.getValue(), newOrder]);
        return newOrder;
    }


    /**
     * Generates a random order by selecting a random number of products
     * with random quantities and ensures no duplicate products are included.
     *
     * @return {Order} The newly created order with randomly selected products and quantities.
     */
    static generateRandomOrder(): Order {
        const productCount = Math.floor(Math.random() * 3) + 1;
        const items= [];

        for (let i = 0; i < productCount; i++) {
            const randomProductId = Products.getRandomProductId();
            const randomQuantity = Math.floor(Math.random() * 3) + 1;
            if(!items.map(product => (product.productId === randomProductId)).includes(true)) {
              items.push({productId: randomProductId, quantity: randomQuantity});
            }
        }

        return Orders.addOrder(items);
    }

    // Wir können diese Methode verwenden, wenn wir die Spielerprogression (Niveau) implementieren
    // static generateProgressiveOrder(playerLevel: number) {
//     if (playerLevel === 1) {
//         return Orders.addOrder(
//             [{ productId: 2, quantity: 2 }],
//             50
//.            ...
//         );
//.
//     } else if (playerLevel === 2) {
//         return Orders.addOrder(
//             [
//                 { productId: 2, quantity: 2 },
//                 { productId: 3, quantity: 1 }
//             ],
//             100
//             ...
//         );
//     } else {
//         return Orders.addOrder(
//             [
//                 { productId: 2, quantity: 1 },
//                 { productId: 3, quantity: 1 },
//                 { productId: 4, quantity: 1 }
//             ],
//             200
//         );
//     }
// }

    //maybe using generateRandomOrders to create progressive orders based on player level

}

