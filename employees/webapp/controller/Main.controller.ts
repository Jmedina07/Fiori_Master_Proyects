import BaseController from "./BaseController";
import Control from "sap/ui/core/Control";
import { FilterBar$ClearEvent, FilterBar$SearchEvent } from "sap/ui/comp/filterbar/FilterBar";
import Input from "sap/m/Input";
import ComboBox from "sap/m/ComboBox";
import Filter from "sap/ui/model/Filter";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import FilterOperator from "sap/ui/model/FilterOperator";
/**
 * @namespace com.logaligroup.employees.controller
 */
export default class Main extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }

    public onFilterSearchPress(event: FilterBar$SearchEvent): void {
        const array = event.getParameter("selectionSet") as Control[];
        const input = array[0] as Input;            //getValue()
        const combobox = array[1] as ComboBox;      ///getSelectedKey()
        const sEmployee = input.getValue();
        const sCountry = combobox.getSelectedKey();
        let filters = [];

        if (sEmployee) {
            filters.push(
                new Filter({
                    filters: [
                        new Filter("EmployeeID", FilterOperator.EQ, sEmployee),
                        new Filter({
                            filters: [
                                new Filter("FirstName", "Contains", sEmployee),
                                new Filter("LastName", FilterOperator.Contains, sEmployee)
                            ],
                            and: false
                        })
                    ],
                    and: false
                })
            );
        }

        if (sCountry) {
            filters.push(new Filter("Country", "EQ", sCountry));
        }

        const table = this.byId("table") as Table;
        const binding = table.getBinding("items") as ListBinding;
        binding.filter(filters);
    }


    public onClearPress(event: FilterBar$ClearEvent): void {
        const array = event.getParameter("selectionSet") as Control[];
        const input = array[0] as Input;
        const combobox = array[1] as ComboBox;
        input.setValue("");
        combobox.setSelectedKey("");
        this.onFilterSearchPress(event);
    }

}