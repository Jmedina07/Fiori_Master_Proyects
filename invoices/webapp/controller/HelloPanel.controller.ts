import Controller from "sap/ui/core/mvc/Controller";
import ResourceBundle from "sap/base/i18n/ResourceBundle";;
import MessageToast from "sap/m/MessageToast";
import UIComponent from "sap/ui/core/UIComponent";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Dialog from "sap/m/Dialog"
import View from "sap/ui/core/mvc/View";
import Fragment from "sap/ui/core/Fragment";

/**
 * @namespace com.logaligroup.invoices.controller
 */
export default class HelloPanel extends Controller {

    private dialog : Dialog;

    public onInit(): void | undefined {
        
    }
    public onShowMessage () : void {

        //Primera Manera Tiene que cargar la vista primero
        //let resourceModel = ( this.getView() as View ).getModel("i18n") as ResourceModel;
        //Segunda Manera se carga desde el principio
        let resourceModel = ( this.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel;
        let sMessage = (resourceModel.getResourceBundle() as ResourceBundle ).getText("helloWorld") as string;
        // read from i18n
        MessageToast.show(sMessage);

    }

    public async onOpenDialog() : Promise<void> {

        let view = this.getView() as View;

        if(!this.dialog){
            this.dialog??= await Fragment.load({
                id: view.getId(),
                name: "com.logaligroup.invoices.fragment.HelloDialog",
                controller: this
            }) as Dialog;
        }
        view.addDependent(this.dialog);
        this.dialog.open();
    }
    public onCloseDialog() : void{
        this.dialog.close();
    }
}