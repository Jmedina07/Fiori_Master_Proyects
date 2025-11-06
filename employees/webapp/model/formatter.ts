import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Controller from "sap/ui/core/mvc/Controller";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";

export default {

    statusText: function (this: Controller, status: string): string | undefined {

        const resourceModel = this.getOwnerComponent()?.getModel("view") as JSONModel;
        //const model = this.getModel("status") as JSONModel;
        // const resourceBundle = resourceModel.getResourceBundle() as ResourceBundle;



        // switch (status) {
        //     case 'A': return resourceBundle.getText("invoicesStatusA"); //New
        //     case 'B': return resourceBundle.getText("invoicesStatusB"); //New
        //     case 'C': return resourceBundle.getText("invoicesStatusC"); //New
        //     default: return status;
        // }

        return status;

    }

}