
export class Machine {

    static lastID: number = 0;
    id: number;
    x: number;
    y: number;
    name!: string;
    productionRate!: number;
    accessDirection!: string;
    inputRequirements!: { [resource: string]: number };
    outputProduct!: string; //hier muss noch mit Product Klasse ersetzt werden
    constructor(x: number, y: number, name: string, productionRate: number, accessDirection: string, outputProduct: string, inputRequirements: { [resource: string]: number })
    {
        this.x = x;
        this.y = y;
        this.id = Machine.lastID++;
        this.name = name;
        this.productionRate = productionRate;
        this.accessDirection = accessDirection;
        this.inputRequirements = inputRequirements;
        this.outputProduct = outputProduct;
    }


}
