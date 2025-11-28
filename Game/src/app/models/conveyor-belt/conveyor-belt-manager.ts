import { ConveyorBelt } from './conveyor-belt';
import {Gamefield} from "../gamefield/gamefield";
import { RenderObject } from "../rendering/render-object";

export class ConveyorBeltManager {
    private gamefield: Gamefield;
    private static conveyorBelts: ConveyorBelt[] = [];
    private lastUpdateTime: number = 0;

    constructor(gamefield: Gamefield) {
        this.gamefield = gamefield;
        this.initializeConveyorBelts();
    }


    private initializeConveyorBelts(): void {
        ConveyorBeltManager.conveyorBelts.push(new ConveyorBelt(
            2*50,
            2*50,
            4*50,
            50,
            'right',
            0.03,
            true,
            2000,
            3
        ));

        ConveyorBeltManager.conveyorBelts.push(new ConveyorBelt(
            8*50,
            4*50,
            3*50,
            50,
            'right',
            0.02,
            false,
            0,
            4
        ));
    }
}
