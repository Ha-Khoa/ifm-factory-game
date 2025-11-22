import { Gamefield } from "../gamefield/gamefield";
import { Machine } from "./machine";
import { Products } from "../product/products";

export class MachineManager {
    private gamefield: Gamefield;
    static machines: Machine[] = [
        // Note: constructor order: x, y, width, height, name, imgUnlocked, imgLocked, accessDirection, outputProduct, inputRequirements
        new Machine(600, 400, 50, 50, "Sensor", "/images/wall.png", "/images/wall.png", "left", Products.getProductByName("Basic Sensor")!, [Products.getProductByName("Raw Silicon")!, Products.getProductByName("Circuit Board")!]),
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
