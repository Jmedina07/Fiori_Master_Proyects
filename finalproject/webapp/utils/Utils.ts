import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";

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
        return "jomeez0307@gmail.com";
    }
    public async read(object?: JSONModel): Promise<any> {
        const model = this.model;
        let path = object?.getProperty("/path");
        const filters = object?.getProperty("/filters");
        const urlParameters = object?.getProperty("/urlParameters");

        if (path && typeof path === 'string') {
            path = path.split('(')[0];
        }

        return new Promise((resolve, reject) => {
            model.read(path, {
                filters: filters,
                urlParameters: urlParameters,
                success: (data: any) => {
                    resolve(data);
                },
                error: (error: any) => {
                    if (error.statusCode === "404" || error.statusText === "Not Found") {
                        console.warn("No se encontraron registros para la ruta:", path);
                        resolve(null);
                    } else {
                        try {
                            const oResponse = JSON.parse(error.responseText);
                            reject(oResponse);
                        } catch (e) {
                            reject(error);
                        }
                    }
                }
            });
        });
    }

    public async crud(action: string, object?: JSONModel): Promise<any> {

        const resourceBundle = this.resourceBundle;

        return new Promise((resolve, reject) => {
            MessageBox.confirm(resourceBundle.getText("question") || 'no text defined', {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: async (response: string) => {
                    if (MessageBox.Action.OK == response) {
                        switch (action) {
                            case 'create': resolve(await this.create(object)); break;
                            case 'read': resolve(await this.read(object)); break;
                            case 'delete': resolve(await this.delete(object)); break;

                        }
                    }
                }
            });
        });
    }

    private async create(object?: JSONModel): Promise<any> {
        const model = this.model;
        const path = object?.getProperty("/path");
        const body = object?.getProperty("/data");
        const resourceBundle = this.resourceBundle;
    
        return new Promise((resolve, reject) => {
            model.create(path, body, {

                success: async (oData: any) => { 
                    MessageBox.success(resourceBundle.getText("success") || 'no text defined');
                    resolve(oData);

                },
                error: (oError: any) => {
                    MessageBox.error(resourceBundle.getText("error") || 'no text defined');
                    console.error("Error detallado:", oError);
                    reject();
                }
            });
        });

    }

    private delete(object?: JSONModel): Promise<void> {
        const path = object?.getProperty("/path");
        const resourceBundle = this.resourceBundle;

        return new Promise((resolve, reject) => {
            this.model.remove(path, {
                success: () => {
                    MessageBox.success(resourceBundle.getText("success") || 'Registro eliminado', {
                        onClose: async () => {
                            try {
                                resolve();
                            } catch (err) {
                                reject(err);
                            }
                        }
                    });
                },
                error: (error: any) => {
                    MessageBox.error(resourceBundle.getText("error") || 'Error al eliminar');
                    reject(error);
                }
            });
        });
    }

}