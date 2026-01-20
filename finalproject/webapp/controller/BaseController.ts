import Controller from "sap/ui/core/mvc/Controller";
import Router from "sap/ui/core/routing/Router";
import Component from "../Component";
import Model from "sap/ui/model/Model";
import View from "sap/ui/core/mvc/View";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import History from "sap/ui/core/routing/History";
import EventBus from "sap/ui/core/EventBus";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class BaseController extends Controller {

    public getRouter(): Router {
        return (this.getOwnerComponent() as Component).getRouter();
    }

    public getModel(name?: string): Model {
        return this.getView()?.getModel(name) as Model;
    }

    public setModel(model: Model, name?: string): View | undefined {
        return this.getView()?.setModel(model, name);
        
    }

    public getResourceBundle(): ResourceBundle {
        let model = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
        return model.getResourceBundle() as ResourceBundle;
    }

    public onNavToBack(): void {
        let sPreviousHash = History.getInstance().getPreviousHash();
        if (sPreviousHash !== undefined) {
            history.go(-1);
        } else {
            const fcl = this.getView()?.getParent()?.getParent() as FlexibleColumnLayout;

            if (fcl && fcl.isA("sap.f.FlexibleColumnLayout")) {
                fcl.setLayout("OneColumn"); 
            }
            
            this.getRouter().navTo("menu", {}, true);
        }
    }

    public getEventBus(): EventBus {
        return this.getEventBus() as EventBus;
    }

}