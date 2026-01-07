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
import { Input$SubmitEvent } from "sap/m/Input";
import FilterOperator from "sap/ui/model/FilterOperator";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import ObjectListItem from "sap/m/ObjectListItem";
import Event from "sap/ui/base/Event";
/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Employees extends BaseController {

    panel: Panel;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        //this.read();
        //  this.detail();
        //console.log("Entro a Employes");
        const router = this.getRouter();
        router.getRoute("RouteEmployees")?.attachPatternMatched(this.onBindElement.bind(this));
    }

    private async onBindElement(event: Route$PatternMatchedEvent): Promise<void> {

        await this.read();
        // this.detail();
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
            // IMPORTANTE: urlParameters es donde viaja el $expand
            urlParameters: {
                "$expand": "UserToAttachment"
            }
        };

        const employees = await utils.read(new JSONModel(filter));
        //console.log(employees);
        this.showResults(employees);

        // const salary = {
        //     path: '/Salaries',
        //     filters: [
        //         new Filter("SapId", "EQ", utils.getEmail())
        //         // new Filter("EmployeeId", "EQ", "0007")
        //     ]
        // };
        // //console.log(salary);
        // const Attachment = {
        //     path: '/Attachments',
        //     filters: [
        //         new Filter("SapId", "EQ", utils.getEmail())
        //         // new Filter("EmployeeId", "EQ", "0006")
        //     ]
        // };
        // const Salaries = await utils.read(new JSONModel(salary));  
        // const Atachments = await utils.read(new JSONModel(Attachment));     
    }

    public showResults(data: void | ODataListBinding): void {
        let results = data as any;
        const oResultsModel = new JSONModel();
        oResultsModel.setData(results.results);
        //this.getView()?.setModel(oResultsModel, "zemployees"); /// Prueba
        this.getOwnerComponent()?.setModel(oResultsModel, "mEmployees");



        const object = results as any;
        //const form = this.getModel("form") as JSONModel;
        //form.setData(object.results);

    }

    public onClosePress(): void {

        // const router = this.getRouter();
        // router.navTo("master");


        const router = this.getRouter();
        router.navTo("menu");
        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "OneColumn");

    }
    public detail(): void {
        // let item = event.getSource() as ObjectListItem;
        // let bindingContext = item.getBindingContext("zemployees") as Context;
        // let id = bindingContext.getProperty("EmployeeID");
        const model = this.getModel("view") as JSONModel;
        // model.setProperty("/layout", "TwoColumnsMidExpanded");
        const router = this.getRouter();
        // router.navTo("RouteDetails", {
        //     ID: 0
        // });
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