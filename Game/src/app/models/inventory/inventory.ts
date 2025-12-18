import {Inventory, InventoryItem} from "../../interfaces/inventory";
import {Product} from "../product/product";
import {Machine} from "../machine/machine";

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



    //Übertragung der Produkte von Maschinen zum Inventar und umgekerht

    static async transferToMachine(machine: Machine, product: Product):Promise<boolean> {
        if (!this.hasProduct(product.id, 1)) {
            console.log(`Nicht genug ${product.name} im Inventar`);
            return false;
        }
        if (!this.canMachineAccept(machine, product)){
            console.log(`Maschine kann ${product.name} nicht akzeptieren`);
            return false;
        }

        if (this.doesMachineHaveProduct(machine, product)){
            console.log(`Maschine hat ${product.name} bereits`);
            return false;
        }


        try {
            const result = await machine.addProduct(product);
            if (result === true){
                this.removeFromInventory(product.id, 1);
                this.addToInventory(product, 1);
                console.log(`${product.name} zu ${machine.name} hinzugefügt`);
                return true;
            }
            else {
                console.log(`${machine.name} hat kann ${product.name} nicht produzieren`);
                this.addToInventory(product, 1);
                return true;
            }
        }
        catch (error) {
            console.error('Fehler beim Machine-Transfer:', error);
            this.addToInventory(product, 1);
            return false;
        }

    }

    static takeAllFromMachine(machine: Machine): boolean {
        if (machine.inventory.length === 0){
            console.log(`${machine.name} ist leer`);
            return false;
        }
        let success = true;
        while (machine.inventory.length > 0){
            const productRequirements = machine.inventory.pop();
            if (productRequirements && this.getAvailableSlots()){
                this.addToInventory(productRequirements.product, 1);
                console.log(`${productRequirements.product.name} von ${machine.name} genommen`);
            }
            else if (productRequirements){
                machine.inventory.push(productRequirements);
                success = false;
                console.log(`Nicht genug Platz im Inventar für ${productRequirements.product.name}`);
                break;
            }
        }
        return success;
    }

    static takeProductFromMachine(machine: Machine, productName: string): boolean {
        const productIndex = machine.inventory.findIndex(productRequirements => productRequirements.product.name === productName);
        if (productIndex === -1){
            console.log(`${productName} nicht in ${machine.name} gefunden`);
            return false;
        }

        if (!this.getAvailableSlots()){
            console.log(`Nicht genug Platz im Inventar für ${productName}`);
            return false;
        }

        const productRequirements = machine.inventory[productIndex];
        machine.inventory.splice(productIndex, 1);
        this.addToInventory(productRequirements.product, 1);
        console.log(`${productRequirements.product.name} von ${machine.name} genommen`);
        return true;
    }


    private static canMachineAccept(machine: Machine, product: Product): boolean {
        if (!machine.unlocked){
            return false;
        }
        return machine.inputRequirements.some(productRequirements => productRequirements.product.name === product.name);
    }

    private static doesMachineHaveProduct(machine: Machine, product: Product): boolean {
        if(!machine.unlocked){
            return false;
        }
        return this.amountOfItemsInMachineInventory(machine, product) > 0;
    }

    private static amountOfItemsInMachineInventory(machine:Machine, product: Product): number {
      machine.inventory.forEach(invRequirements => {
        if(invRequirements.product.name === product.name){
          return invRequirements.quantity;
        }
        return 0;
      });
      return 0;
    }

    static hasProduct(productId: number, quantity: number): boolean {
        return this.getItemQuantity(productId) >= quantity;
    }

    static isMachineReady(machine: Machine): boolean {
        return machine.inputRequirements.every(productRequirements => machine.inventory.some(invRequirements => invRequirements.product.name === productRequirements.product.name));
    }
}






