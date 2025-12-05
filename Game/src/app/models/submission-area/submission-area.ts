import { Coordinates } from "../coordinates/coordinates";
import { Orders } from "../orders/orders";
import { Product } from "../product/product";
import { InteractableObject } from "../interactableObject/interactable-object";
import { Direction } from "../../enums/direction";
import { Package } from "../package/package";

export class SubmissionArea extends InteractableObject {

    constructor(position: Coordinates, width: number, height: number) {
        // Initialize InteractableObject with all directions allowed
        super(
            "submission-area",
            position,
            width,
            height,
            50,
            [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT],
            "rect",
            undefined,
            undefined,
            "rgba(255, 122, 240, 1)",
            ["rgba(255, 92, 236, 1)", "rgba(255, 58, 232, 1)", "rgba(255, 22, 228, 1)", "rgba(255, 0, 225, 1)"]
        );

    }

    addPackage(packObj: Package): boolean
    {
        for (let order of Orders.getActiveOrders()) {
            for (let product of order.items) {
                console.log("items")
            }
    }
    return true
}


}
