import {Product} from "../../interfaces/product";
import {Coordinates} from "../coordinates/coordinates";
import {RenderObject} from "../rendering/render-object";
import {Products} from "../product/products";
import {RenderingService} from "../../services/rendering.service";

export class ConveyorBelt extends RenderObject{
    private static lastId = 0;
    private conveyorId: number;
    private _direction: 'left' | 'right' | 'up' | 'down';
    private _speed: number;
    private _products: Array<{product: Product, progress: number}> = [];
    private _canSpawnProducts: boolean = true;
    private _spawnRate: number;
    private _lastSpawnTime: number = 0;
    private _maxProducts: number;
    private _isActive: boolean = true;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        direction: 'left' | 'right' | 'up' | 'down' = 'right',
        speed: number = 0.02,
        canSpawnProducts: boolean = false,
        spawnRate: number = 3000,
        maxProducts: number = 5
    ){
        super(
            `conveyor-${ConveyorBelt.lastId}`,
            "rect",
            x,
            y,
            10,
            width,
            height,
            0,
            undefined,
            undefined,
            '#8B4513FF',
            ["#A0522D", "#8B4513", "#654321", "#3D2B1F"]
        );
        this.conveyorId = ConveyorBelt.lastId++;
        this._direction = direction;
        this._speed = speed;
        this._canSpawnProducts = canSpawnProducts;
        this._spawnRate = spawnRate;
        this._maxProducts = maxProducts;
    }

    update(deltaTime: number): void{
        if(!this._isActive) 
            return;
        this.moveProducts(deltaTime);

        if(this._canSpawnProducts){
            this.trySpawnProduct();
        }

        this.updateProductPositions();
    }

    private moveProducts(deltaTime: number){
        for (let productData of this._products){
            productData.progress += this._speed * deltaTime;

            if(productData.progress > 1){
                productData.progress = 1;
            }
        }

    }

    private trySpawnProduct(): void {
        const currentTime = Date.now();

        if (this._products.length < this._maxProducts &&currentTime - this._lastSpawnTime >= this._spawnRate){
            this.spawnProduct();
            this._lastSpawnTime = currentTime;
        }
    }
    
    spawnProduct(product?: Product): boolean{
        if(this._products.length >= this._maxProducts){
            return false;
        }
        const newProduct = product || this.createRandomProduct();
        const productCopy: Product = {...newProduct, position: this.getProductPosition(0)};
        this._products.push({product: productCopy, progress: 0});
        
        Products.addProduct(productCopy, productCopy.position!);
        console.log(`Produkt ${newProduct.name} auf Förderband ${this.conveyorId} gespawnt.`);
        return true;
    }

    private createRandomProduct(): Product {
        const rawMaterials = [
            Products.getProductByName("Raw Silicon"),
            Products.getProductByName("Raw Copper"),
            Products.getProductByName("Raw Iron")
        ].filter(p => p !== undefined) as Product[];

        const randomProduct = rawMaterials[Math.floor(Math.random() * rawMaterials.length)];
        return randomProduct;
    }

    getProductPosition(progress: number): Coordinates{
        let x = this.x;
        let y = this.y;

        switch(this._direction){
            case 'right':
                x += progress * this.width;
                y += this.height / 2;
                break;
            case 'left':
                x += (1 -progress)  * this.width;
                y += this.height / 2;
                break;
            case 'down':
                x += this.width / 2;
                y += progress * this.height;
                break;
            case 'up':
                x += this.width / 2;
                y += (1 - progress) * this.height;
                break;
        }
        return new Coordinates(x, y);
    }

    private updateProductPositions(): void{
        this._products.forEach(productData => {
            const newPosition = this.getProductPosition(productData.progress);
            productData.product.position = newPosition;
            this.updateRenderedProductPosition(productData.product, newPosition);
        });
    }

    private updateRenderedProductPosition(product: Product, position: Coordinates): void{
        const renderObjName = `product:${product.name}`;
        const existingRenderObj = RenderingService.instance().getRenderingObjektByName(`product:${product.name}`);
        if(existingRenderObj){
            const updatedRenderObj = new RenderObject(
                renderObjName,
                "rect",
                position.x,
                position.y,
                1,
                20,
                20,
                1000,
                undefined,
                undefined,
                "blue",
                []
            );
            RenderingService.instance().updateRenderingObject(renderObjName, updatedRenderObj);
        }
    }

    takeProduct(): Product | null{
        if (this._products.length === 0)return null;

        let highestProgress = -1;
        let productIndex = -1;

        this._products.forEach((productData, index) => {
            if(productData.progress >= 0.8){
                if(productData.progress > highestProgress){
                    highestProgress = productData.progress;
                    productIndex = index;
                }
            }
        });
        if (productIndex !== -1){
            const productData = this._products[productIndex];
            this._products.splice(productIndex, 1);

            Products.deleteGeneratedProduct(productData.product);
            return productData.product;
        }
        return null;
    }

    addProduct(product: Product): boolean{
        if (this._products.length >= this._maxProducts){
            return false;
        }
        const productCopy: Product = {...product, position: this.getProductPosition(0)};
        this._products.push({product: productCopy, progress: 0});
        Products.addProduct(productCopy, productCopy.position!);
        return true;
    }

    getReadyProducts(): Product[]{
        return this._products
            .filter(productData => productData.progress >= 0.8)
            .map(productData => productData.product);
    }

    getConveyorId(): number{return this.conveyorId;}
    getDirection(): string{return this._direction;}
    getSpeed(): number{return this._speed;}
    getProducts(): Array<{product: Product, progress: number}>{return this._products;}
    getCanSpawnProducts(): boolean{return this._canSpawnProducts;}
    getIsActive(): boolean{return this._isActive;}

    setSpeed(v: number): void{this._speed = v;}
    setCanSpawnProducts(v: boolean): void{this._canSpawnProducts = v;}
    setIsActive(v: boolean): void{this._isActive = v;}
    setSpawnRate(v: number): void{this._spawnRate = v;}
}
