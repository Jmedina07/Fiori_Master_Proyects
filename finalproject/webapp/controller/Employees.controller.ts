import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import Panel from "sap/m/Panel";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Utils from "../utils/Utils";
import Context from "sap/ui/model/odata/v2/Context";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import Filter from "sap/ui/model/Filter";
import UIComponent from "sap/ui/core/UIComponent";
/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Employees extends BaseController {

    panel: Panel;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        console.log("Entro a Employes");
        const router = this.getRouter();
        router.getRoute("RouteEmployee")?.attachPatternMatched(this.onBindElement.bind(this));

    }

    private onBindElement(event: Route$PatternMatchedEvent): void {

        //reset
        const panel = this.byId("tableIncidence") as Panel;
        panel.removeAllContent();
        this.loadIncidences();

        // console.log(event.getParameters());
        let arg = event.getParameter("arguments") as any;
        let id = arg.ID;
        const view = this.getView() as View;

        view.bindElement({
            path: `/Employees(${id})`,
            model: 'northwind',
            events: {
                change: () => {
                    this.read();
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
    private loadIncidences(): void {

        const model = new JSONModel([]);
        this.setModel(model, "form");

    }

    private async read(): Promise<void> {
        const northwind = this.getView()?.getBindingContext("northwind") as Context;
        const utils = new Utils(this);

        const object = {
            path: '/Users',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail()),
                new Filter("EmployeeId", "EQ", northwind.getProperty("EmployeeID"))
            ]
        };

        const results = await utils.read(new JSONModel(object));
        //console.log(results);
        this.showIncidents(results);
    }

    private showIncidents(results: ODataListBinding | void): void {
        const panel = this.byId("tableIncidence") as Panel;
        panel.removeAllContent();
        const object = results as any;
        const form = this.getModel("form") as JSONModel;
        form.setData(object.results);


        object.results.forEach(async (incidence: object, index: number) => {
            const newIncidence = await <Promise<Panel>>this.loadFragment({ name: "com.logaligroup.employees.fragment.NewIncidence" });
            newIncidence.bindElement("form>/" + index);
            panel.addContent(newIncidence);
        });
    }
    
    public onClosePress(): void {


        // const router = this.getRouter();
        // router.navTo("RouteMaster");
        // const model = this.getModel("view") as JSONModel;
        // model.setProperty("/layout", "OneColumn"); 
        const router = this.getRouter();
        router.navTo("master");
        //UIComponent.getRouterFor(this).navTo("RouteMaster");

    }

}