import BaseController from "./BaseController";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Panel from "sap/m/Panel";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Button, { Button$PressEvent } from "sap/m/Button";
import Context from "sap/ui/model/odata/v2/Context";
import Utils from "../utils/Utils";
import Filter from "sap/ui/model/Filter";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import { DatePicker$ChangeEvent } from "sap/m/DatePicker";
import { Input$LiveChangeEvent } from "sap/m/Input";
import { Select$ChangeEvent } from "sap/m/Select";

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



    private async read () : Promise<void> {
        const northwind = this.getView()?.getBindingContext("northwind") as Context;
        const utils = new Utils(this);

        const object = {
            path: '/IncidentsSet',
            filters: [
                new Filter("SapId","EQ", utils.getEmail()),
                new Filter("EmployeeId","EQ", northwind.getProperty("EmployeeID"))
            ]
        };

        const results = await utils.read(new JSONModel(object));
        console.log(results);
        this.showIncidents(results);
    }

    private showIncidents (results : ODataListBinding | void) : void {
        const panel = this.byId("tableIncidence") as Panel;
        panel.removeAllContent();
        const object = results as any;
        const form = this.getModel("form") as JSONModel;
        form.setData(object.results);


        object.results.forEach( async (incidence : object, index : number) => {
            const newIncidence = await <Promise<Panel>> this.loadFragment({name: "com.logaligroup.employees.fragment.NewIncidence"});
            newIncidence.bindElement("form>/"+index);
            panel.addContent(newIncidence);
        });
    }

    public onSavePress(event: Button$PressEvent): void {

        const button = event.getSource() as Button;
        const bindingContext = button.getBindingContext("form");
        const northwind = this.getView()?.getBindingContext("northwind") as Context;

        const utils = new Utils(this);

        let sapId = utils.getEmail();
        let employeeId = (northwind.getProperty("EmployeeID") as number).toString();

        if (typeof bindingContext?.getProperty("IncidenceId") === 'undefined') {
            console.log("Create");
            const object = {
                path: "/IncidentsSet",
                data: {
                    SapId:                  sapId,
                    EmployeeId:             employeeId,
                    CreationDate:           bindingContext?.getProperty("CreationDate"),
                    Type:                   bindingContext?.getProperty("Type"),
                    Reason:                 bindingContext?.getProperty("Reason")
                }
            }

            utils.crud('create',new JSONModel(object));
        } else {
            console.log("Update");
            let incidenceId = bindingContext.getProperty("IncidenceId");

            const object = {
                path: `/IncidentsSet(IncidenceId='${incidenceId}',SapId='${sapId}',EmployeeId='${employeeId}')`,
                data: {
                    CreationDate:           bindingContext?.getProperty("CreationDate"),
                    CreationDateX:          bindingContext?.getProperty("CreationDateX"),
                    Type:                   bindingContext?.getProperty("Type"),
                    TypeX:                  bindingContext?.getProperty("TypeX"),
                    Reason:                 bindingContext?.getProperty("Reason"),
                    ReasonX:                bindingContext?.getProperty("ReasonX")
                }
            }

            utils.crud('update', new JSONModel(object));
        }

    }

    public updateIncidenceCreationDate(event: DatePicker$ChangeEvent): void {

        const context = event.getSource().getBindingContext("form") as Context;
        let object = context.getObject() as any;
        object.CreationDateX = true;

    }

    public updateIncidenceReason(event: Input$LiveChangeEvent): void {

        const context = event.getSource().getBindingContext("form") as Context;
        let object = context.getObject() as any;
        object.ReasonX = true;

    }

    public updateIncidenceType(event: Select$ChangeEvent): void {

        const context = event.getSource().getBindingContext("form") as Context;
        let object = context.getObject() as any;
        object.TypeX = true;

    }
}