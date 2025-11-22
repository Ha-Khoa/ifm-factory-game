import {Inventory, InventoryItem} from "../../interfaces/inventory";
import {Product} from "../../interfaces/product";
export class InventoryManager {
    private static inventory: Inventory = {
        maxSlots: 10,
        items: [],
        carriedItem: null
    };
    
    static getMaxSlots(): number{
        return this.inventory.maxSlots;
    }
    static getUsedSlots(): number{
        return this.inventory.items.length;
    }
    static getAvailableSlots(): boolean{
        return this.inventory.items.length < this.inventory.maxSlots;
    }


    // Zuerst habe ich diese Methode geschrieben, um ein Produkt abzuholen und abzulegen .
    // Aber dann habe ich gemerkt, dass wir diese Methode eigentlich nicht brauchen. 
    // Wir müssen nur zu jeder Maschine gehen und allen Produkte in einer Maschine ins Inventory hinzufügen.
    // Deshalb habe ich diese Codezeilen vorerst auskommentiert – bis zur nächsten Besprechung.

    // ein Item abholen und ablegen
    // static carryItem(product: Product):boolean {
    //     if (this.inventory.carriedItem) {
    //         return false;
    //     }
    //     this.inventory.carriedItem = product;
    //     console.log(`Trage jetzt: ${product.name}`);
    //     return true;
    // }

    // static dropItem(): Product | null {
    //     const item = this.inventory.carriedItem;
    //     this.inventory.carriedItem = null;
    //     if (item) {
    //         console.log(`Habe abgelegt: ${item.name}`);
    //     }
    //     return item;
    // }

    // static getCarriedItem(): Product | null {
    //     return this.inventory.carriedItem;
    // }

    // static isCarryingItem(): boolean { 
    //     return this.inventory.carriedItem !== null;
    // }



    //Füge ein Item zum Inventar hinzu (wenn der Spieler ein Item sammelt, er wählen kann, Inventar hinzufügen oder tragen) 
    static addToInventory(product: Product, quantity: number): boolean {
        const existingItem = this.inventory.items.find(item => item.product.id === product.id);
        if (existingItem){
            existingItem.quantity += quantity;
        }
        else {
            if (this.inventory.items.length >= this.inventory.maxSlots) {
                console.log("Voll!");
                return false
            }
            this.inventory.items.push({product: product, quantity: quantity});
        }
        console.log(` ${quantity} von ${product.name} zum Inventar hinzugefügt.`);
        return true;
    }

    static removeFromInventory(productId: number, quantity: number): boolean {
        const itemIndex = this.inventory.items.findIndex(item => item.product.id === productId);
        if (itemIndex !== -1){
            const item = this.inventory.items[itemIndex];

            if (item.quantity >= quantity ){
                item.quantity -= quantity;
            }
            else{
                this.inventory.items.splice(itemIndex, 1);
            }
            console.log(` ${quantity} von ${item.product.name} aus dem Inventar entfernt.`);
            return true;
        }
        console.log(`Produkt ${productId} nicht im Inventar gefunden.`);
        return false;
    }
    static getInventory(): InventoryItem[] {
        return this.inventory.items;
    }
    static getItemQuantity(productId: number): number {
        const item = this.inventory.items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    }
}


