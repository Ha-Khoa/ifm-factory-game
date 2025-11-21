import {Product} from '../../interfaces/product';

export class Products {
    private static simple_productsList: Product[] =[
        {
            id: 1,
            name: "Raw Plastic",
            ingredients: [],
            productionTime: 2,
            price: 5
        },
        {
            id: 2,
            name: "Raw Silicon",
            ingredients: [],
            productionTime: 2,
            price: 5
        },
        {
            id: 3,
            name: "Copper wire",
            ingredients:[],
            productionTime: 3,
            price: 5
        },
        {
            id: 4,
            name: "Plastic Case",
            ingredients: ["Raw Plastic"],
            productionTime: 5,
            price: 10
        },
        {
            id: 5,
            name: "Circuit Board",
            ingredients: ["Raw Silicon", "Copper wire"],
            productionTime: 7,
            price: 15
        },
        {
            id: 6,
            name: "Basic Sensor",
            ingredients: ["Circuit Board", "Plastic Case"],
            productionTime: 10,
            price: 25
        }

    ]

    public static getProductById(id: number): Product | undefined {
        return this.simple_productsList.find(product => product.id === id);
    }

    public static getProductByName(name: string): Product | undefined {
        return this.simple_productsList.find(product => product.name === name);
    }

    public static getAllProducts(): Product[] {
        return this.simple_productsList;
    }



    //Addtional methods for the game later
    //generateRandomProducts()
    //calculateProductCost()
    static getRandomProductId(): number {
        const randomIndex = Math.floor(Math.random() * this.simple_productsList.length);
        return this.simple_productsList[randomIndex].id;
    }
    static generateRandomProducts(): Product {
        const randomIndex = Math.floor(Math.random() * this.simple_productsList.length);
        return this.simple_productsList[randomIndex];
    }

    static calculateProductPrice(items: {productId: number, quantity: number}[]): number{
        let totalPrice = 0;
        for (const item of items){
            const product = this.getProductById(item.productId);
            if (product){
                totalPrice += product.price * item.quantity;
            }
        }
        return totalPrice;
    }
}
