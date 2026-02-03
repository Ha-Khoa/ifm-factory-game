import { Coordinates } from "../coordinates/coordinates";
import { RenderObject } from "../rendering/render-object";
import { RenderType } from "../../enums/render-type";
import { RenderingService } from "../../services/rendering.service";
import { Gamefield } from "../gamefield/gamefield";
import { Direction } from "../../enums/direction";

export class SubmissionAnimation {

    private _positionEmployee!: Coordinates;
    private _positionTruck!: Coordinates;
    private _positionPackage!: Coordinates;
    private _positionSubArea!: Coordinates;

    private _employeeRenderObj!: RenderObject;
    private _truckRenderObj!: RenderObject;
    private _packageRenderObj!: RenderObject;

    private _walkingAnimation!: string[];
    private _holdingAnimation!: string[];

    private _packageSize!: number;
    private _heightEmployee!: number;
    private _widthEmployee!: number;

    private _submissionCoordinates!: Coordinates;

    private _picked: boolean = false;

    private _standStillTimer: number = 0;
    private _startLKWTimer: number = 0

  constructor(postitionSubArea: Coordinates) {
    this._positionEmployee = new Coordinates(0,0);
    this._positionSubArea = postitionSubArea;
    this._positionEmployee.x = 65 / 2 * Gamefield.fieldsize;
    this._positionEmployee.y = 19 / 2 * Gamefield.fieldsize;
    this._widthEmployee = Gamefield.fieldsize * 4/5;
    this._heightEmployee = this._widthEmployee * 1.35 / Math.sin(30 / 360 * 2 * Math.PI);
    this._positionEmployee.z = this._widthEmployee * 1.35 / Math.sin(30 / 360 * 2 * Math.PI);
    this._walkingAnimation = ["/images/fox/walking_5.png", "/images/fox/walking_2.png", "/images/fox/walking_3.png", "/images/fox/walking_4.png"]
    this._holdingAnimation = ["/images/fox/4-fox-holding.png", "/images/fox/3-fox-holding.png", "/images/fox/2-fox-holding.png", "/images/fox/1-fox-holding.png"]
    this._positionTruck = new Coordinates(0,0);
    this._positionTruck.x = 32 * Gamefield.fieldsize;
    this._positionTruck.y = 2 * Gamefield.fieldsize;
    this._positionTruck.z = 150;
    this._packageSize = 3/5 * Gamefield.fieldsize;
    this._submissionCoordinates = this._positionEmployee.clone
    this._truckRenderObj = new RenderObject(
        "truck",
        RenderType.IMG,
        this._positionTruck.x,
        this._positionTruck.y,
        this._positionTruck.z,
        100,
        350,
        100,
        "/images/truck_roof.png",
        "/images/truck_back.png"
    )
    this._employeeRenderObj = new RenderObject(
        "employee",
        RenderType.CARD_BOARD,
        this._positionEmployee.x,
        this._positionEmployee.y + 2/5 * Gamefield.fieldsize / 2,
        this._positionEmployee.z,
        this._widthEmployee,
        this._heightEmployee,
        (this._positionEmployee.z - 50) * -3,
        "/images/fox/fox.png",
        undefined,
        undefined,
        undefined,
        this._walkingAnimation,
        8
    )
    this._packageRenderObj = new RenderObject(
        "package-employee",
        RenderType.IMG,
        0,
        0,
        0,
        this._packageSize,
        this._packageSize,
        100,
        "/images/package.png",
        undefined
    )

    this._packageRenderObj.render = false;
    RenderingService.instance().addRenderObject(this._truckRenderObj)
    RenderingService.instance().addRenderObject(this._employeeRenderObj)
    RenderingService.instance().addRenderObject(this._packageRenderObj)
   }

  updateTruck()
  {

  }

