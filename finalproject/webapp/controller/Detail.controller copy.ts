import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import ObjectPageSection from "sap/uxap/ObjectPageSection";

/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Detail1 extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

        // Inicializamos un modelo local para controlar el estado de selección
        const oViewModel = new JSONModel({
            selectedEmployee: false
        });
        this.getView()?.setModel(oViewModel, "view");
        const router = this.getRouter();
        router.getRoute("RouteDetail")?.attachPatternMatched(this.onBindElement.bind(this));
    }

    private onBindElement(event: Route$PatternMatchedEvent): void {

        let arg = event.getParameter("arguments") as any;
        let sEmployeeId = arg.ID;
        // const sEmployeeId = arguments.ID;
        const oView = this.getView();

        // // 1. Enlazamos la ruta OData del empleado a la vista
        const oSeccion1 = this.byId("seccion1") as ObjectPageSection;
        const oSeccion2 = this.byId("seccion2") as ObjectPageSection;
        const oPage = this.byId("page") as ObjectPageLayout;
        
        if( sEmployeeId > 0){
            oPage.setVisible(true);
            // oSeccion1.setVisible(true);
            // oSeccion2.setVisible(true);
        }
        else{
            oPage.setVisible(false);
            // oSeccion1.setVisible(false);
            // oSeccion2.setVisible(false);            
        }
        
        // oView?.bindElement({
        //     path: `/Employees('${sEmployeeId}')`,
        //     events: {
        //         dataReceived: () => {
        //             // 2. Al recibir datos, marcamos que hay un empleado seleccionado
        //             (oView.getModel("view") as JSONModel).setProperty("/selectedEmployee", true);
        //         }
        //     }
        // });

    }


}