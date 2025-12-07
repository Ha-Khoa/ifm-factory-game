import { Product } from "../product/product";
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
           50,
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


   //Wie sich die Produkte auf dem Förderband nach dem Spawn bewegen
   private moveProducts(deltaTime: number): void{
       this._products.sort((a, b) => b.progress - a.progress);


       let minDistance = 0.15;
       for (let i = 0; i < this._products.length; i++) {
           const productData = this._products[i];
           let maxAllowedProgress = 1.0 - 0.05;
           if (i > 0){
               const frontProduct = this._products[i - 1];
               maxAllowedProgress = frontProduct.progress - minDistance;
           }
          
           let newProgress = productData.progress + this._speed * (deltaTime / 1000);
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


       const lastProduct = this._products[this._products.length - 1];


       return lastProduct.progress >= 0.15;
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
           const lastProductProgress = this._products[0].progress;


           //startingProgress = lastProgress  + 0.15; 


           // if (startingProgress < 0) {
           //     startingProgress = 0;
           // }
           // if (startingProgress < 0.1) {
           //     this._products.forEach(p => {
           //         p.progress += 0.1;
           //         if (p.progress > 1.0){
           //             p.progress = 1.0;
           //         }


           //     });
           //     startingProgress = 0;
           // }
           startingProgress = 0;
           if (lastProductProgress < 0.15){
               const pushAmount = 0.15 - lastProductProgress;
               this._products.forEach(p => {
                   p.progress += pushAmount;
                   if (p.progress > 1.0){
                       p.progress = 1.0;
                   }
               })




           }
       }
       const startPos = this.getProductPosition(startingProgress);
       newProduct.init(startPos);
       const renderId = `conveyor-product-${this.conveyorId}-product-${this._productsCounter++}`;
       this._products.push({product: newProduct, progress: startingProgress, renderId: renderId});
       this._products.sort((a, b) => b.progress - a.progress);


       console.log(`Produkt ${newProduct.name} auf Förderband ${this.conveyorId} gespawnt.`);
       return true;
   }


   private createRandomProduct(): Product {
       const rawMaterials = [
           Products.getProductByName("Raw Plastic"),
           Products.getProductByName("Raw Silicon"),
           Products.getProductByName("Copper wire")
       ].filter(p => p !== undefined);
       const base = rawMaterials[Math.floor(Math.random() * rawMaterials.length)]!.copy();
       base.init(new Coordinates(base.position.x, base.position.y))
       base.z = 50
    return base;
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
       });
   }




   private getProductRenderName(product: Product): string{
       return `conveyor-product-${this.conveyorId}-product-${this._productsCounter++}`;
   }


   // Rendering wird durch Products.addProduct erzeugt; das Förderband aktualisiert nur die Position.
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
          //productData.product.destroy();
          console.log(`Produkt ${productData.product.name} von Förderband ${this.conveyorId} entnommen.`);
           return productData.product;
       }
       return null;
   }


   addProduct(product: Product): boolean{
       if (this._products.length >= this._maxProducts){
           return false;
       }
       const pos = this.getProductPosition(0);
       product.init(pos);
       const renderId = `conveyor-product-${this.conveyorId}-product-${this._productsCounter++}`;
       this._products.push({product: product, progress: 0, renderId: renderId});
       console.log(`Produkt ${product.name} zu Förderband ${this.conveyorId} hinzugefügt.`);
       return true;
   }


   getReadyProducts(): Product[]{
       return this._products
           .filter(productData => productData.progress >= 0.8)
           .sort((a, b) => b.progress - a.progress)
           .map(productData => productData.product);
   }


   removeProductAtPosition(position: Coordinates): Product | null{
       console.log(`Checking ${this._products.length} products on conveyor ${this.conveyorId} for pickup at (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);
       for (let i = 0; i < this._products.length; i++){
           const productData = this._products[i];
           const productPos = productData.product.position;
           if (productPos){
              
               const productCenterX = productPos.x + 10;
               const productCenterY = productPos.y + 10;
               const dx = productCenterX - position.x;
               const dy = productCenterY - position.y;
               const distance = Math.sqrt(dx * dx + dy * dy);
               console.log(`  Product ${i}: pos(${productPos.x.toFixed(1)}, ${productPos.y.toFixed(1)}), center(${productCenterX.toFixed(1)}, ${productCenterY.toFixed(1)}), dist: ${distance.toFixed(2)}px`);
             
               if (distance <= 50){
                   this._products.splice(i, 1);
                   productData.product.destroy();
                   console.log(`✓ Produkt ${productData.product.name} von Förderband ${this.conveyorId} entfernt (Distanz: ${distance.toFixed(2)}px).`);
                   return productData.product;
               }
           }
       }
       console.log('  No products within 50px pickup range');
       return null;
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


