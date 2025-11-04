import BaseController from "./BaseController";
import Control from "sap/ui/core/Control";
import { FilterBar$ClearEvent, FilterBar$SearchEvent } from "sap/ui/comp/filterbar/FilterBar";
import Input from "sap/m/Input";
import ComboBox from "sap/m/ComboBox";
import Filter from "sap/ui/model/Filter";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import FilterOperator from "sap/ui/model/FilterOperator";
import * as XLSX from "xlsx";
import Binding from "sap/ui/model/Binding";
import Context from "sap/ui/model/Context";
import oSpreedsheet from "sap/ui/export/Spreadsheet"
import Column from "sap/ui/table/Column";
import Event from "sap/ui/base/Event";
import ObjectListItem from "sap/m/ObjectListItem";
import JSONModel from "sap/ui/model/json/JSONModel";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import Dialog from "sap/m/Dialog"
import SelectDialog from "sap/m/SelectDialog";
import Model from "sap/ui/model/Model";
import Button from "sap/m/Button";
import syncStyleClass from "sap/ui/core/syncStyleClass";

/**
 * @namespace com.logaligroup.employees.controller
 */
type SelectDialogPromise = Promise<SelectDialog>;
export default class Main extends BaseController {

    private _pDialog!: SelectDialogPromise;

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
    public onNavToDetails(event: Event): void {

        let item = event.getSource() as ObjectListItem;
        let bindingContext = item.getBindingContext("employees") as Context;
        let id = bindingContext.getProperty("EmployeeID");
        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "TwoColumnsMidExpanded");
        const router = this.getRouter();
        router.navTo("RouteDetails", {
            ID: parseInt(id) - 1 //index
        });

    }

    public onExportToExcel(): void {

        // 1. Obtener la referencia a la tabla
        const oTable = this.byId("table") as Table;

        // 2. Obtener el binding de los items
        // Esto es crucial porque nos da los datos YA FILTRADOS por el FilterBar
        const oBinding = oTable.getBinding("items") as ListBinding;
        const aContexts: Context[] = oBinding.getContexts();

        // 3. Obtener los objetos de datos puros de los contextos
        const aTableData: any[] = aContexts.map((oContext: Context) => {
            return oContext.getObject();
        });

        // 4. Transformar los datos al formato deseado para Excel
        // Esto es importante porque tu ObjectIdentifier combina dos campos.
        // Creamos un nuevo array de objetos con las cabeceras que queremos.
        const aDataToExport = aTableData.map(oEmployee => {
            return {
                "ID Empleado": oEmployee.EmployeeID,
                "Nombre Completo": `${oEmployee.LastName}, ${oEmployee.FirstName}`,
                "País": oEmployee.Country,
                "Ciudad": oEmployee.City,
                "Código Postal": oEmployee.PostalCode
            };
        });

        // 5. Crear la Hoja de Cálculo (WorkSheet)
        // Usamos 'json_to_sheet' que toma un array de objetos
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(aDataToExport);

        // 6. Crear el Libro de Trabajo (WorkBook)
        const wb: XLSX.WorkBook = XLSX.utils.book_new();

        // 7. Añadir la hoja al libro con un nombre (ej: "Empleados")
        XLSX.utils.book_append_sheet(wb, ws, "Empleados");

        // 8. Generar y descargar el archivo
        XLSX.writeFile(wb, "ListaEmpleados.xlsx");
    }
    //public async onValueHelpRequest1() : Promise<void> {
    // public onValueHelpRequest1(event: Event): void {
    //     // var oButton = event.getSource(),
    // 	// 	oView = this.getView();
    //     // const oModel = oView.getModel() as Model;

    //     const oButton = event.getSource() as Button;
    //     const oView = this.getView() as View;
    //     const oModel = oView.getModel() as Model;

    //     let view = this.getView() as View;

    //     if(!this._pDialog){
    //         this._pDialog =  Fragment.load({
    //             id: view.getId(),
    //             name: "com.logaligroup.employees.fragment.Countries",
    //             controller: this
    //         }) as SelectDialog;
    //     }
    //     view.addDependent(this.dialog);
    //     this.dialog.open();   


    // }
    // configDialog(oButton: Button, oDialog: any) {
    //     throw new Error("Method not implemented.");
    // }

    public onSelectDialogPress(oEvent: Event): void {

        const oButton = oEvent.getSource() as Button;
        const oView = this.getView() as View;
        const oModel = oView.getModel() as Model;
        if (!oView) {
            console.error("View is not available.");
            return;
        }

        // Si la Promise del diálogo no ha sido inicializada, la creamos cargando el Fragment.
        if (!this._pDialog) {
            this._pDialog = Fragment.load({
                id: oView.getId(),
                // **ATENCIÓN: Cambia esta ruta a la de tu fragmento real**
                name: "com.logaligroup.employees.fragment.Countries",
                controller: this
            }).then((oDialog: any): SelectDialog => {
                // Asumimos que el fragmento devuelve el SelectDialog.
                const selectDialog = oDialog as SelectDialog;

                // Aplicar el modelo de la vista al diálogo.
                selectDialog.setModel(oModel);

                // Opcional: añadir como dependiente para el manejo del ciclo de vida
                oView.addDependent(selectDialog);

                return selectDialog;
            });
            //this.configDialog(oButton, this._pDialog );
        }

        // Usamos la Promise para configurar y abrir el diálogo.
        // El 'bind(this)' se mantiene para asegurar el contexto dentro de la función .then().
        this._pDialog.then((oDialog: SelectDialog) => {
            // 'this' aquí es automáticamente el controlador (MyController)
            this._configDialog(oButton, oDialog);
            oDialog.open();
        }); // <-- Observa que eliminamos .bind(this)

    }

    private _configDialog(oButton: Button, oDialog: SelectDialog): void {
        // Multi-select if required
        const bMultiSelect = !!oButton.data("multi");
        oDialog.setMultiSelect(bMultiSelect);

        // Custom Confirm Button Text
        const sCustomConfirmButtonText = oButton.data("confirmButtonText") as string;
        oDialog.setConfirmButtonText(sCustomConfirmButtonText);
        // if (sCustomConfirmButtonText) {
        //     oDialog.setConfirmButtonText(sCustomConfirmButtonText);
        // }

        // Remember selections if required
        const bRemember = !!oButton.data("remember");
        oDialog.setRememberSelections(bRemember);

        // Add Clear button if needed
        const bShowClearButton = !!oButton.data("showClearButton");
        oDialog.setShowClearButton(bShowClearButton);

        // Set growing property (convertir a boolean)
        const bGrowing = oButton.data("growing") === "true";
        oDialog.setGrowing(bGrowing);

        // Set growing threshold
        var sGrowingThreshold = oButton.data("threshold");
        if (sGrowingThreshold) {
            oDialog.setGrowingThreshold(parseInt(sGrowingThreshold));
        }
        // const sGrowingThreshold = oButton.data("threshold") as string;
        // if (sGrowingThreshold) {
        //     const iThreshold = parseInt(sGrowingThreshold, 10);
        //     if (!isNaN(iThreshold)) {
        //         oDialog.setGrowingThreshold(iThreshold);
        //     }
        // }

        // Set draggable property
        const bDraggable = !!oButton.data("draggable");
        oDialog.setDraggable(bDraggable);

        // Set resizable property
        const bResizable = !!oButton.data("resizable");
        oDialog.setResizable(bResizable);

        // Set style classes
        const sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
        const bResponsivePadding = !!oButton.data("responsivePadding");
        oDialog.toggleStyleClass(sResponsiveStyleClasses, bResponsivePadding);

        // Clear the old search filter (asegurando que getBinding("items") no sea null)
        // const oBinding = oDialog.getBinding("items");
        // if (oBinding) {
        //     oBinding.filter([]);
        // }

        // clear the old search filter
        const oBinding = oDialog.getBinding("items");

        // 1. Verificar si el binding existe
        if (oBinding) {
            // 2. Aplicar aserción de tipo para que TypeScript reconozca la función filter
            const oListBinding = oBinding as ListBinding;

            // 3. Llamar a filter en el ListBinding
            oListBinding.filter([]);
        }

        // Toggle compact style
        //(sap.m as any).syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
        // const oMLibrary = sap.ui.require("sap/ui/core");
        // if (oMLibrary && oMLibrary.syncStyleClass) {
        //     oMLibrary.syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
        // } else {
        //     // Esto debería ejecutarse solo en entornos legacy o si hay un error de carga
        //     console.warn("syncStyleClass no pudo ser cargada directamente. Intentando con la sintaxis global...");
        //     // Intentamos la sintaxis global (solo si estás seguro de que está disponible)
        //     // (sap.m as any).syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
        // }


        syncStyleClass("sapUiSizeCompact", this.getView() as View, oDialog); //
    }

}