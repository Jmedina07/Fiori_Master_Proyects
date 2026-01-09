import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import BaseController from "./BaseController";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import { URLHelper } from "sap/m/library";

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
    public onPedido(event: Event): void {

        const sUrl = "https://9b3a5cb2trial-dev-c25c385-2-approuter.cfapps.us10-001.hana.ondemand.com";

        // El segundo parámetro 'true' indica que se abra en una pestaña nueva
        URLHelper.redirect(sUrl, true);
    }

}