import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";
import Event from "sap/ui/base/Event";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Master extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        // const router = this.getRouter();
        // router.getRoute("RouteEmployee")?.attachPatternMatched(this.onBindElement.bind(this));

    }
    private onBindElement(event: Route$PatternMatchedEvent): void {
    }

    public oncreateEmployee(event: Event): void {

        //const model = this.getModel("view") as JSONModel;
        //model.setProperty("/layout", "EndColumnFullScreen");
        const router = this.getRouter();
        console.log("Sale new Employee");
        router.navTo("newEmployee");
    }

    public onviewEmployee(event: Event): void {

        // const model = this.getModel("view") as JSONModel;
        // model.setProperty("/layout", "EndColumnFullScreen");
        const router = this.getRouter();
        console.log("Sale master");
        router.navTo("employees");
        // router.navTo("RouteEmployees",{
        //     ID: parseInt("1") - 1            //index
        // });
    }

}