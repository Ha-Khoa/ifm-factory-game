import { Coordinates } from '../models/coordinates/coordinates';

export interface Product {
    id: number;
    name: string;
    position?: Coordinates;
    img?: string;
    ingredients?: string[];
    productionTime?: number;
    price?: number;
    //machine:  (von welche Maschine produziert wird) ?
}