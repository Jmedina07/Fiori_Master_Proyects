import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Controller from "sap/ui/core/mvc/Controller";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import NumberFormat from "sap/ui/core/format/NumberFormat";

export default {

    statusText: function (this: Controller, status: string): string | undefined {

        const resourceModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
        const resourceBundle = resourceModel.getResourceBundle() as ResourceBundle;

        switch (status) {
            case 'A': return resourceBundle.getText("invoicesStatusA"); //New
            case 'B': return resourceBundle.getText("invoicesStatusB"); //New
            case 'C': return resourceBundle.getText("invoicesStatusC"); //New
            default: return status;
        }

    },

    decimalSeparator: function (this: Controller, iValue: string): string | undefined {
        
        if (iValue === null || iValue === undefined) {
            return "";
        }
        var oFloatFormat = NumberFormat.getFloatInstance({
            decimals: 2,
            groupingEnabled: false,
            decimalSeparator: ","
        });
        return oFloatFormat.format(iValue);

    }

}