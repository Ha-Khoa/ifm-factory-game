import { Order, OrderItem } from '../../interfaces/order';
import {Products} from '../product/products';


export class Orders {
    //einfach Bestellliste für das frühe Spiel, später können wir komplexere Bestellungen hinzufügen
    private static ordersList: Order[] = [
        {
            id: 1,
            items: [
                {product: Products.getProductById(1)!, quantity: 3}
            ],
            reward: 20,
            status: false
        },
        {
            id: 2,
            items: [
                {product: Products.getProductById(5)!, quantity: 1},
                {product: Products.getProductById(3)!, quantity: 2}
            ],
            reward: 40,
            status: false
        },
        {
            id: 3,
            items: [
                {product: Products.getProductById(6)!, quantity: 1},
                {product: Products.getProductById(2)!, quantity: 3}
            ],
            reward: 70,
            status: false
        },
        {
            id: 4,
            items: [
                {product: Products.getProductById(1)!, quantity: 1}],
                reward: 30,
                status: false
        },
        {
            id: 5,
            items: [
                {product: Products.getProductById(6)!, quantity: 1}
            ],
            reward: 60,
            status: false
        }
    ]
    static getActiveOrders(): Order[] {
        return this.ordersList.filter(order => order.status === false);
    }
    static completeOrder(orderId: number): boolean {
        const order =  this.ordersList.find(order => order.status === false && order.id === orderId);

        if (order) {
            order.status = true;
            return true;
        }

        return false;
    }

    static getOrderById(id: number): Order | undefined {
        return this.ordersList.find(order => order.id === id);
    }

    static addOrder(items: {productId: number, quantity: number}[], reward: number): Order {
        const newOrderItems: OrderItem[] = [];

        for (const item of items) {
            const product = Products.getProductById(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            newOrderItems.push({product: product, quantity: item.quantity});
        }
        const newOrder: Order = {
            id: this.ordersList.length + 1,
            items: newOrderItems,
            reward: reward,
            status: false
        };
        this.ordersList.push(newOrder);
        return newOrder;
    } 


    //Generiere eine zufällige Bestellung basierend auf dem aktuellen Spielfortschritt (je höher das Level, desto komplexer die Bestellung)
    static generateRandomOrders(): Order {
        const productCount = Math.floor(Math.random() * 3) + 1;
        const items= [];

        for (let i = 0; i < productCount; i++) {
            const randomProductId = Products.getRandomProductId();
            const randomQuantity = Math.floor(Math.random() * 3) + 1;
            items.push({productId: randomProductId, quantity: randomQuantity});
        }
        const reward = Products.calculateProductPrice(items);
        return Orders.addOrder(items, reward);

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
