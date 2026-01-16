import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import Panel from "sap/m/Panel";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Utils from "../utils/Utils";
import Context from "sap/ui/model/odata/v2/Context";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import Filter from "sap/ui/model/Filter";
import { Input$SubmitEvent } from "sap/m/Input";
import FilterOperator from "sap/ui/model/FilterOperator";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import ObjectListItem from "sap/m/ObjectListItem";
import Event from "sap/ui/base/Event";
import View from "sap/ui/core/mvc/View";
/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Employees extends BaseController {

    panel: Panel;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        const router = this.getRouter();
        router.getRoute("RouteEmployees")?.attachPatternMatched(this.onBindElement.bind(this));
    }

    private async onBindElement(event: Route$PatternMatchedEvent): Promise<void> {

        await this.read();
        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "TwoColumnsMidExpanded");
        const router = this.getRouter();
        router.navTo("RouteDetail", {
            ID: "0"
        });


    }

    private async read(): Promise<void> {

        const utils = new Utils(this);

        const filter = {
            path: '/Users',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail())
            ],
            urlParameters: {
                "$expand": "UserToAttachment"
            }
        };
        try {
            const employees = await utils.read(new JSONModel(filter));
            this.showResults(employees);
        } catch (error) {
            this.showResults();
        }


    }

    public showResults(data?: void | ODataListBinding): void {
        let results = data as any;
        // 1. Validamos si hay datos. Si no hay, inicializamos con un arreglo vacío.
        const resultsArray = (results && results.results) ? results.results : [];

        // 2. Creamos o actualizamos el modelo
        const oResultsModel = new JSONModel(resultsArray);


        //const oResultsModel = new JSONModel();
        //oResultsModel.setData(results.results);
        this.getOwnerComponent()?.setModel(oResultsModel, "mEmployees");

        // --- SECCIÓN DE LIMPIEZA DE BINDING ---
        const view = this.getView() as View;

        if (resultsArray.length === 0) {
            // A. Si no hay datos, quitamos el enlace de la vista con cualquier registro previo
            view.unbindElement("mEmployees");

            // B. Si el ID del empleado está en un campo específico (ej. un Input), 
            // a veces es necesario resetear el valor manualmente si no se limpia solo:
            // this.byId("idInputEmpleado").setValue(""); 
        }

        // 4. OPCIONAL: Forzar el refresco si la UI no se entera
        oResultsModel.updateBindings(true);


    }

    public onClosePress(): void {

        const router = this.getRouter();
        router.navTo("menu");
        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "OneColumn");

    }
    public detail(): void {

        const model = this.getModel("view") as JSONModel;
        const router = this.getRouter();

    }


    public onSearch(oEvent: Input$SubmitEvent): void {
        const sQuery = oEvent.getParameter("value") as string;

        let filters = [];

        if (sQuery) {
            filters.push(
                new Filter({
                    filters: [
                        new Filter("EmployeeId", FilterOperator.EQ, sQuery),
                        new Filter({
                            filters: [
                                new Filter("FirstName", "Contains", sQuery),
                                new Filter("LastName", FilterOperator.Contains, sQuery)
                            ],
                            and: false
                        })
                    ],
                    and: false
                })
            );
        }

        const table = this.byId("table") as Table;
        const binding = table.getBinding("items") as ListBinding;
        binding.filter(filters);

    }

    public onNavToDetails(event: Event): void {
        let item = event.getSource() as ObjectListItem;
        let bindingContext = item.getBindingContext("mEmployees") as Context;
        let id = bindingContext.getProperty("EmployeeId");
        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "TwoColumnsMidExpanded");
        const router = this.getRouter();
        router.navTo("RouteDetail", {
            ID: id          //index
        });
    }

}