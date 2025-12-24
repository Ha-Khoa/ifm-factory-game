import {PrepMachine} from './prep-machine';
import {Products} from '../product/products';
import {Gamefield} from '../gamefield/gamefield';

export class PrepMachineManager {
    private gamefield: Gamefield;
    private static prepMachines: PrepMachine[] = [];

    constructor (gamefield: Gamefield){
        this.gamefield = gamefield;
        this.initializeMachines();
    }

    private initializeMachines(): void {
        //Iron gear machine - positioned near player start
        const ironGearMachine = new PrepMachine (
            14 * Gamefield.fieldsize,
            5 * Gamefield.fieldsize,
            Gamefield.fieldsize,
            Gamefield.fieldsize,
            3000
        );
        ironGearMachine.setRecipe(7, 8);  //Eingang: Iron Ingot (ID 7), Ausgang: Iron Gear (ID 8)

        PrepMachineManager.prepMachines.push(ironGearMachine);
        console.log('PrepMachine created:', ironGearMachine.name, 'at position:', ironGearMachine.x, ironGearMachine.y);
        this.updateGamefield();
        console.log('PrepMachines in gamefield:', PrepMachineManager.prepMachines.length);
    }

    update(): void {
        PrepMachineManager.prepMachines.forEach(prep_machine => {
            prep_machine.update();
        });
    }

    private updateGamefield(): void {
        this.gamefield.updatePrepMachines(PrepMachineManager.prepMachines);
    }

    static addMachine(machine: PrepMachine, gamefield?: Gamefield): void {
        this.prepMachines.push(machine);

        if (gamefield) {
            gamefield.updatePrepMachines(this.prepMachines);
        }
    }

    static addMachineWithRecipe(x: number, y: number, inputProductId: number, outputProductId: number, processingTime: number, gamefield?: Gamefield): PrepMachine {
        const machine = new PrepMachine(
            x,
            y,
            Gamefield.fieldsize,
            Gamefield.fieldsize,
            processingTime,
        );
        machine.setRecipe(inputProductId, outputProductId);

        this.prepMachines.push(machine);
        
        if (gamefield) {
            gamefield.updatePrepMachines(this.prepMachines);
        }
        
        return machine;
    }

    static removeMachine(name: string, gamefield?: Gamefield): boolean {
        const index = this.prepMachines.findIndex(machine => machine.name === name);
        if (index !== -1) {
            this.prepMachines.splice(index, 1);
            
            if (gamefield) {
                gamefield.updatePrepMachines(this.prepMachines);
            }
            return true;
        }
        return false;
    }

    static getPrepMachines(): PrepMachine[] {
        return this.prepMachines;
    }

    static getPrepMachineByName(name: string): PrepMachine | undefined {
        return this.prepMachines.find(machine => machine.name === name);
    }

    refreshGamefield(): void {
        this.updateGamefield();
    }

    static reset(gamefield?: Gamefield): void {
        this.prepMachines = [];
        
        if (gamefield) {
            gamefield.updatePrepMachines(this.prepMachines);
        }
    }
}
