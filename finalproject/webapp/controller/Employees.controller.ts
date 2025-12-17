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
        router.getRoute("employees")?.attachPatternMatched(this.onBindElement.bind(this));
    }

    private onBindElement(event: Route$PatternMatchedEvent): void {

        this.read();

    }

    private async read(): Promise<void> {

        const utils = new Utils(this);

        const filter = {
            path: '/Users',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail())
            ]
        };

        const employees = await utils.read(new JSONModel(filter));
        console.log(employees);
        //this.showResults(employees);

        const salary = {
            path: '/Salaries',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail()),
                new Filter("EmployeeId", "EQ", "0008")
            ]
        };
        console.log(salary);
        const Attachment = {
            path: '/Attachments',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail()),
                new Filter("EmployeeId", "EQ", "0008")
            ]
        };
        
        const Salaries = await utils.read(new JSONModel(salary));  
        console.log(Salaries); 
        // const Atachments = await utils.read(new JSONModel(Attachment)); 
        // console.log(Atachments);      
    }

    public showResults(data: void | ODataListBinding): void {
        let results = data as any;
        const oResultsModel = new JSONModel();
        oResultsModel.setData(results.results);
        this.getView()?.setModel(oResultsModel, "resultsModel");

    }

    public onClosePress(): void {

        const router = this.getRouter();
        router.navTo("master");

    }

}