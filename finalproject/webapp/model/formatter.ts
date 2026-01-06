import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Controller from "sap/ui/core/mvc/Controller";
import ResourceModel from "sap/ui/model/resource/ResourceModel";

export default {

    typeText: function (this: Controller, status: string): string | undefined {

        const resourceModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
        const resourceBundle = resourceModel.getResourceBundle() as ResourceBundle;

        switch (status) {
            case '1': return resourceBundle.getText("tipoempleado1"); //New
            case '2': return resourceBundle.getText("tipoempleado2"); //New
            case '3': return resourceBundle.getText("tipoempleado3"); //New
            default: return status;
        }

    },

}