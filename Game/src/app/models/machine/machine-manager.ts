import { Gamefield } from "../gamefield/gamefield";
import { Machine } from "./machine";
import { Products } from "../product/products";

export class MachineManager {
    private gamefield: Gamefield;
    static machines: Machine[] = [
        // Note: constructor order: x, y, width, height, name, imgUnlocked, imgLocked, accessDirection, outputProduct, inputRequirements
        new Machine(600, 400, 50, 50, "Sensor", "/images/wall.png", "/images/wall.png", "down", Products.getProductByName("Basic Sensor")!, [Products.getProductByName("Raw Silicon")!, Products.getProductByName("Circuit Board")!]),
        new Machine(500, 450, 50, 50, "Plastic Case", "/images/wall.png", "/images/wall.png", "left", Products.getProductByName("Plastic Case")!, [Products.getProductByName("Raw Plastic")!])
    ];

    constructor(gamefield: Gamefield) {
        this.gamefield = gamefield;

    }

    getMachines(): Machine[] {
        return MachineManager.machines;
    }

    updateUnlockedMachine(id: number)
    {
        MachineManager.machines[id].unlocked = true;
        this.gamefield.updateMachines(MachineManager.machines);

    }
}
