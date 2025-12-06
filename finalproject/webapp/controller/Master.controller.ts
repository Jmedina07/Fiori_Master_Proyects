import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";
import Event from "sap/ui/base/Event";
/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Master extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }
    public oncreateEmployee(event: Event): void{

        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "EndColumnFullScreen");
        const router = this.getRouter();
        console.log("Sale new Employee");      
        router.navTo("RouteNewEmployee",{ ID: 0 });
    }

    public onviewEmployee(event: Event): void{

        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "EndColumnFullScreen");
        const router = this.getRouter();
        console.log("Sale master");      
        router.navTo("RouteEmployees",{
            ID: parseInt("1") - 1            //index
        });
    }

}