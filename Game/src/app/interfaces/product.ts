import { Coordinates } from '../models/coordinates/coordinates';

export interface Product {
    id: number;
    name: string;
    position?: Coordinates;
    ingredients: string[];
    productionTime: number;
    price: number;
}