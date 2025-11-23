import { RenderObject } from "./render-object"


export class Rendering {

    
    private _renderingBuffer: RenderObject[] = [];
    private _images!: { [key: string]: HTMLImageElement };
    private _ctx!: CanvasRenderingContext2D;
    private _angle!: number;
    private height: number = 0;

    constructor(ctx: CanvasRenderingContext2D , images: { [key:string]: HTMLImageElement }, angle: number) {
        this._ctx = ctx;
        this._images = images;
        this._angle = angle;
        
    }

    addRenderObject(renderObject: RenderObject) {
        this._renderingBuffer.push(renderObject);
        this.sortRenderingBuffer();
    }

    addRenderObjects(renderObjects: RenderObject[]) {
        renderObjects.forEach((obj) =>{
            this._renderingBuffer.push(obj)
        })
        this.sortRenderingBuffer();
    }

    // Sortiert Rendering Buffer erst nach z-Wert, dann nach prirität, dann nach y-Wert
    sortRenderingBuffer() { 
        let zKoordinates = Array.from(new Set(this._renderingBuffer.map(obj => obj.z)));
        let prioritys = Array.from(new Set(this._renderingBuffer.map(obj => obj.priority)));
        zKoordinates.sort((a,b) => a - b)
        prioritys.sort((a,b) => a - b)
        console.log(prioritys)
        let newRenderBuffer : RenderObject[] = []

        zKoordinates.forEach((z) => {
            let zRenderBuffer = this._renderingBuffer.filter((obj) => obj.z === z)
            prioritys.forEach((priority) => {
                let priorityRenderBuffer = zRenderBuffer.filter((obj) => obj.priority === priority)
                priorityRenderBuffer.sort((a,b) => a.y + a.height - (b.y + b.height))
                newRenderBuffer.push.apply(newRenderBuffer, priorityRenderBuffer)
            })
            
        })

        this._renderingBuffer = newRenderBuffer

       }

    getRenderingObjektByID(id: number): RenderObject | undefined {
        {

            const obj = this._renderingBuffer.find((obj) => obj.id === id)
            if (obj) {
                return obj;
            }
            else {
            return undefined
            }
        }
    }

    getRenderingObjektByName(name: string): RenderObject | undefined {
        {

            const obj = this._renderingBuffer.find((obj) => obj.name === name)
            if (obj) {
                return obj;
            }
            else {
            return undefined
            }
        }

    }

    deleteRenderingObjektByID(id: number): void {
        this._renderingBuffer = this._renderingBuffer.filter((obj) => obj.id !== id);
    }

    deleteRenderingObjektByName(name: string): void {
        this._renderingBuffer = this._renderingBuffer.filter((obj) => obj.name !== name);
    }

    render(): void {
        this._renderingBuffer.forEach((Obj) => {
            const zTransform = Obj.z * Math.sin(this._angle)
            const yProjection = Obj.y * Math.cos(this._angle) - zTransform
            if(Obj.type === "rect")
            {  
                const layers = Obj.rectLayers!.length;
                for (let i = 0; i < layers; i++)
                {
                    this._ctx.beginPath();
                    this._ctx.fillStyle = Obj.rectLayers![i];
                    this._ctx.rect(
                        Obj.x,
                        (Obj.y + Obj.height) * Math.cos(this._angle) - (Obj.z / layers) * (layers - i) * Math.sin(this._angle),
                        Obj.width,
                        (Obj.z / layers) * (layers - i) * Math.sin(this._angle)
                    );
                    this._ctx.fill();
                }
                this._ctx.beginPath();
                this._ctx.fillStyle = Obj.rectColor!;
                this._ctx.fillRect(
                    Obj.x, 
                    yProjection,
                    Obj.width,
                    Obj.height  * Math.cos(this._angle) + 1
                );
                this._ctx.fill();
            
            }
            else if (Obj.type === "img")
            {
                this._ctx.drawImage(
                    this._images[Obj.img!],
                    Obj.x,
                    yProjection,
                    Obj.width,
                    Obj.height * Math.cos(this._angle)
                );
                if (Obj.imgWall)
                {
                this._ctx.drawImage(
                    this._images[Obj.imgWall!],
                    Obj.x,
                    yProjection + Obj.height * Math.cos(this._angle),
                    Obj.width,
                    Obj.z * Math.sin(this._angle)
                );
            }
            }
    });
    }

    get renderingBuffer()
    {
        return this._renderingBuffer;
    }

    set angle(value: number) {
        this._angle = value;
    }

    get angle(): number {
        return this._angle;
    }
}