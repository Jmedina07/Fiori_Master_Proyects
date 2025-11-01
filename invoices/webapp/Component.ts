import BaseComponent from "sap/ui/core/UIComponent";
import { createDeviceModel } from "./model/models";
import Models from  "com/logaligroup/invoices/model/models";
import ResourceModel from "sap/ui/model/resource/ResourceModel";

/**
 * @namespace com.logaligroup.invoices
 */
export default class Component extends BaseComponent {

	public static metadata = {
		manifest: "json",
        interfaces: [
            "sap.ui.core.IAsyncContentCreation"
        ]
        
	};

	public init() : void {
		// call the base component's init function
		super.init();

        // set the device model
        this.setModel(createDeviceModel(), "device");

        // enable routing
        this.getRouter().initialize();

       // Set data model on the view
        this.setModel( Models.createRecipient() );

        // set i18n model on the view

        var i18nModel = new ResourceModel({ bundleName : "com.logaligroup.invoices.i18n.i18n"});
        this.setModel(i18nModel, "i18n");        
	}
}