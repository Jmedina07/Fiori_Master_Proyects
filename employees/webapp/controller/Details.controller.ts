import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import BaseController from "./BaseController";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Panel from "sap/m/Panel";
import Button, { Button$PressEvent } from "sap/m/Button";

/**
 * @namespace com.logaligroup.employees.controller
 */
export default class Details extends BaseController {

    panel: Panel;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        const router = this.getRouter();
        router.getRoute("RouteDetails")?.attachMatched(this.onBindElement.bind(this));
    }

    private loadIncidences(): void {

        const model = new JSONModel([]);
        this.setModel(model, "form");

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


    public onClosePress(): void {
        const router = this.getRouter();
        router.navTo("RouterMaster");
        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "OneColumn");
    }


    public async onCreate(): Promise<void> {
        const panelMain = this.byId("tableIncidence") as Panel;

        const form = this.getModel("form") as JSONModel;
        const aData = form.getData();
        const index = aData.length;
        aData.push({ Index: index + 1 });
        form.refresh();

        // Crear Isntancia
        this.panel = await <Promise<Panel>>this.loadFragment({
            name: "com.logaligroup.employees.fragment.NewIncidence"
        });


        this.panel.bindElement({
            path: 'form>/' + index,
            model: 'form'
        });

        panelMain.addContent(this.panel);


    }

    public onSavePress(event: Button$PressEvent): void {
        const button = event.getSource() as Button;
        const bindingContext = button.getBindingContext("form");
        console.log(bindingContext?.getObject());
    }

}