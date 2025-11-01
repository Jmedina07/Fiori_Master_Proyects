import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
/**
 * @namespace com.logaligroup.invoices.controller
 */
export default class Main extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

        this.loadModel();

    }

    private loadModel() : void {

        let data = {
            recipient : {
                name : "World"
            }
        };
        let model = new JSONModel(data);
        this.getView()?.setModel(model,"view");

    }


}