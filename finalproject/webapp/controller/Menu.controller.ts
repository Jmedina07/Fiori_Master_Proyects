import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import BaseController from "./BaseController";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import URLHelper from "sap/m/library";
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

    public onAfterRendering(): void {

        const oTile = this.byId("linkFirmarPedido") as GenericTile;

        if (oTile) {

            const sId = oTile.getId();
            const $tile = jQuery(`#${sId}`);
            if ($tile.length > 0) {
                ($tile[0] as HTMLElement).id = "";
                console.log("Hack aplicado: ID del DOM eliminado.");
            }

        }
    }

    public onPressFirmarPedido(oEvent: any): void {
        const oTile = oEvent.getSource() as GenericTile;
        const sUrl = oTile.getUrl();

        if (sUrl) {
            (URLHelper as any).URLHelper.redirect(sUrl, true)
        }
    }


}

