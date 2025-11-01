import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";


/**
 * @namespace com.logaligroup.invoices.controller
 */
export default class App extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        // Set data model on the view
        /*       this.getView()?.setModel( Models.createRecipient() );
       /*
               // set i18n model on the view
       
               var i18nModel = new ResourceModel({ bundleName : "com.logaligroup.invoices.i18n.i18n"});
               this.getView()?.setModel(i18nModel, "i18n");
       */
    }

    public onShowHello(): void {
        /*
        // read from i18n
        var oBundle = this.getOwnerComponent()?.getModel("i18n")?.getResourceBundle();
        //read property from data model
        var sRecipient = this.getView()?.getModel()?.getProperty("/recipient/name");
        var sMsg = oBundle.getText("helloMsg", [sRecipient]);
        MessageToast.show(sMsg);
        */
    }
}