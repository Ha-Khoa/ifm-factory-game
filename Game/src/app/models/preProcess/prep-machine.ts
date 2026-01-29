import { Product} from '../product/product'
import { Products } from '../product/products'
import { RenderingService } from '../../services/rendering.service';
import { Gamefield } from '../gamefield/gamefield';
import { InteractableObject } from '../interactableObject/interactable-object';
import { Coordinates } from '../coordinates/coordinates';
import { Direction } from '../../enums/direction';
import { RenderType } from '../../enums/render-type';

/**
 * PrepMachine Klasse: 
 * - Idee: um das Spiel komlizierter zu machen, werden einige Produkte andere Wege verarbeiten müssen, bevor sie verkauft werden können.
 * Mit der PrepMachine können einige Produkte vorverarbeitet werden, bevor in der Maschine weiterverarbeitet oder verkauft werden können.
 * - Inspiration: Schneidebrett, Mixer in Overcooked (Fleisch erst schneiden bevor es gekocht werden kann)
 * - Ein Produkt wurde in Produktliste hinzugefügt: "Iron Ingot". Nach der Verarbeitung von "Iron Ingot" bekommen wir "Iron Gear" durch PrepMachine.
 * - Wir können in der Zukunft weitere Rezepte mit "Iron Gear" hinzufügen:
 * - Iron Ingot -> PrepMachine -> Iron Gear
 * - Iron Gear + Copper Wire -> Elektrische Motor 
 */
export class PrepMachine extends InteractableObject {
    /**
     * - Id von PrepMachine
     * - Zeit, die benötigt wird, um ein Produkt zu verarbeiten (in ms)
     * - Eingangsprodukt, das von der Maschine akzeptiert wird
     * - Ausgangsprodukt, das von der Maschine produziert wird
     * - Aktuelles Eingangsprodukt, das gerade verarbeitet wird
     * - Startzeit der Verarbeitung
     * - Status, ob die Maschine gerade verarbeitet
     * - Fortschritt der Verarbeitung (0 bis 1)
     * - Status, ob das Ausgangsprodukt bereit zur Abholung ist
     * - Rezept für die Verarbeitung (Eingangs- und Ausgangsprodukt IDs)
     */
        private static pre_machine_id: number = 0;
        private processingTime: number;
        private inputProduct?: Product;
        private outputProduct?: Product;
        private currentInput?: Product;
        private workedMillis: number = 0;
        private isProcessing: boolean = false;
        private processingProgress: number = 0;
        private outputReady: boolean = false;

        private recipe?: {
            inputId: number;
            outputId: number;
        }

        public prepFrames: string[] = [
            '/images/Products/prep-machine/frame_1.png',
            '/images/Products/prep-machine/frame_2.png',
            '/images/Products/prep-machine/frame_3.png',
            '/images/Products/prep-machine/frame_4.png'
        ];

        public prepFrameIndex: number = 0;
        public prepNextFrame: string = this.prepFrames[0];
        
        constructor(
            x: number,
            y: number,
            width: number,
            height: number,
            processingTime: number = 5000,
            inputProduct?: Product,
            outputProduct?: Product
        ) {
           super(
                `PrepMachine_${PrepMachine.pre_machine_id++}`,
                new Coordinates(x, y),
                width,
                height,
                [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT],
                RenderType.RECT,
                undefined,
                undefined,
                "#FFE797",
                ["#FCB53B", "#aa6a17ff"] 
           );
            this.processingTime = processingTime;
            this.inputProduct = inputProduct;
            this.outputProduct = outputProduct;

            if (this.inputProduct && this.outputProduct) {
                this.setRecipe(this.inputProduct.id, this.outputProduct.id);
            }
        }
        /**
         * 
         * @param inputId : Id des Eingangsprodukts (z.B. Iron Ingot (Produkt Id 7))
         * @param outputId : Id des Ausgangsprodukts (z.B. Iron Gear (Produkt Id 8))
         */
        setRecipe(inputId: number, outputId: number): void {
            this.recipe = {inputId, outputId};
            this.inputProduct = Products.getProductById(inputId);
            this.outputProduct = Products.getProductById(outputId);
        }
        /**
         * 
         * @param product - Produkt, das von der Maschine akzeptiert werden soll
         * @returns boolean - true, wenn das Produkt akzeptiert wurde, false sonst
         */
        acceptProduct(product: Product){
            if (this.canAcceptProduct(product)){
                this.startProcessing(product);
                return true;
            }
            return false;
        }

