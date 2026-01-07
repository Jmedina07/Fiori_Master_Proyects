import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import ResponsiveGridLayout from "sap/ui/layout/form/ResponsiveGridLayout";

/**
 * @namespace com.logaligroup.finalproject.utils
 */

export default class Utils {

    private controller: Controller;
    private model: ODataModel;
    private resourceBundle: ResourceBundle;

    constructor(controller: Controller) {
        this.controller = controller;
        this.model = (this.controller.getOwnerComponent() as UIComponent).getModel("zemployees") as ODataModel;
        this.resourceBundle = ((this.controller.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
    }

    public getEmail(): string {
        return "joel@logaligroup.com";
    }

    public async read(object?: JSONModel): Promise<void | any> {
        const model = this.model;
        let path = object?.getProperty("/path");
        const filters = object?.getProperty("/filters");
        const urlParameters = model.getProperty("/urlParameters");
        const resourceBundle = this.resourceBundle;

        if (path && typeof path === 'string') {
            path = path.split('(')[0];
        }
        return new Promise((resolve, reject) => {
            model.read(path, {
                filters: filters,
                urlParameters: urlParameters,
                success: (data: ODataListBinding) => {
                    resolve(data);
                },
                // error: () => {
                //     reject();
                // }
                error: (error: any) => {
                    // El error 400 de SAP suele venir en error.responseText
                    try {
                        const oResponse = JSON.parse(error.responseText);
                        reject(oResponse);
                    } catch (e) {
                        reject(error);
                    }
                }
            });
        });
    }

    // action = create, read, update, delete
    //public async crud(action: string, object?: JSONModel): Promise<void | ODataListBinding> {
    public async crud(action: string, object?: JSONModel): Promise<void | ODataListBinding> {
        //console.log(action);
        const resourceBundle = this.resourceBundle;

        return new Promise((resolve, reject) => {
            MessageBox.confirm(resourceBundle.getText("question") || 'no text defined', {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: async (response: string) => {
                    if (MessageBox.Action.OK == response) {
                        switch (action) {
                            case 'create': resolve(await this.create(object)); break;
                            case 'createdetail': resolve(await this.createdetail(object)); break;
                            case 'delete': resolve(await this.delete(object)); break;
                        }
                    }
                }
            });
        });
    }

    private async create(object?: JSONModel): Promise<void | ODataListBinding> {

        const model = this.model;
        const path = object?.getProperty("/path");
        const body = object?.getProperty("/data");
        const resourceBundle = this.resourceBundle;
        //console.log(object);
        //console.log(body);
        const result = new Promise((resolve, reject) => {
            model.create(path, body, {
                success: async () => {
                    //MessageBox.success(resourceBundle.getText("success") || 'no text defined');
                    resolve(await this.read(object));

                },
                error: () => {
                    //MessageBox.error(resourceBundle.getText("error") || 'no text defined');
                    reject();
                }
            });
        }) as Promise<void | ODataListBinding>;
        console.log("Resultado de insert", result)
        return result;
    }
    private async createdetail(object?: JSONModel): Promise<void | ODataListBinding> {

        const model = this.model;
        const path = object?.getProperty("/path");
        const body = object?.getProperty("/data");
        const resourceBundle = this.resourceBundle;
        //console.log(object);
        //console.log(body);
        const result = new Promise((resolve, reject) => {
            model.create(path, body, {
                success: async () => {
                    MessageBox.success(resourceBundle.getText("success") || 'no text defined');
                    resolve(await this.read(object));

                },
                error: () => {
                    //MessageBox.error(resourceBundle.getText("error") || 'no text defined');
                    reject();
                }
            });
        }) as Promise<void | ODataListBinding>;
        //console.log("Resultado de insert", result)
        return result;
    }

    private async delete(object?: JSONModel): Promise<void | ODataListBinding> {

        //const model = this.model;
        const path = object?.getProperty("/path");
        //const body = object?.getProperty("/data");
        const resourceBundle = this.resourceBundle;

        //console.log("Remove Utils");

        return new Promise((resolve, reject) => {
            this.model.remove(path, {
                success: async () => {
                    MessageBox.success(resourceBundle.getText("success") || 'no text defined');
                    resolve(await this.read(object));
                },
                error: () => {
                    MessageBox.error(resourceBundle.getText("error") || 'no text defined');
                    reject();
                }
            });
        });

    }

}