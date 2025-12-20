import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import IllustratedMessage from "sap/m/IllustratedMessage";
import Utils from "../utils/Utils";
import View from "sap/ui/core/mvc/View";
import IconTabBar from "sap/m/IconTabBar";
import ObjectHeader from "sap/m/ObjectHeader";
import Context from "sap/ui/model/odata/v2/Context";
import Filter from "sap/ui/model/Filter";


/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Detail extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

        // Inicializamos un modelo local para controlar el estado de selección
        const oViewModel = new JSONModel({
            selectedEmployee: false
        });
        this.getView()?.setModel(oViewModel, "view");
        const router = this.getRouter();
        router.getRoute("RouteDetail")?.attachPatternMatched(this.onBindElement.bind(this));
    }

    private loadIncidences(): void {
        const model = new JSONModel([]);
        this.setModel(model, "form");
    }

    private onBindElement(event: Route$PatternMatchedEvent): void {

        let arg = event.getParameter("arguments") as any;
        let id = arg.ID;
        // // 1. Enlazamos la ruta OData del empleado a la vista
        const oIconTabBar = this.byId("idIconTabBar") as IconTabBar;

        const oMessage = this.byId("idMessage") as IllustratedMessage;
        const oHeader = this.byId("header") as ObjectHeader;
        this.loadIncidences();
        if (id > 0) {
            this.read(id);
            oIconTabBar.setVisible(true);
            oHeader.setVisible(true);
            oMessage.setVisible(false);

        }
        else {
            oIconTabBar.setVisible(false);
            oHeader.setVisible(false);
            oMessage.setVisible(true);

        }
        // const view = this.getView() as View;

        // view.bindElement({
        //     path: `/Users(${id})`,
        //     model: 'resultsModel',
        //     events: {
        //         change: () => {
        //             this.read();
        //         },
        //         dataRequested: () => {
        //             view.setBusy(true)
        //         },
        //         dataReceived: () => {
        //             view.setBusy(false)
        //         }
        //     }
        // });
    }

    private async read(employeeId: string): Promise<void> {
        const utils = new Utils(this);
        const salary = {
            path: '/Salaries',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail()),
                new Filter("EmployeeId", "EQ", employeeId)
            ]
        };
        //console.log(salary);
        const Attachment = {
            path: '/Attachments',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail()),
                new Filter("EmployeeId", "EQ", employeeId)
            ]
        };
        const Salaries = await utils.read(new JSONModel(salary));  
        const Atachments = await utils.read(new JSONModel(Attachment));  

        //console.log(results);

    }

}