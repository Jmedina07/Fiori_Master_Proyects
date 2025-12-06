import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";

/**
 * @namespace com.logaligroup.finalproject.utils
 */

export default class Utils {

    private controller: Controller;
    private model: ODataModel;
    private resourceBundle: ResourceBundle;

    constructor(controller: Controller) {
        this.controller = controller;
        this.model = (this.controller.getOwnerComponent() as UIComponent).getModel("zinvoices2") as ODataModel;
        this.resourceBundle = ((this.controller.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
    }

    public getEmail(): string {
        return "test@logaligroup.com";
    }

    public async read(object?: JSONModel): Promise<void | ODataListBinding> {
        const model = this.model;
        let path = object?.getProperty("/path");
        const filters = object?.getProperty("/filters");
        const resourceBundle = this.resourceBundle;

        if( path && typeof path === 'string' ){
            path = path.split('(')[0];
        }
        return new Promise((resolve, reject) => {
            model.read(path, {
                filters: filters,
                success: (data: ODataListBinding) => {
                    resolve(data);
                },
                error: () => {
                    reject();
                    MessageBox.error(resourceBundle.getText("error") || 'no text defined Test');
                }
            });
        });
    }

    // action = create, read, update, delete
    // public async crud(action: string, object?: JSONModel): Promise<void | ODataListBinding> {
    // }

}