import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace com.logaligroup.employees.controller
 */
export default class App extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.loadEmployees();
        this.loadCountries();
    }
    
    private loadEmployees(): void {
        const model = new JSONModel();  //Modelos
        model.loadData("../model/Employees.json");
        this.setModel(model, "employees");
    }

    private loadCountries(): void {
        const model = new JSONModel();  //Modelos
        model.loadData("../model/Countries.json");
        this.setModel(model, "countries");
    }
}