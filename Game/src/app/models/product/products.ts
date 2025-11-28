import {Product} from '../../interfaces/product';
import { RenderingService } from '../../services/rendering.service';
import { RenderObject } from '../rendering/render-object';
import { Hitbox } from '../../interfaces/hitbox';
import { Coordinates } from '../coordinates/coordinates';

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

    public static generatedProducts: Product[] = [];
    public static size: number = 20;

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

    public static checkForInteraction(player: Hitbox): Product | null {
        const productToInteract = this.shortestProductDistance(player);
        if(productToInteract && productToInteract.distance <= 55)
        {
            return productToInteract.product;
        }
        return null;
    }

    public static deleteGeneratedProduct(product: Product)
    {
        this.generatedProducts = this.generatedProducts.filter(p => p != product);
        this.deleteRenderingProduct(product);
    }

    private static deleteRenderingProduct(product: Product)
    {
        RenderingService.instance().deleteRenderingObjektByName(product.name);
        RenderingService.instance().deleteRenderingObjektByName(`product:${product.name}`);
    }

    public static addProduct(product: Product, position: Coordinates)
    {
        let newProduct = Products.getProductByName(product.name);
        newProduct!.position = position;
        this.generatedProducts.push(newProduct!);
        RenderingService.instance().addRenderObject(new RenderObject(
            `product:${newProduct!.name}`,
            "rect",
            newProduct!.position.x,
            newProduct!.position.y,
            1,
            20,
            20,
            1000,
            undefined,
            undefined,
            "blue",
            []
        ));
        console.log(RenderingService.instance().getRenderingObjektByName(newProduct!.name));
    }

    public static generateProducts():void
    {
        let newProduct = Products.getProductByName("Raw Silicon");
        newProduct!.position = new Coordinates(600, 200);
        this.generatedProducts.push(newProduct!);
        RenderingService.instance().addRenderObject(new RenderObject(
            `product:Raw Silicon`,
            "rect",
            newProduct!.position.x,
            newProduct!.position.y,
            1,
            20,
            20,
            0,
            undefined,
            undefined,
            "#6e11e6ff",
            []
        )
        )
        newProduct = Products.getProductByName("Circuit Board");
        newProduct!.position = new Coordinates(700, 200);
        this.generatedProducts.push(newProduct!);
        RenderingService.instance().addRenderObject(new RenderObject(
            `product:Circuit Board`,
            "rect",
            newProduct!.position.x,
            newProduct!.position.y,
            1,
            20,
            20,
            0,
            undefined,
            undefined,
            "#0fe286ff",
            []
        )
        )
        newProduct = Products.getProductByName("Raw Plastic");
        newProduct!.position = new Coordinates(500, 200);
        this.generatedProducts.push(newProduct!);
        RenderingService.instance().addRenderObject(new RenderObject(
            `product:Raw Plastic`,
            "rect",
            newProduct!.position.x,
            newProduct!.position.y,
            1,
            20,
            20,
            0,
            undefined,
            undefined,
            "#0fe286ff",
            []
        )
        )
    }

    private static shortestProductDistance(player: Hitbox): {distance: number, product: Product} | undefined
    {
        let productsDistances: {distance: number, product: Product}[] = [];
        this.generatedProducts.forEach(generatedProduct => {
            const distance = Math.sqrt(Math.pow((player.x + player.width / 2 - generatedProduct.position!.x), 2) + Math.pow((player.y + player.height / 2 - generatedProduct.position!.y), 2));
            productsDistances.push({distance: distance, product: generatedProduct});
            console.log(generatedProduct.position!.x)
        })
        const min = Math.min(...productsDistances.map(prod => prod.distance));
        
        return productsDistances.find(prod => prod.distance === min)
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
