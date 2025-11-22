import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";

/**
 * @namespace com.logaligroup.employees.utils
 */

export default class Utils {
    
    private controller : Controller;
    private model : ODataModel;
    private resourceBundle : ResourceBundle;

    constructor (controller : Controller) {
        this.controller = controller;
        this.model = (this.controller.getOwnerComponent() as UIComponent).getModel("zinvoices") as ODataModel;
        this.resourceBundle = ((this.controller.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
    }

    public getEmail () : string {
        return "test@logaligroup.com";
    }

    public async read (object? : JSONModel) : Promise<void | ODataListBinding>  {
        const model = this.model;
        const path = object?.getProperty("/path");
        const filters = object?.getProperty("/filters");
        const resourceBundle = this.resourceBundle;

        return new Promise((resolve, reject) => {
            model.read(path, {
                filters: filters,
                success: (data : ODataListBinding) =>{
                    resolve(data);
                },
                error: () => {
                    reject();
                    MessageBox.error(resourceBundle.getText("error") || 'no text defined');
                }
            });
        });
    }

    // action = create, read, update, delete
    public async crud (action : string, object? : JSONModel) : Promise<void> {
        const resourceBundle = this.resourceBundle;

        MessageBox.confirm(resourceBundle.getText("question") || 'no text defined', {
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose : async (response : string) => {
                if (MessageBox.Action.OK == response) {
                    switch (action) {
                        case 'create': await this.create(object);
                        case 'update': await this.update(object);
                        case 'delete': break;
                    }
                }
            }
        });
    }

    private async create (object? : JSONModel) : Promise<void> {

        const model = this.model;
        const path = object?.getProperty("/path");
        const body = object?.getProperty("/data");
        const resourceBundle = this.resourceBundle;

        console.log(body);

        model.create(path, body, {
            success: () => {
                MessageBox.success(resourceBundle.getText("success") || 'no text defined');
            },
            error: () => {
                MessageBox.error(resourceBundle.getText("error") || 'no text defined');
            }
        });
    }

    private async update (object? : JSONModel) : Promise<void> {
        
        const model = this.model;
        const path = object?.getProperty("/path");
        const body = object?.getProperty("/data");
        const resourceBundle = this.resourceBundle;

        model.update(path, body, {
            success: () => {
                MessageBox.success(resourceBundle.getText("success") || 'no text defined');
            },
            error: () => {
                MessageBox.error(resourceBundle.getText("error") || 'no text defined');
            }
        });

    }
}