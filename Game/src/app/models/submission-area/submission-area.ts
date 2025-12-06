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
        "rgba(0, 255, 157, 0.4)", // Halbtransparenter Cyan-Glow
        // Schichten für den "Hologramm"-Effekt an der Seite
        ["rgba(0, 255, 157, 0.8)", "rgba(0, 200, 150, 0.6)", "rgba(0, 150, 100, 0.4)", "rgba(0, 100, 80, 0.2)"]
        );

    }

    addPackage(packObj: Package): boolean
    {
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
                    continue;
                } else {
                    rightOrder = false;
                }
            }
            if (rightOrder) {
                Orders.completeOrder(order.id);
                return true;
            }
        }
        return false;
    }


}
