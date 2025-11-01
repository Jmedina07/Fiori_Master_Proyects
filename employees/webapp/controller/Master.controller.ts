import BaseController from "./BaseController";
import Control from "sap/ui/core/Control";
import { FilterBar$ClearEvent, FilterBar$SearchEvent } from "sap/ui/comp/filterbar/FilterBar";
import Input from "sap/m/Input";
import ComboBox from "sap/m/ComboBox";
import Filter from "sap/ui/model/Filter";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import FilterOperator from "sap/ui/model/FilterOperator";
//import * as XLSX from "xlsx";
import Binding from "sap/ui/model/Binding";
import Context from "sap/ui/model/Context";
import oSpreedsheet from "sap/ui/export/Spreadsheet"
import Column from "sap/ui/table/Column";
import Event from "sap/ui/base/Event";
import ObjectListItem from "sap/m/ObjectListItem";
import JSONModel from "sap/ui/model/json/JSONModel";

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
    public onNavToDetails(event: Event): void{

        let item = event.getSource() as ObjectListItem;
        let bindingContext = item.getBindingContext("employees") as Context;
        let id = bindingContext.getProperty("EmployeeID");
        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout","TwoColumnsMidExpanded");
        const router = this.getRouter();
        router.navTo("RouteDetails",{
            ID: parseInt(id) -1 //index
        });

    }

    // public onExportToExcel(): void {

    //     // 1. Obtener la referencia a la tabla
    //     const oTable = this.byId("table") as Table;

    //     // 2. Obtener el binding de los items
    //     // Esto es crucial porque nos da los datos YA FILTRADOS por el FilterBar
    //     const oBinding = oTable.getBinding("items") as ListBinding;
    //     const aContexts: Context[] = oBinding.getContexts();

    //     // 3. Obtener los objetos de datos puros de los contextos
    //     const aTableData: any[] = aContexts.map((oContext: Context) => {
    //         return oContext.getObject();
    //     });

    //     // 4. Transformar los datos al formato deseado para Excel
    //     // Esto es importante porque tu ObjectIdentifier combina dos campos.
    //     // Creamos un nuevo array de objetos con las cabeceras que queremos.
    //     const aDataToExport = aTableData.map(oEmployee => {
    //         return {
    //             "ID Empleado": oEmployee.EmployeeID,
    //             "Nombre Completo": `${oEmployee.LastName}, ${oEmployee.FirstName}`,
    //             "País": oEmployee.Country,
    //             "Ciudad": oEmployee.City,
    //             "Código Postal": oEmployee.PostalCode
    //         };
    //     });

    //     // 5. Crear la Hoja de Cálculo (WorkSheet)
    //     // Usamos 'json_to_sheet' que toma un array de objetos
    //     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(aDataToExport);

    //     // 6. Crear el Libro de Trabajo (WorkBook)
    //     const wb: XLSX.WorkBook = XLSX.utils.book_new();

    //     // 7. Añadir la hoja al libro con un nombre (ej: "Empleados")
    //     XLSX.utils.book_append_sheet(wb, ws, "Empleados");

    //     // 8. Generar y descargar el archivo
    //     XLSX.writeFile(wb, "ListaEmpleados.xlsx");
    // }

    // public onExportToExcel () : void {
    //     //  "sap/ui/export/Spreadsheet" is the library that has been used here
    //     var oTable = this.byId("exportTable") as Table;
    //     // get Rows of the Table
    //     var oBinding = oTable.getBinding("rows") as Binding;
    //     // get Columns of the Table and get the Header labels and Property values 
    //     var aCols = oTable.getColumns().map(function (oColumn: Column) {
    //         var sProperty = oColumn.getSortProperty();
    //         if (!sProperty) {
    //             var oTemplate = oColumn.getTemplate() as Template;
    //             sProperty = oTemplate && oTemplate.getBindingPath("text");
    //         }
    //         return {
    //             label: oColumn.getLabel().getText(),
    //             property: sProperty,
    //             type: "String"
    //         };
    //     });
    //     var iLength = oBinding.getLength();
    //     // getting Data of the Table
    //     // use getContexts() for odata V2
    //     // use requestContexts() for odata v4
    //     var aContexts = await oBinding.getContexts(0, iLength);
    //     var aData = aContexts.map(function (oContext) {
    //         return oContext.getObject();
    //     });
    //     // settings for the Spreadsheet
    //     var oSettings = {
    //         workbook: {
    //             columns: aCols,
    //         },
    //         dataSource: aData,
    //         fileName: "Exported Data.xlsx",
    //         worker: false
    //     };
    //     // getting new Spreadsheet object and binding the settings
    //     var oSpreadsheet = new Spreadsheet(oSettings);
    //     oSpreadsheet.build().then(function () {
    //         MessageToast.show("Exported excel data successfully ...");
    //     }).finally(function () {
    //         oSpreadsheet.destroy();
    //     })
    // }

}