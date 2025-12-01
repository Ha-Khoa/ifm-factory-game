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
    private _products: Array<{product: Product, progress: number, renderId: string}> = [];
    private _canSpawnProducts: boolean = true;
    private _spawnRate: number;
    private _lastSpawnTime: number = 0;
    private _maxProducts: number;
    private _isActive: boolean = true;
    private _productsCounter: number = 0;

    constructor(
        //Position x
        x: number,
        //Position y
        y: number,
        //Breite von dem Förderband
        width: number,
        //Höhe von dem Förderband
        height: number,
        //Richtung des Förderbands
        direction: 'left' | 'right' | 'up' | 'down' = 'right',
        //Geschwindigkeit des Förderbands
        speed: number = 0.02,
        //Ob das Förderband Produkte spawnen kann
        canSpawnProducts: boolean = false,
        //Spawn Rate in ms
        spawnRate: number = 3000,
        //Maximale Anzahl an Produkten auf dem Förderband
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

    private moveProducts(deltaTime: number): void{
        this._products.sort((a, b) => b.progress - a.progress);

        let minDistance = 0.15; 
        for (let i = 0; i < this._products.length; i++) {
            const productData = this._products[i];
            let maxAllowedProgress = 1.0;
            if (i > 0){
                const frontProduct = this._products[i - 1];
                maxAllowedProgress = frontProduct.progress - minDistance;
            }
            
            let newProgress = productData.progress + this._speed * deltaTime;
            if (newProgress > maxAllowedProgress){
                newProgress = maxAllowedProgress;
            }
            if (newProgress > 1.0){
                newProgress = 1.0;
            }
            if (newProgress < 0){
                newProgress = 0;
            }
            productData.progress = newProgress;
        }
        

    }

    private trySpawnProduct(): void {
        const currentTime = Date.now();

        if (this._products.length < this._maxProducts &&currentTime - this._lastSpawnTime >= this._spawnRate){
            const canSpawn = this.canSpawnAtStart();
            if (canSpawn && this.spawnProduct()){
                this._lastSpawnTime = currentTime;

            }
            else{
                this._lastSpawnTime = currentTime - this._spawnRate + 500; // Versuche es in 500ms erneut
            }
        }
    }

    private canSpawnAtStart(): boolean {
        if (this._products.length === 0){
            return true;
        }

        this._products.sort((a,b) => b.progress - a.progress);

        const frontProductProgress = this._products[this._products.length - 1].progress;

        return frontProductProgress >= 0.2;
    }
    // Spawnt ein Produkt auf dem Förderband
    spawnProduct(product?: Product): boolean{
        if(this._products.length >= this._maxProducts){
            return false;
        }
        const newProduct = product || this.createRandomProduct();
       // const productCopy: Product = {...newProduct, position: this.getProductPosition(0)};

        let startingProgress = 0;
        if (this._products.length > 0){
            this._products.sort((a,b) => b.progress - a.progress);
            const highestProgress = this._products[0].progress;

            startingProgress = highestProgress  - 0.15;  

            if (startingProgress < 0) {
                startingProgress = 0;
            }
            if (startingProgress < 0.1) {
                this._products.forEach(p => {
                    p.progress += 0.1;
                    if (p.progress > 1.0){
                        p.progress = 1.0;
                    }

                });
                startingProgress = 0;
            }
        }
        const productCopy: Product = {...newProduct, position: this.getProductPosition(startingProgress)};
        const renderId = `conveyor-product-${this.conveyorId}-product-${this._productsCounter++}`;
        this._products.push({product: productCopy, progress: startingProgress, renderId: renderId});
        this._products.sort((a, b) => b.progress - a.progress);

        //Products.addProduct(productCopy, productCopy.position!);
        this.createProductRenderObject(productCopy, productCopy.position!, renderId);
        console.log(`Produkt ${newProduct.name} auf Förderband ${this.conveyorId} gespawnt.`);
        return true;
    }

    private createRandomProduct(): Product {
        const rawMaterials = [
            Products.getProductByName("Raw Plastic"),
            Products.getProductByName("Raw Silicon"),
            Products.getProductByName("Copper wire")
        ].filter(p => p !== undefined) as Product[];

        const randomProduct = rawMaterials[Math.floor(Math.random() * rawMaterials.length)];
        return randomProduct;
    }

    getProductPosition(progress: number): Coordinates{
        let x = this.x;
        let y = this.y;

        const productWidth = 20;
        const productHeight = 20;
        
        switch(this._direction){
            case 'right':
                x += progress * (this.width -  productWidth);
                y += (this.height - productHeight) / 2;
                break;
            case 'left':
                x += (1 - progress)  * (this.width - productWidth);
                y += (this.height - productHeight) / 2;
                break;
            case 'down':
                x += (this.width - productWidth) / 2;
                y += progress * (this.height - productHeight);
                break;
            case 'up':
                x += (this.width - productWidth) / 2;
                y += (1 - progress) * (this.height - productHeight);
                break;
        }
        return new Coordinates(x, y);
    }

    private updateProductPositions(): void{
        this._products.forEach(productData => {
            const newPosition = this.getProductPosition(productData.progress);
            productData.product.position = newPosition;
            this.updateRenderedProductPosition(productData.product, newPosition, productData.renderId);
        });
    }

    private updateRenderedProductPosition(product: Product, position: Coordinates, renderId:string): void{
        //const renderObjName = this.getProductRenderName(product);
        const existingRenderObj = RenderingService.instance().getRenderingObjektByName(renderId);
        if(existingRenderObj){
            existingRenderObj.x = position.x;
            existingRenderObj.y = position.y;
        } else{
            this.createProductRenderObject(product, position, renderId);
        }
    }

    private getProductRenderName(product: Product): string{
        return `conveyor-product-${this.conveyorId}-product-${this._productsCounter++}`;
    }

    private createProductRenderObject(product: Product, position: Coordinates, renderId: string): void{
        //const renderObjName = this.getProductRenderName(product);
        const productColor = this.getProductColor(product.name);

        const renderObj = new RenderObject(
            renderId,
            "rect",
            position.x,
            position.y,
            15,
            20,
            20,
            1000,
            undefined,
            undefined,
            productColor,
            []
        );
        RenderingService.instance().addRenderObject(renderObj);
    }
    private getProductColor(productName: string): string{
        const colorMap: {[key: string]: string}= {
            "Raw Plastic": "#FF6B6B",
            "Raw Silicon": "#4ECDC4", 
            "Copper wire": "#FFE66D",
            "Plastic Case": "#6A0572",
            "Circuit Board": "#1A936F",
            "Basic Sensor": "#114B5F"
        }
        return colorMap[productName] || "#CCCCCC";
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

           // Products.deleteGeneratedProduct(productData.product);
           //const renderObjName = this.getProductRenderName(productData.product);
           RenderingService.instance().deleteRenderingObjektByName(productData.renderId);
           console.log(`Produkt ${productData.product.name} von Förderband ${this.conveyorId} entnommen.`);
            return productData.product;
        }
        return null;
    }

    addProduct(product: Product): boolean{
        if (this._products.length >= this._maxProducts){
            return false;
        }
        const productCopy: Product = {...product, position: this.getProductPosition(0)};
        const renderId = `conveyor-product-${this.conveyorId}-product-${this._productsCounter++}`;
        this._products.push({product: productCopy, progress: 0, renderId: renderId});
        //Products.addProduct(productCopy, productCopy.position!);
        this.createProductRenderObject(productCopy, productCopy.position!, renderId);
        console.log(`Produkt ${product.name} zu Förderband ${this.conveyorId} hinzugefügt.`);
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
