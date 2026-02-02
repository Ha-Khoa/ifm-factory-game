import { Product } from '../models/product/product';

/**
 * Represents an item in an order.
 *
 * This interface defines the structure of an individual order item,
 * including the product details and the quantity ordered.
 *
 * Properties:
 * - `product`: The product associated with this order item, typically containing
 *   details such as name, price, and description.
 * - `quantity`: The number of units of the product ordered.
 */
export interface OrderItem{
    product: Product;
    quantity: number;
}

/**
 * Represents an order containing items, financial details, and status information.
 *
 * @interface Order
 * @property {number} id - Unique identifier for the order.
 * @property {OrderItem[]} items - List of items associated with the order.
 * @property {number} reward - The total rewards associated with the order.
 * @property {number} costs - The total costs incurred for the order.
 * an order.
 * @property {boolean} status - Indicates whether the order is active or processed.
 * @property {number} time - Time left for the Order to finish in ms
 * @property {number} initialTime - The initial time for the order in ms
 * @property {number} timeSeconds - Time left for the Order to finish in seconds
 */
export interface Order {
    id: number;
    items: OrderItem[];
    reward: number;
    costs: number;
    grants: number;
    status: boolean;
    time: number;
    initialTime: number;
    timeSeconds: number;
}
