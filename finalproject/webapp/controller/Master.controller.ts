import BaseController from "./BaseController";
import Event from "sap/ui/base/Event";
/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Master extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }

    public oncreateEmployee(event: Event): void {

        const router = this.getRouter();
        router.navTo("newEmployee");
    }

    public onviewEmployee(event: Event): void {

        const router = this.getRouter();
        router.navTo("employees");
    }

}