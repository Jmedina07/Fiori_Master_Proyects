import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import { SearchField$SearchEvent } from "sap/m/SearchField";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import List from "sap/m/List";
import ListBinding from "sap/ui/model/ListBinding";
import MultiComboBox from "sap/m/MultiComboBox";
import Event from "sap/ui/base/Event";
import Component from "../Component";
import ObjectListItem from "sap/m/ObjectListItem";
import Context from "sap/ui/model/odata/v2/Context";

/**
 * @namespace com.logaligroup.invoices.controller
 */
export default class InvoicesList extends Controller {


    public onInit(): void | undefined {
        this.currencyModel();
    }

    public currencyModel(): void {
        let data = {
            usd: "USD",
        }
        const model = new JSONModel(data);
        this.getView()?.setModel(model, "currency");
    }

    public onSearchPress(event: SearchField$SearchEvent): void {
        const sQuery = event.getParameter("query");
        //       const sQuery2 = event.getParameters().query;

        let aFilters: any[] = [];
        if (sQuery) {
            aFilters.push(
                new Filter({
                    filters: [
                        new Filter("ProductName", FilterOperator.Contains, sQuery),
                        new Filter("ShipperName", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                })
            );
        }
        this.onFilter(aFilters);
    }

    public onSelectedKeys(oEvent: Event): void {

        const oMultiComboBox = oEvent.getSource() as MultiComboBox;
        // Get the selected keys (an array of strings)
        const aSelectedKeys = oMultiComboBox.getSelectedKeys();
        
        let aFilters: any[] = [];
        aSelectedKeys.forEach((item) => {
            aFilters.push(new Filter("Status", FilterOperator.EQ, item));
        });
        this.onFilter(aFilters);
    }

    private onFilter(Filters: any[]): void {
        const list = this.byId("List") as List;
        const binding = list.getBinding("items") as ListBinding;
        binding.filter(Filters);
    }

    public onVanToDetail(event: Event) : void {
        const item = event.getSource() as ObjectListItem;
        const bindingContext = item.getBindingContext("northwind") as Context;
        const path = bindingContext.getPath();
        /*
        console.log(bindingContext.getObject());
        console.log(bindingContext.getPath());
        console.log(bindingContext.getProperty("ProductName"));
        */
        const router = ( this.getOwnerComponent() as Component ).getRouter();
        router.navTo("RouteDetails",{
            path: window.encodeURIComponent(path)
        });
    }



}