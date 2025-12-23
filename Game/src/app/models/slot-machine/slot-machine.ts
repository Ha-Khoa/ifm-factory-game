import { InteractableObject } from "../interactableObject/interactable-object";
import { Coordinates } from "../coordinates/coordinates";
import { Gamefield } from "../gamefield/gamefield";
import { Direction } from "../../enums/direction";
import { RenderingService } from "../../services/rendering.service";

export class SlotMachine extends InteractableObject {

	constructor(x: number, y: number, gamefield: Gamefield) {
		super(
			"slot-machine",
			new Coordinates(x, y),
			Gamefield.fieldsize,
			Gamefield.fieldsize / 2,
			Gamefield.fieldsize * 1.5 ,
			[Direction.UP],
			"rect",
			undefined,
			undefined,
			"rgba(220, 245, 108, 1)",
			["rgba(197, 206, 109, 1)"],
            0
		);

        gamefield.addToInteractableObjects(this.renderObject);
	}

	get x(): number { return this.position.x; }
	set x(v: number) { this.position = new Coordinates(v, this.position.y); }

	get y(): number { return this.position.y; }
	set y(v: number) { this.position = new Coordinates(this.position.x, v); }
}

