import BaseController from "./BaseController";

/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class NewEmployee extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        console.log("Entro a New Employes");
        const router = this.getRouter();
        //router.getRoute("RouteNewEmployee")?.attachPatternMatched(this.onBindElement.bind(this));

    }

}