import { Product } from "../models/product/product";

export interface InventoryItem{
    product: Product;
    quantity: number;
}

export interface Inventory {
    maxSlots: number;
    items: InventoryItem[];
    carriedItem: Product | null;
}