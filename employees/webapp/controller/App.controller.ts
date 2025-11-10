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
        this.loadStatus();
        this.loadTypes();
        this.loadView();
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

    private loadStatus(): void {
        const model = new JSONModel();  //Modelos
        model.loadData("../model/Status.json");
        this.setModel(model, "status");
    }

    private loadTypes(): void {
        const model = new JSONModel();  //Modelos
        model.loadData("../model/Types.json");
        this.setModel(model, "types");
    }

    private loadView(): void {

        const data = {
            layout: "OneColumn"
        };
        const model = new JSONModel(data);
        this.setModel(model, "view");

    }


}