        /**
         * 
         * @param product - ProduktId
         * Startet die Verarbeitung des Produkts
         */
        private startProcessing(product: Product){
            this.currentInput = product;
            this.isProcessing = true;
            this.workedMillis = 0;
            this.processingProgress = 0;
            this.outputReady = false;

            this.prepFrameIndex = 0;
            this.prepNextFrame = this.prepFrames[0];

            console.log(`Started processing ${product.name}`)
        }
        /**
         * Aktualisiert den Status der Maschine, überprüft den Fortschritt der Verarbeitung und aktualisiert die Animation.
         * 
         */
        update(deltaMs: number, isBeingWorked: boolean = false): void{
            if (!this.isProcessing || !isBeingWorked) {
                return;
            }

            this.workedMillis += deltaMs;
            this.processingProgress = Math.min(this.workedMillis / this.processingTime, 1);
            this.updateAnimation();

            if (this.processingProgress >= 1) {
                this.completeProcessing();
            }
        }
        /**
         * Aktualisiert die Animationsframes basierend auf dem Verarbeitungsfortschritt.
         */
        private updateAnimation(): void{
            if (this.prepFrames && this.prepFrames.length > 0) {
                const frameIndex = Math.floor(this.processingProgress * this.prepFrames.length);
                this.prepFrameIndex = Math.min(frameIndex, this.prepFrames.length - 1);
                this.prepNextFrame = this.prepFrames[this.prepFrameIndex];
            }
        }
        private completeProcessing(): void {
            this.isProcessing = false;
            this.processingProgress = 1;
            this.outputReady = true;

            this.prepFrameIndex = this.prepFrames.length - 1;
            this.prepNextFrame = this.prepFrames[this.prepFrameIndex];
            console.log(`Processing complete! ${this.outputProduct?.name}`)
        }
        /**
         * 
         * @returns - Produkt - das verarbeitete Ausgangsprodukt, wenn es bereit ist, sonst null
         * Sammelt das Ausgangsprodukt, wenn es bereit ist, und setzt den Maschinenstatus zurück.
         */
        collectOutput(): Product | null{
            if (this.outputReady && this.outputProduct){
                const output = this.outputProduct.copy();
                this.outputReady = false;
                this.currentInput = undefined;
                this.processingProgress = 0;
                if (this.outputProduct.img){
                     this.outputProduct.img;
                }
                if(this.prepFrames && this.prepFrames.length > 0){
                    this.prepFrameIndex = 0;
                    this.prepNextFrame = this.prepFrames[0];
                }

                console.log(`Collected output: ${output.name}`);
                console.log(`Output image: ${output.renderObject.img}`);
                return output;
            }
            return null;
        }
        /**
         * 
         * @param product  
         * @returns boolean - ob die Produkte verarbeitet werden können
         */

        canAcceptProduct(product: Product): boolean {
                if(!this.isProcessing && !this.outputReady && this.inputProduct &&product.id === this.inputProduct.id) {
                    return true;
                }
                else{
                    return false;
                }
                    
                    
                    
        }
        getCurrentFrame(): string {
            return this.prepNextFrame;
        }
        getSate():{
            isProcessing: boolean;
            progress: number;
            outputReady: boolean;
            currentInput?: string;
            expectedOutput?: string;
        }{
            return {
                isProcessing: this.isProcessing,
                progress: this.processingProgress,
                outputReady: this.outputReady,
                currentInput: this.currentInput?.name,
                expectedOutput: this.outputProduct?.name
            };
        }
        /**
         * 
         * @returns boolean - ob die Maschine frei sind
         */
        isIdle(): boolean {
            return !this.isProcessing && !this.outputReady;
        }
        /**
         * 
         * @returns boolean - ob das Ausgangsprodukt bereit ist
         */
        isOutputReady(): boolean {
            return this.outputReady;
        }

        getProgress(): number {
            return this.processingProgress;
        }
        /**
         * Setzt die Maschine zurück auf den Anfangszustand.
         */
        reset(): void {
            this.isProcessing = false;
            this.outputReady = false;
            this.currentInput = undefined;
            this.workedMillis = 0;
            this.processingProgress = 0;
        
        
            if (this.prepFrames && this.prepFrames.length > 0) {
               this.prepFrameIndex = 0;
                this.prepNextFrame = this.prepFrames[0];
            }
        }

        isProcessingActive(): boolean {
            return this.isProcessing;
        }

        /**
         * 
         * @returns - der visuelle Zustand der Maschine
         */
        getVisualState(): {
            progress: number;
            isActive: boolean;
            hasInput: boolean;
            hasOutput: boolean;
            inputName?: string;
            outputName?: string;
        } {
            return {
                progress: this.processingProgress,
                isActive: this.isProcessing,
                hasInput: !!this.currentInput,
                hasOutput: this.outputReady,
                inputName: this.currentInput?.name,
                outputName: this.outputProduct?.name
            };
        }



}
