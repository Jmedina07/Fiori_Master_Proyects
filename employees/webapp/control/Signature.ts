import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import { MetadataOptions } from "sap/ui/core/Element";
import SignaturePad from "signature_pad";
/**
 * @namespace com.logaligroup.employees.control
 */
export default class Signature extends Control {

    constructor(idOrSettings?: string | $SignatureSettings);
    constructor(id?: string, settings?: $SignatureSettings);
    constructor(id?: string, settings?: $SignatureSettings) { super(id, settings); }


    private signature : SignaturePad;
    private flag : boolean = false;

    static readonly metadata: MetadataOptions = {
        properties: {
            width: {
                type: 'sap.ui.core.CSSSize',
                defaultValue: '300px'
            },
            height: {
                type : 'sap.ui.core.CSSSize',
                defaultValue: '150px'
            },
            backgroundColor: {
                type: 'sap.ui.core.CSSColor',
                defaultValue: 'white'
            }
        }
    }

    init () : void {

    }

    onAfterRendering(oEvent: jQuery.Event): void | undefined {
        const canvas  = document.querySelector("canvas") as HTMLCanvasElement;
        this.signature = new SignaturePad(canvas);
        this.flag = false;

        canvas.addEventListener("pointerdown",  ()=> {
            console.log("Esta haciendo su firma");
            this.flag = true;
        });

        try {

        } catch (error) {
            console.log(error);
        }
    }

    public clear () : void {
        this.signature.clear();
        this.flag = false;
    }

    public isFill () : boolean {
        return this.flag;
    }

    public getSignature () : string {
        return this.signature.toDataURL();
    }

    public setSignature (sSignature : string) : void {
        this.signature.fromDataURL(sSignature, {width: 300, height: 150});
    }

    renderer = {
        apiVersion: 4,
        render : (rm: RenderManager, control: Signature) => {

            rm.openStart("div",control);
            rm.class("signature");
            rm.openEnd();
                rm.openStart("canvas",control);
                rm.openEnd();
                rm.close("canvas");
            rm.close("div");

        }
    }
}