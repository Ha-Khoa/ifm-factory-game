import { Coordinates } from "../coordinates/coordinates";
import { Orders } from "../orders/orders";
import { InteractableObject } from "../interactableObject/interactable-object";
import { Direction } from "../../enums/direction";
import { Package } from "../package/package";
import { RenderType } from "../../enums/render-type";
import {PlayerService} from '../../services/player.service';
import { SubmissionAnimation } from "./submission-animation";

export class SubmissionArea extends InteractableObject {

    playerService:PlayerService;
    private _submissionAnimation!: SubmissionAnimation;
    private _updateAnimation: boolean = false;
    private _packagesToPick: number = 0;

    constructor(position: Coordinates, width: number, height: number, playerService: PlayerService) {
        // Initialize InteractableObject with all directions allowed
      super(
            "submission-area",
            position,
            width,
            height,
            [Direction.UP, Direction.DOWN, Direction.LEFT],
            RenderType.RECT,
            undefined,
            undefined,
            "#7D0A0A",
            ["#BF3131","#EAD196"]
        );
      this.playerService = playerService;
      this._submissionAnimation = new SubmissionAnimation(this._position);
    }

    /**
     * Processes the given package by comparing its contents with active orders, completing the order if it matches.
     * Updates the HUD with rewards and money for completed orders and generates a new random order.
     *
     * @param {Package} packObj - The package object containing a list of products.
     * @return {boolean} - Returns true if an active order is successfully completed using the given package. Returns false otherwise.
     */
    addPackage(packObj: Package): boolean {
        const packageIdsSet = new Set<number>();
        for (const prod of packObj.products) {
            packageIdsSet.add(prod.id);
        }
        for (const order of Orders.getActiveOrders()) {
            const orderIdsSet = new Set<number>();
            let rightOrder = true;
            for (const item of order.items) {
                orderIdsSet.add(item.product.id);
                if (!(packageIdsSet.has(item.product.id))) {
                    rightOrder = false;
                    break;
                }
            }
            if(orderIdsSet.size !== packageIdsSet.size) {
                rightOrder = false;
                continue;
            }
            for (let id of packageIdsSet) {
                if(rightOrder && order.items.filter(item => item.product.id === id)[0].quantity ===
                   packObj.products.filter(prod => prod.id === id).length) {
                } else {
                    rightOrder = false;
                }
            }
            if (rightOrder) {
                this.playerService.addMoney(order.grants);
                this.playerService.addScore(order.reward);
                Orders.completeOrder(order.id);
                Orders.generateRandomOrder();
                this._updateAnimation = true;
                this._packagesToPick += 1;
                this.updateAnimation();
                return true;
            }
        }
        

        // Wrong order submitted or no active orders exist
        this.playerService.removeScore(15);
        this.playerService.removeMoney(20).subscribe({
          error: (err) => console.error("Failed to remove money for wrong submission:", err.message)
        });
        return false;
    }

    updateAnimation()
    {
        if(this._updateAnimation)
        {
            if(this._submissionAnimation.pickProduct())
            {
                this._packagesToPick -= 1;
                if(this._packagesToPick < 1)
                {
                    this._updateAnimation = false;
                }
            }
            this._submissionAnimation.updatePackage();
        }
    }


}
