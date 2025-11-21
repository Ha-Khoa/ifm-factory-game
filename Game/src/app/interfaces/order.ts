import { Product } from './product';

export interface OrderItem{
    product: Product;
    quantity: number;
}
export interface Order {
    id: number;
    items: OrderItem[];
    reward: number;
    status: boolean;
}