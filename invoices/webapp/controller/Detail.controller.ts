import Controller from "sap/ui/core/mvc/Controller";
import Component from "../Component";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import View from "sap/ui/core/mvc/View";
import History from "sap/ui/core/routing/History";
import { ProductRating$ChangeEvent } from "../control/ProductRating";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageToast from "sap/m/MessageToast";
import ProductRating from "../control/ProductRating";
/**
 * @namespace com.logaligroup.invoices.controller
 */
export default class Detail extends Controller {

    public onInit(): void | undefined {
        const router = (<Component>this.getOwnerComponent()).getRouter();
        router.getRoute("RouteDetails")?.attachPatternMatched(this.onBindingContextRoute, this);
    }

    public onBindingContextRoute(event: Route$PatternMatchedEvent): void {

        // reset
        (this.byId("ProductRating") as ProductRating).reset();


        let args = event.getParameter("arguments") as any;
        const path = window.decodeURIComponent(args.path);
        const view = this.getView() as unknown as View;

        view.bindElement({
            path: path,
            model: "northwind"

        });

    }

    public onNavBack(): void {
        const history = History.getInstance();
        const previusHash = history.getPreviousHash();

        if (previusHash !== undefined) {
            window.history.go(-1);
        } else {
            const router = (<Component>this.getOwnerComponent()).getRouter();
            router.navTo("RouteMain");
        }
    }
    public onRatingChange(event: ProductRating$ChangeEvent): void {
        const value = event.getParameter("value");
        let resourceBundle = (this.getView()?.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
        MessageToast.show(resourceBundle.getText("ratingConfirmation", [value]) || '');
    }

}