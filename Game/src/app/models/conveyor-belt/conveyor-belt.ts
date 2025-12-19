import {Product} from "../product/product";
import {Coordinates} from "../coordinates/coordinates";
import {RenderObject} from "../rendering/render-object";
import {Products} from "../product/products";
import {Package} from "../package/package";
import {Gamefield} from "../gamefield/gamefield";

export enum ConveyorType {
    RAW_MATERIALS = "raw_materials",
    COPPER_WIRE = "copper_wire",
    RAW_PLASTIC = "raw_plastic",
    RAW_SILICON = "raw_silicon",
    PACKAGES = 'packages'
}


export class ConveyorBelt extends RenderObject{
    private static lastId = 0;
    private conveyorId: number;
    private _direction: 'left' | 'right' | 'up' | 'down';
    private _speed: number;
    private _items: Array<{items: Product | Package, progress: number, renderId: string, type: 'product' | 'package'}> = [];
    private _canSpawnItems: boolean = true;
    private _spawnRate: number;
    private _lastSpawnTime: number = 0;
    private _maxItems: number;
    private _isActive: boolean = true;
    private _itemsCounter: number = 0;

    private _conveyorType: ConveyorType;

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
       canSpawnItems: boolean = false,
       //Spawn Rate in ms
       spawnRate: number = 3000,
       //Maximale Anzahl an Produkten auf dem Förderband
       maxItems: number = 5,
       //Förderband Typ
       conveyorType: ConveyorType = ConveyorType.RAW_MATERIALS
   ){
       super(
           `conveyor-${ConveyorBelt.lastId}`,
           "rect",
           x,
           y,
           30,
           width,
           height,
           0,
           undefined,
           undefined,
           '#5a5a5aff',
           ["#3f3f3fff", "#252525ff"]
       );
       this.conveyorId = ConveyorBelt.lastId++;
       this._direction = direction;
       this._speed = speed;
       this._canSpawnItems = canSpawnItems;
       this._spawnRate = spawnRate;
       this._maxItems = maxItems;
       this._conveyorType = conveyorType;
       // Randomize initial spawn time to prevent all conveyors spawning simultaneously
       if (canSpawnItems) {
           this._lastSpawnTime = Date.now() - Math.random() * spawnRate;
       }
   }


   update(deltaTime: number): void{
       if(!this._isActive)
           return;
       this.moveItems(deltaTime);


       if(this._canSpawnItems){
           this.trySpawnItem();
       }


       this.updateItemPositions();
   }


   //Wie sich die Produkte auf dem Förderband nach dem Spawn bewegen
   private moveItems(deltaTime: number): void{
       this._items.sort((a, b) => b.progress - a.progress);


       let minDistance = 0.15;
       for (let i = 0; i < this._items.length; i++) {
           const productData = this._items[i];
           let maxAllowedProgress = 1.0 - 0.01;
           if (i > 0){
               const frontProduct = this._items[i - 1];
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


   private trySpawnItem(): void {
       const currentTime = Date.now();
       let typeProduct = this._conveyorType === ConveyorType.COPPER_WIRE ? Products.getProductById(3) :
                         this._conveyorType === ConveyorType.RAW_PLASTIC ? Products.getProductById(1) :
                         this._conveyorType === ConveyorType.RAW_SILICON ? Products.getProductById(2) :
                         undefined;
        if(typeProduct)
        {
            typeProduct = typeProduct.copy();
        }


       if (this._items.length < this._maxItems &&currentTime - this._lastSpawnTime >= this._spawnRate){
           const canSpawn = this.canSpawnAtStart();
           if (canSpawn){
                let spawnSuccess: boolean;
                if (this._conveyorType === ConveyorType.PACKAGES){
                    spawnSuccess = this.spawnPackage();
                }
                else {
                    spawnSuccess = this.spawnProduct(typeProduct);
                }
                if (spawnSuccess) {
                    this._lastSpawnTime = currentTime;
                }
                else {
                    this._lastSpawnTime = currentTime - this._spawnRate + 500;
                }

           }
           else{
               this._lastSpawnTime = currentTime - this._spawnRate + 500; // Versuche es in 500ms erneut
           }
       }
   }


   private canSpawnAtStart(): boolean {
       if (this._items.length === 0){
           return true;
       }

       this._items.sort((a,b) => b.progress - a.progress);
       const lastItem = this._items[this._items.length - 1];

       return lastItem.progress >= 0.15;
   }
   // Spawnt ein Produkt auf dem Förderband
   spawnProduct(product?: Product): boolean{
       if(this._items.length >= this._maxItems){
           return false;
       }
       const newProduct = product || this.createRandomRawMaterial();
      // const productCopy: Product = {...newProduct, position: this.getProductPosition(0)};


       let startingProgress = 0;
       if (this._items.length > 0){
           this._items.sort((a,b) => b.progress - a.progress);
           const lastItemProgress = this._items[0].progress;

           startingProgress = 0;
           if (lastItemProgress < 0.15){
               const pushAmount = 0.15 - lastItemProgress;
               this._items.forEach(p => {
                   p.progress += pushAmount;
                   if (p.progress > 1.0){
                       p.progress = 1.0;
                   }
               })

           }
       }
       const startPos = this.getProductPosition(startingProgress, newProduct);
       newProduct.init(startPos);
       newProduct.z = this.z;
       const renderId = `conveyor-product-${this.conveyorId}-product-${this._itemsCounter++}`;
       this._items.push({items: newProduct, progress: startingProgress, renderId: renderId, type: 'product'});
       this._items.sort((a, b) => b.progress - a.progress);


       //console.log(`Produkt ${newProduct.name} auf Förderband ${this.conveyorId} gespawnt.`);
       return true;
   }

   spawnPackage(pkg?: Package): boolean {
        if(this._items.length >= this._maxItems){
            return false;
        }
        const newPackage = pkg || this.createRandomPackage();
        let startingProgress = 0;
        if (this._items.length > 0){
            this._items.sort((a,b) => b.progress - a.progress);
           const lastItemProgress = this._items[0].progress;

           startingProgress = 0;
           if (lastItemProgress < 0.15){
               const pushAmount = 0.15 - lastItemProgress;
               this._items.forEach(p => {
                   p.progress += pushAmount;
                   if (p.progress > 1.0){
                       p.progress = 1.0;
                   }
               });
           }
        }
        newPackage.position = this.getProductPosition(startingProgress, newPackage);
        newPackage.z = this.z;

        const renderId = `conveyor-product-${this.conveyorId}-product-${this._itemsCounter++}`;
        this._items.push({items: newPackage, progress: startingProgress, renderId: renderId, type: 'package'});
        this._items.sort((a, b) => b.progress - a.progress);
        return true;
   }


    private createRandomRawMaterial(): Product {
        const rawMaterials = [
                Products.getProductById(1),
                Products.getProductById(2),
                Products.getProductById(3)
            ].filter(p => p !== undefined);
            const base = rawMaterials[Math.floor(Math.random() * rawMaterials.length)]!.copy();
            base.init(new Coordinates(base.position.x, base.position.y))
            return base
    }

    private createRandomPackage(): Package {
      return new Package(new Coordinates(0, 0));
    }
   getItemPosition(progress: number, product: Product | Package): Coordinates{
       let x = this.x;
       let y = this.y;


       const productWidth = product.size;
       const productHeight = product.size;

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

   getProductPosition(progress: number, product: Product | Package): Coordinates{
         return this.getItemPosition(progress, product);
   }
   private updateItemPositions(): void{
       this._items.forEach(itemData => {
           const newPosition = this.getItemPosition(itemData.progress, itemData.items);
           if (itemData.type === 'product'){
                (itemData.items as Product).position = newPosition;
           }
           else {
              (itemData.items as Package).position = newPosition;
           }
       });
   }




   private getProductRenderName(product: Product): string{
       return `conveyor-product-${this.conveyorId}-product-${this._itemsCounter++}`;
   }





   takeItem(): Product | Package | null{
       if (this._items.length === 0)return null;


       let highestProgress = -1;
       let productIndex = -1;


       this._items.forEach((itemData, index) => {
           if(itemData.progress >= 0.8){
               if(itemData.progress > highestProgress){
                   highestProgress = itemData.progress;
                   productIndex = index;
               }
           }
       });
       if (productIndex !== -1){
           const productData = this._items[productIndex];
           this._items.splice(productIndex, 1);


          //console.log(`Produkt ${productData.items.name} von Förderband ${this.conveyorId} entnommen.`);
           return productData.items;
       }
       return null;
   }


   addItem(item: Product | Package): boolean{
       if (this._items.length >= this._maxItems){
           return false;
       }
       const pos = this.getItemPosition(0, item);
       const type = item instanceof Package ? 'package' : 'product';
       if(type === 'product'){
            (item as Product).init(pos);
       }
       else {
            (item as Package).position = pos;
       }

       const renderId = `conveyor-product-${this.conveyorId}-product-${this._itemsCounter++}`;
       this._items.push({items: item, progress: 0, renderId: renderId, type: type});
       //console.log(`Produkt ${item.name} zu Förderband ${this.conveyorId} hinzugefügt.`);
       return true;
   }

   addProduct(product: Product): boolean{
        return this.addItem(product);
   }

   getReadyItems(): (Product | Package)[] {
       return this._items
           .filter(productData => productData.progress >= 0.8)
           .sort((a, b) => b.progress - a.progress)
           .map(productData => productData.items);
   }

   getReadyProducts(): Product[] {
        return this.getReadyItems()
           .filter(item => item instanceof Product)
           .map(item => item as Product);
   }
   getReadyPackages(): Package[] {
       return this.getReadyItems()
           .filter(item => item instanceof Package)
           .map(item => item as Package);
   }

   getProductAtPosition(position: Coordinates): Product | Package | null{
       for (let i = 0; i < this._items.length; i++){
         const productData = this._items[i];
         const productPos = productData.items.position;
         if (productPos){
           const productCenterX = productPos.x + productData.items.size / 2;
           const productCenterY = productPos.y + productData.items.size / 2;
           const dx = productCenterX - position.x;
           const dy = productCenterY - position.y;
           const distance = Math.sqrt(dx * dx + dy * dy);
           //console.log(`  Product ${i}: pos(${productPos.x.toFixed(1)}, ${productPos.y.toFixed(1)}), center(${productCenterX.toFixed(1)}, ${productCenterY.toFixed(1)}), dist: ${distance.toFixed(2)}px`);

           if (distance <= Gamefield.fieldsize){
             // this._items.splice(i, 1);
             //productData.items.destroy();
             //console.log(`✓ Produkt ${productData.items.name} von Förderband ${this.conveyorId} entfernt (Distanz: ${distance.toFixed(2)}px).`);
             return productData.items;
           }
         }
       }
       return null;
   }

   removeProductAtPosition(position: Coordinates): Product | Package | null{
       //console.log(`Checking ${this._items.length} products on conveyor ${this.conveyorId} for pickup at (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);
       for (let i = 0; i < this._items.length; i++){
           const productData = this._items[i];
           const productPos = productData.items.position;
           if (productPos){

               const productCenterX = productPos.x + productData.items.size / 2;
               const productCenterY = productPos.y + productData.items.size / 2;
               const dx = productCenterX - position.x;
               const dy = productCenterY - position.y;
               const distance = Math.sqrt(dx * dx + dy * dy);
               //console.log(`  Product ${i}: pos(${productPos.x.toFixed(1)}, ${productPos.y.toFixed(1)}), center(${productCenterX.toFixed(1)}, ${productCenterY.toFixed(1)}), dist: ${distance.toFixed(2)}px`);

               if (distance <= Gamefield.fieldsize){
                   this._items.splice(i, 1);
                   //productData.items.destroy();
                   //console.log(`✓ Produkt ${productData.items.name} von Förderband ${this.conveyorId} entfernt (Distanz: ${distance.toFixed(2)}px).`);
                   return productData.items;
               }
           }
       }
       //sconsole.log('  No products within 50px pickup range');
       return null;
   }


   getConveyorId(): number{return this.conveyorId;}
   getDirection(): string{return this._direction;}
   getSpeed(): number{return this._speed;}
   getItems(): Array<{items: Product | Package, progress: number, renderId: string, type: string}>{return this._items;}
   getCanSpawnItems(): boolean{return this._canSpawnItems;}
   getIsActive(): boolean{return this._isActive;}
   getConveyorType(): ConveyorType {return this._conveyorType;}


   setSpeed(v: number): void{this._speed = v;}
   setCanSpawnItems(v: boolean): void{this._canSpawnItems = v;}
   setIsActive(v: boolean): void{this._isActive = v;}
   setSpawnRate(v: number): void{this._spawnRate = v;}
   setConveyorType(v: ConveyorType): void {this._conveyorType = v;}
}


