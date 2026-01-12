import { InteractableObject } from "../interactableObject/interactable-object";
import { Coordinates } from "../coordinates/coordinates";
import { Gamefield } from "../gamefield/gamefield";
import { Direction } from "../../enums/direction";
import { RenderingService } from "../../services/rendering.service";
import { RenderObject } from "../rendering/render-object";
import { RenderType } from "../../enums/render-type";

export class SlotMachine extends InteractableObject {

	private _slotsRenderObj: RenderObject;

	constructor(x: number, y: number, gamefield: Gamefield) {
		const z = Gamefield.fieldsize * 1
		super(
			"slot-machine",
			new Coordinates(x, y, Gamefield.fieldsize),
			Gamefield.fieldsize,
			Gamefield.fieldsize / 2,
			[Direction.DOWN],
			RenderType.RECT,
			undefined,
			undefined,
			"#3d3d3dff",
			["#242424ff"],
            50
		);
    
		const width = this._width;
		const height = width * 9/16;
		
		// Erstelle RenderObject mit Typ SLOT_MACHINE für interaktive Slots
		this._slotsRenderObj = new RenderObject(
			"slot-machine-slots",
			RenderType.SLOT_MACHINE,
			x,
			y + Gamefield.fieldsize / 2,
			Gamefield.fieldsize * 1,
			width,
			height,
			80,
			undefined,
			undefined,
			undefined,
			undefined
		);
		RenderingService.instance().addRenderObject(this._slotsRenderObj);
		
		this.position.z = z;
        gamefield.addToInteractableObjects(this.renderObject);
	}

	get x(): number { return this.position.x; }
	set x(v: number) { this.position = new Coordinates(v, this.position.y); }

	get y(): number { return this.position.y; }
	set y(v: number) { this.position = new Coordinates(this.position.x, v); }

	get z(): number { return this.position.z; }
	set z(v: number) { this.position = new Coordinates(this.position.x, this.position.y, v); }

	set priority(v: number) { this._slotsRenderObj.priority = v; }

	
}

