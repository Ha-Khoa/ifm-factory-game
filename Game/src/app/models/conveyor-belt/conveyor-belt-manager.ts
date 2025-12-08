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
       //Rohr Materialien wird hier erstellt
       ConveyorBeltManager.conveyorBelts.push(new ConveyorBelt(
           12*50,
           12*50,
           5*50,
           50,
           'right',
           0.1,
           true,
           2000,
           10
       ));


       this.updateGamefield();
   }


   update(): void{
       const currentTime = Date.now();
       const deltaTime = this.lastUpdateTime === 0? 16: currentTime - this.lastUpdateTime;
       this.lastUpdateTime = currentTime;


       ConveyorBeltManager.conveyorBelts.forEach(conveyor => {
           conveyor.update(deltaTime);
       });
   }


   private updateGamefield(): void {
       this.gamefield.updateConveyorBelts(ConveyorBeltManager.conveyorBelts);
   }


   static addConveyorBelt(conveyor: ConveyorBelt, gamefield?: Gamefield): void {
       this.conveyorBelts.push(conveyor);


       if (gamefield) {
           gamefield.updateConveyorBelts(this.conveyorBelts);
       }
   }


   static removeConveyorBelt(id: number, gamefield?: Gamefield): boolean {
       const index = this.conveyorBelts.findIndex(conv => conv.getConveyorId() === id);
       if (index !== -1) {
           this.conveyorBelts.splice(index, 1);
          
           if (gamefield) {
               gamefield.updateConveyorBelts(this.conveyorBelts);
           }
           return true;
       }
       return false;
   }


   static getConveyorBelts(): ConveyorBelt[] {
       return this.conveyorBelts;
   }


   static getConveyorBeltById(id: number): ConveyorBelt | undefined {
       return this.conveyorBelts.find(conv => conv.getConveyorId() === id);
   }


   static getConveyorAt(x: number, y: number, width: number, height: number): ConveyorBelt | null {
       return this.conveyorBelts.find(conveyor =>
           x <= conveyor.x + conveyor.width && x + width >= conveyor.x &&
           y <= conveyor.y + conveyor.height && y + height >= conveyor.y
       ) || null;
   }


   static getConveyorsWithReadyProducts(): ConveyorBelt[] {
       return this.conveyorBelts.filter(conveyor => conveyor.getReadyProducts().length > 0);
   }


   static getConveyorRenderObjects(): RenderObject[] {
       return this.conveyorBelts.map(conveyor => conveyor as RenderObject);
   }


   refreshGamefield(): void {
       this.updateGamefield();
   }


   static reset(gamefield?: Gamefield): void {
       this.conveyorBelts.forEach(conveyor => {
           while (conveyor.takeProduct() !== null) {
           }
       });
       this.conveyorBelts = [];
      
       if (gamefield) {
           gamefield.updateConveyorBelts(this.conveyorBelts);
       }
   }
}


