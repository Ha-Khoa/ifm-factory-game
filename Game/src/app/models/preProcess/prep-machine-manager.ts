import {PrepMachine} from './prep-machine';
import {Products} from '../product/products';
import {Gamefield} from '../gamefield/gamefield';

export class PrepMachineManager {
    private prepMachines: PrepMachine[] = [];
    private gamefield: Gamefield;

    constructor (gamefield: Gamefield){
        this.gamefield = gamefield;
    }

    initializeMachines(): void {
        //Iron gear machine
        const ironGearMachine = new PrepMachine (
            5 * Gamefield.fieldsize,
            10 * Gamefield.fieldsize,
            Gamefield.fieldsize,
            Gamefield.fieldsize,
            3000
        );
        ironGearMachine.setRecipe(7, 8);  //Eingang: Iron Ingot (ID 7), Ausgang: Iron Gear (ID 8)

        this.prepMachines = [ironGearMachine];

        this.prepMachines.forEach(machine => {
            this.gamefield.addToInteractableObjects(machine);
        });
    }

    update(): void {
        this.prepMachines.forEach(machine => {
            machine.update();
        });
    }

    getMachines(): PrepMachine[] {
        return this.prepMachines;
    }

    addMachine(x: number, y: number, inputProductId: number, outputProductId: number, processingTime: number): PrepMachine {
        const machine = new PrepMachine(
            x,
            y,
            Gamefield.fieldsize,
            Gamefield.fieldsize,
            processingTime,
        );
        machine.setRecipe(inputProductId, outputProductId);

        this.prepMachines.push(machine);
        this.gamefield.addToInteractableObjects(machine);
        return machine;
    }
}
