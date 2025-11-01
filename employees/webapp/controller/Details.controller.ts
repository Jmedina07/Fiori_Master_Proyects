import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import BaseController from "./BaseController";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";


/**
 * @namespace com.logaligroup.employees.controller
 */
export default class Details extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        const router = this.getRouter();
        router.getRoute("RouteDetails")?.attachMatched(this.onBindElement.bind(this));
    }

    private onBindElement(event: Route$PatternMatchedEvent): void {
        // console.log(event.getParameters());
        let arg = event.getParameter("arguments") as any;
        let index = arg.ID;
        const view = this.getView() as View;

        view.bindElement({
            path: '/Employees/'+index,
            model: 'employees',
            events: {
                change: () => {

                },
                dataRequested: () => {
                    view.setBusy(true)
                },  
                dataReceived: () => {
                    view.setBusy(false)
                }                              
            }
        });
    }


    public onClosePress():void{
        const router = this.getRouter();
        router.navTo("RouterMaster");
        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout","OneColumn");
    }
}