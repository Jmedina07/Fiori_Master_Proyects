import View from "sap/ui/core/mvc/View";
import BaseController from "./BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";


/**
 * @namespace com.logaligroup.employees.controller
 */
export default class OrderDetails extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void | undefined {

        const router = this.getRouter();
        router.getRoute("RouteOrderDetails")?.attachPatternMatched(this.onBindingContext.bind(this));

    }

    private onBindingContext(event : Route$PatternMatchedEvent ) : void {

        const args = event.getParameter("arguments") as any;
        const employeeId = args.key;
        const orderId = args.key2;

        const view = this.getView() as View;

        ///Orders(10248)
        view.bindElement({
            path: `/Orders(${orderId})`,
            model: 'northwind',
            events: {
                change: () => {

                },
                dataRequest: () => {
                    view.setBusy(true);
                },
                dataReceived: () => {
                    view.setBusy(false);
                }
            }
        });        
    }



}