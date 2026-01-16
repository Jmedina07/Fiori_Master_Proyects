import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import BaseController from "./BaseController";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import { URLHelper } from "sap/m/library";
import GenericTile from "sap/m/GenericTile";

/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Menu extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }

    public oncreateEmployee(event: Event): void {

        const router = this.getRouter();
        router.navTo("RouteNewEmployee");
    }

    public onviewEmployee(event: Event): void {

        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "TwoColumnsMidExpanded");
        const router = this.getRouter();
        router.navTo("RouteEmployees");
    }
    // public onPedido(event: Event): void {

    //     const sUrl = "https://9b3a5cb2trial-dev-c25c385-2-approuter.cfapps.us10-001.hana.ondemand.com";

    //     // El segundo parámetro 'true' indica que se abra en una pestaña nueva
    //     URLHelper.redirect(sUrl, true);
    // }
    public onPedido(): void {
        // 1. Obtenemos la referencia del componente usando el tipado correcto
        const oGenericTile = this.byId("linkFirmarPedido") as GenericTile;

        if (oGenericTile) {
            // 2. Obtenemos el ID del control de SAPUI5
            const sId = oGenericTile.getId();

            // 3. Buscamos el elemento en el DOM usando el ID
            // Usamos casting a HTMLElement para poder acceder a la propiedad .id
            const oDomRef = document.getElementById(sId);

            if (oDomRef) {
                // 4. Se vacía el ID en el DOM para mitigar el bug de navegación de la 1.78
                oDomRef.id = "";
            }
        }
    }

}

