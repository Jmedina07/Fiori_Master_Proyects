import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import BaseController from "./BaseController";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Menu extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }

    public oncreateEmployee(event: Event): void {

        const router = this.getRouter();
        router.navTo("RouteNewEmployee");
    }

    public onviewEmployee(event: Event): void {

        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "TwoColumnsMidExpanded");
        const router = this.getRouter();
        router.navTo("RouteEmployees");
    }

}