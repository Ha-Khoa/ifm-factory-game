import {Product} from '../../interfaces/product';

export class Products {

    //Einfach Produkte Liste für das frühe Spiel, später können wir komplexere Produkte mit mehreren Zutaten hinzufügen
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

    //Methoden um Produkte anzurufen
    public static getProductById(id: number): Product | undefined {
        return this.simple_productsList.find(product => product.id === id);
    }

    public static getProductByName(name: string): Product | undefined {
        return this.simple_productsList.find(product => product.name === name);
    }

    public static getAllProducts(): Product[] {
        return this.simple_productsList;
    }



    //Generiere eine zufällige Produkt für Bestellungen (wenn die Spieler höhere Level erreichen, können wir schwere Bestellung hinzufügen)
    //für komplexe Produkte mit mehreren Zutaten, müssen wir die Logik hier erweitern
    static getRandomProductId(): number {
        const randomIndex = Math.floor(Math.random() * this.simple_productsList.length);
        return this.simple_productsList[randomIndex].id;
    }
    static generateRandomProducts(): Product {
        const randomIndex = Math.floor(Math.random() * this.simple_productsList.length);
        return this.simple_productsList[randomIndex];
    }


    //Berechne den Gesamtpreis für eine Liste von Produkten basierend auf deren Menge
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
