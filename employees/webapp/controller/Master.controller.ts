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
import StandardListItem from "sap/m/StandardListItem";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import MultiInput from "sap/m/MultiInput";
import TableSelectDialog from "sap/m/TableSelectDialog";
import ListItemBase from "sap/m/ListItemBase"; // <--- Importación corregida
import Token from "sap/m/Token";
import Title from "sap/m/Title"; // Importa el tipo Title



/**
 * @namespace com.logaligroup.employees.controller
 */
type SelectDialogPromise = Promise<SelectDialog>;
type ValueHelpDialogPromise = Promise<ValueHelpDialog>;
interface SelectDialogConfirmParameters {
    selectedItems: StandardListItem[];
    // Puedes añadir otros parámetros si los usas:
    // selectedContexts: sap.ui.model.Context[];
    // confirmButtonPressed: boolean; 
}
export default class Main extends BaseController {

    public aFilters: any[] = [];
    private _pDialog!: SelectDialogPromise;
    // Declaración de propiedad privada para la promesa del diálogo
    private _pValueHelpDialog: Promise<TableSelectDialog> | undefined;

    // Properties to hold the current filters from different controls
    private aSearchFilters: Filter[] = [];
    private aStatusFilters: Filter[] = [];
    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }

    public onFilterSearchPress(event: FilterBar$SearchEvent): void {
        const array = event.getParameter("selectionSet") as Control[];
        const oInput = array[0] as Input;            //getValue()
        const oMultiInput = array[1] as MultiInput;      ///getSelectedKey()

        // 1. Reset the internal search filters array
        this.aSearchFilters = [];
        this.aStatusFilters = [];
        this.inputfilter(oInput);
        this.countryFilter(oMultiInput);
        this.applyAllFilters();
    }

    private inputfilter(input: Input): void {

        const sEmployee = input.getValue();
        if (sEmployee) {
            // Create a single OR filter for ProductName and ShipperName
            const oSearchFilter =
                new Filter({
                    filters: [
                        new Filter("EmployeeID", FilterOperator.EQ, sEmployee),
                        new Filter({
                            filters: [
                                new Filter("FistName", FilterOperator.Contains, sEmployee),
                                new Filter("LastName", FilterOperator.Contains, sEmployee)
                            ],
                            and: false
                        })

                    ],
                    and: false // Use OR logic for the search query
                });
            this.aSearchFilters.push(oSearchFilter);
        }

    }

    private countryFilter(oMultiInput: MultiInput): void {

        // 2. Obtener la lista de tokens
        const aTokens = oMultiInput.getTokens() as Token[];

        // 3. Obtener los valores (asumimos que el texto del token es el valor de filtrado)
        const aSelectedKeys = aTokens.map((token: Token) => token.getKey());

        if (aSelectedKeys.length > 0) {
            // Create a filter for each selected status (all with OR logic)
            const aStatusFilters = aSelectedKeys.map((item: string) =>
                // Usamos "Status" o la propiedad OData que necesites filtrar
                new Filter("Country", FilterOperator.EQ, item)
            );
            // Agrupar todos los filtros de estado con una lógica OR general
            const oCombinedStatusFilter = new Filter({
                filters: aStatusFilters,
                and: false // Lógica OR: Coincide si el Status es igual a cualquiera de los tokens
            });
            this.aStatusFilters.push(oCombinedStatusFilter);
        }

    }

    private applyAllFilters(): void {
        // Combine all filter arrays into one (AND logic between the groups)
        const aAllFilters = [
            ...this.aSearchFilters,
            ...this.aStatusFilters
        ];

        // const list = this.byId("List") as List;
        // const binding = list.getBinding("items") as ListBinding;

        // Apply the combined array of filters
        // binding.filter(aAllFilters);
        const table = this.byId("table") as Table;
        const binding = table.getBinding("items") as ListBinding;
        binding.filter(aAllFilters);
    }

    public onClearPress(event: FilterBar$ClearEvent): void {
        const array = event.getParameter("selectionSet") as Control[];
        const input = array[0] as Input;
        const MultiInput = array[1] as MultiInput;
        input.setValue("");
        MultiInput.removeAllTokens();
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

        // clear the old search filter
        const oBinding = oDialog.getBinding("items");

        // 1. Verificar si el binding existe
        if (oBinding) {
            // 2. Aplicar aserción de tipo para que TypeScript reconozca la función filter
            const oListBinding = oBinding as ListBinding;

            // 3. Llamar a filter en el ListBinding
            oListBinding.filter([]);
        }

        syncStyleClass("sapUiSizeCompact", this.getView() as View, oDialog); //
    }


    public onSelectDialogConfirm(oEvent: Event): void {

        const aSelectedItems = (oEvent.getParameter as (name: string) => any)("selectedItems") as ListItemBase[] | undefined;

        // Obtenemos la referencia al control MultiInput usando su ID
        const oMultiInput = this.byId("multiInput") as MultiInput;

        if (aSelectedItems && aSelectedItems.length > 0) {
            aSelectedItems.forEach((oItem: ListItemBase) => {
                const sKey = (oItem as any).getTitle();
                const sText = (oItem as any).getDescription();

                oMultiInput.addToken(new Token({
                    text: sText,
                    key: sKey
                }));
            });
        }


    }

    public _handleValueHelpSearch(evt: Event): void {

        const sValue = ((evt.getParameter as (name: string) => any)("value") as string) || "";

        const oFilter = new Filter(
            "country",
            FilterOperator.Contains,
            sValue
        );

        // El Source del evento de búsqueda es el TableSelectDialog (o el control de búsqueda dentro)
        const oDialog = evt.getSource() as TableSelectDialog;
        const oBinding = oDialog.getBinding("items") as ListBinding | undefined;
        oBinding?.filter([oFilter]);
    }

    public onTableUpdateFinished(oEvent: Event): void {

        const oTable = oEvent.getSource() as Table;
        const oBinding = oTable.getBinding("items") as ListBinding; // Usa "rows" para sap.ui.table.Table

        if (oBinding) {
            const iTotalRowCount: number = oBinding.getLength();

            // 1. Obtener la referencia al control Title por su ID
            const oTitle = ( this.getView() as View).byId("myRows") as Title;

            if (oTitle) {
                // 2. Actualizar el texto del título con el formato deseado
                oTitle.setText(`Employees (${iTotalRowCount})`);
            }
        }
    }

}