  pickProduct() : boolean
  {
    this._employeeRenderObj.type = RenderType.GIF
    this._employeeRenderObj.animationDirection = Direction.LEFT
    if(this._positionEmployee.y < this._positionSubArea.y + 3 * Gamefield.fieldsize / 2 && !this._picked)
    {
        this._positionEmployee.y += 0.1 * RenderingService.instance().deltaTime;
        this._employeeRenderObj.y = this._positionEmployee.y + 2/5 * Gamefield.fieldsize / 2;
        return false;
    }
    else if(this._positionEmployee.x > this._positionSubArea.x + Gamefield.fieldsize && !this._picked)
    {
        this._positionEmployee.x -= 0.1 * RenderingService.instance().deltaTime;
        this._employeeRenderObj.x = this._positionEmployee.x
        return false;
    }
    this._employeeRenderObj.frames = this._holdingAnimation
    this._packageRenderObj.render = true;
    this._employeeRenderObj.animationDirection = Direction.RIGHT
    this._packageRenderObj.animationDirection = Direction.RIGHT
    this._picked = true;

    if(this._positionEmployee.x < this._submissionCoordinates.x&& this._picked)
    {
        this._positionEmployee.x += 0.1 * RenderingService.instance().deltaTime;
        this._employeeRenderObj.x = this._positionEmployee.x
        return false;
    }
    else if(this._positionEmployee.y > this._submissionCoordinates.y && this._picked)
    {
        this._positionEmployee.y -= 0.1 * RenderingService.instance().deltaTime;
        this._employeeRenderObj.y = this._positionEmployee.y + 2/5 * Gamefield.fieldsize / 2;
        return false;
    }
    this._packageRenderObj.render = false;
    this._picked = false;
    this._employeeRenderObj.type = RenderType.CARD_BOARD;
    this._employeeRenderObj.frames = this._walkingAnimation;
    return true;
  }

  updatePackage()
  {
    const dir = this._employeeRenderObj?.animationDirection ?? Direction.RIGHT;
    const pkg = this._packageRenderObj;

    const packageX = dir === Direction.RIGHT ? this._positionEmployee.x + this._widthEmployee - this._packageSize / 2 :
                     dir === Direction.LEFT ? this._positionEmployee.x - this._packageSize / 2 :
                     this._positionEmployee.x + this._widthEmployee / 2 - this._packageSize / 2 + 3;

    const packageZ = (dir === Direction.LEFT || dir === Direction.RIGHT) ? Gamefield.fieldsize * 1.5 : Gamefield.fieldsize * (1/5);

    pkg.x = packageX;
    pkg.y = this._positionEmployee.y ;
    pkg.z = packageZ ;
    pkg.priority = 350;
  }

  finishGameAnimation() : boolean
  {
    const camera = RenderingService.instance().camera
    const fov = RenderingService.instance().fov
    const dt = RenderingService.instance().deltaTime
    if(camera.x < Gamefield.cols * Gamefield.fieldsize - window.innerWidth / (2 * fov))
    {
      const edge = Gamefield.cols * Gamefield.fieldsize - window.innerWidth / (2 * fov)
      camera.x = camera.x + 0.3 * dt < edge ? camera.x + 0.3 * dt : edge;
    }
    else if(camera.y > window.innerHeight / (2 * fov * Math.cos(RenderingService.instance().angle)))
    {
      const edge = window.innerHeight / (2 * fov * Math.cos(RenderingService.instance().angle))
      camera.y = camera.y - 0.3 * dt > edge ? camera.y - 0.3 * dt : edge;
    }
    else if(this._positionEmployee.x > this._submissionCoordinates.x - 1.4 * Gamefield.fieldsize)
    {
      this._employeeRenderObj.type = RenderType.GIF
      this._employeeRenderObj.animationDirection = Direction.LEFT
      this._positionEmployee.x -= 0.1 * dt
      this._employeeRenderObj.x = this._positionEmployee.x
    }
    else if(this._positionEmployee.y > this._submissionCoordinates.y - 7.5 * Gamefield.fieldsize)
    {
      this._positionEmployee.y -= 0.1 * dt;
      this._employeeRenderObj.y = this._positionEmployee.y + 2/5 * Gamefield.fieldsize / 2;
    }
    else if(this._standStillTimer < 2000)
    {
      this._employeeRenderObj.type = RenderType.CARD_BOARD
      this._standStillTimer += dt;
    }
    else if(this._startLKWTimer < 2000)
    {
      this._employeeRenderObj.render = false;
      this._startLKWTimer += dt;
    }
    else if(this._positionTruck.y > -1000)
    {
      this._positionTruck.y -= 0.2 * dt;
      this._truckRenderObj.y = this._positionTruck.y
    }
    else return true
    return false
  }

}
