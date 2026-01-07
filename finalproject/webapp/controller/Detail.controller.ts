import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import IllustratedMessage from "sap/m/IllustratedMessage";
import Utils from "../utils/Utils";
import View from "sap/ui/core/mvc/View";
import IconTabBar from "sap/m/IconTabBar";
import ObjectHeader from "sap/m/ObjectHeader";
import Context from "sap/ui/model/odata/v2/Context";
import Filter from "sap/ui/model/Filter";
import UploadSet, { UploadSet$AfterItemRemovedEvent, UploadSet$BeforeUploadStartsEvent, UploadSet$UploadCompletedEvent } from "sap/m/upload/UploadSet";
import UploadSetItem, { UploadSetItem$OpenPressedEvent } from "sap/m/upload/UploadSetItem";
import File from "sap/ui/core/util/File"; // Asegúrate de importar esto
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Item from "sap/ui/core/Item";
import ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import Timeline from "sap/suite/ui/commons/Timeline";
import TimelineItem from "sap/suite/ui/commons/TimelineItem";
import { Button$PressEvent } from "sap/m/Button";
import Button from "sap/m/Button";
import Popover from "sap/m/Popover";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import Input from "sap/m/Input";
import ValueState from "sap/ui/core/ValueState";
import MessageBox from "sap/m/MessageBox";
import DatePicker from "sap/m/DatePicker";
import TextArea from "sap/m/TextArea";

/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Detail extends BaseController {

        private _pPopover: Promise<Popover>;

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

        private loadIncidences(): void {
                const model = new JSONModel([]);
                this.setModel(model, "form");
        }

        private onBindElement(event: Route$PatternMatchedEvent): void {
                const id = (event.getParameter("arguments") as any).ID;
                if (id == 0) {
                        this.refresh_data(id);
                }
                else {
                        const model = (this.getOwnerComponent() as UIComponent).getModel("mEmployees") as JSONModel;
                        const data = model.getData(); // Esto es el array de resultados
                        console.log(data);
                        // Buscamos el índice del empleado que coincida con el ID pasado por la ruta
                        const index = data.findIndex((emp: any) => emp.EmployeeId === id);

                        if (index !== -1) {
                                // Creamos el path hacia el elemento específico: /0, /1, etc.
                                const sPath = `/${index}`;

                                const view = this.getView() as View;

                                view.bindElement({
                                        path: sPath,
                                        model: 'mEmployees',
                                        events: {
                                                change: () => {
                                                        this.refresh_data(id);
                                                        this.searchFiles(id);
                                                        this.readSalary(id);
                                                },
                                                dataRequested: () => {
                                                        view.setBusy(true)
                                                },
                                                dataReceived: () => {
                                                        view.setBusy(false)
                                                }
                                        }
                                });

                        }
                }

        }

        private async refresh_data(employeeId?: string): Promise<void> {

                let id = Number(employeeId);
                // // 1. Enlazamos la ruta OData del empleado a la vista
                //const oIconTabBar = this.byId("idIconTabBar") as IconTabBar;
                const oObjectPageLayout = this.byId("ObjectPage") as ObjectPageLayout;

                const oMessage = this.byId("idMessage") as IllustratedMessage;
                //const oHeader = this.byId("header") as ObjectHeader;

                if (id > 0) {
                        const sPath = `/('${id}')`;

                        // oIconTabBar.setVisible(true);
                        // oHeader.setVisible(true);
                        oMessage.setVisible(false);
                        oObjectPageLayout.setVisible(true);
                        //this.loadIncidences();

                }
                else {
                        // oIconTabBar.setVisible(false);
                        // oHeader.setVisible(false);
                        oObjectPageLayout.setVisible(false);
                        oMessage.setVisible(true);

                }
        }

        private async readSalary(employeeId: string): Promise<void> {

                const utils = new Utils(this);

                const salary = {
                        path: '/Salaries',
                        filters: [
                                new Filter("SapId", "EQ", utils.getEmail()),
                                new Filter("EmployeeId", "EQ", employeeId)
                        ]
                };
                const Salaries = await utils.read(new JSONModel(salary));
                this.showSalaries(Salaries);


        }
        public showSalaries(data: void | ODataListBinding): void {
                let results = data as any;
                const oResultsModel = new JSONModel();
                const object = results as any;
                const oTimeline = this.getView()?.byId("idTimeline") as Timeline;
                oTimeline.removeAllContent(); // Limpia el contenido previo
                object.results.forEach((item: any) => {
                        const oTimelineItem = new TimelineItem({
                                title: item.Amount,
                                userName: item.Waers,
                                text: item.Comments,
                                filterValue: item.SalaryId,
                                dateTime: item.CreationDate,
                                //filterValue:"2025"

                        });

                        oTimeline.addContent(oTimelineItem);
                });

        }
        private async searchFiles(employeeId: string): Promise<void> {
                // const oContext = this.getView()?.getBindingContext("zemployees");
                // if (oContext) {
                //         // Usamos "as any" para que TS nos deje leer la propiedad
                //         const oData = oContext.getObject() as any;
                //         console.log("Objeto completo del empleado:", oData);
                //         console.log("Contenido de UserToAttachment:", oData.UserToAttachment);
                // }

                const utils = new Utils(this);
                const sapId = utils.getEmail();

                const uploadSet = this.byId("upload1") as UploadSet;


                uploadSet.bindAggregation("items", {
                        path: 'zemployees>/Attachments',
                        filters: [
                                new Filter("SapId", "EQ", sapId),
                                new Filter("EmployeeId", "EQ", employeeId)
                        ],
                        template: new UploadSetItem({
                                fileName: '{zemployees>DocName}',
                                mediaType: '{zemployees>MimeType}',
                                visibleEdit: false,
                                visibleRemove: true,
                                url: "hola",
                                openPressed: this.download.bind(this)
                        })
                });
        }

        private async download(event: UploadSetItem$OpenPressedEvent): Promise<void> {
                event.preventDefault();
                const item = event.getSource() as UploadSetItem;
                const context = item.getBindingContext("zemployees") as Context;
                const path = context.getPath();
                const DocName = context.getProperty("DocName") as string;
                const media = item.getMediaType();
                const url = `/sap/opu/odata/sap/ZEMPLOYEES_SRV${path}/$value`
                // item.setUrl(url);
                try {
                        // 2. Realizar la petición fetch para obtener los datos binarios
                        const response = await fetch(url);
                        if (!response.ok) throw new Error("Error al descargar el archivo");

                        const blob = await response.blob();

                        // 3. Usar la utilidad de SAPUI5 para guardar el archivo con el nombre correcto
                        // Los parámetros son: (blob, nombre, extensión, mimeType)
                        const nameOnly = DocName.substring(0, DocName.lastIndexOf("."));
                        let extension = DocName.substring(DocName.lastIndexOf(".") + 1);
                        extension = extension.substring(0, extension.lastIndexOf(";"));

                        File.save(blob as any, nameOnly, extension, "", undefined as any, undefined);

                } catch (error) {
                        console.error("Error en la descarga:", error);
                        // Opcional: Mostrar un mensaje de error al usuario con MessageBox
                }
        }

        public async onAfterRemoved(event: UploadSet$AfterItemRemovedEvent): Promise<void> {

                const item = event.getParameter("item") as UploadSetItem;
                const context = item.getBindingContext("zemployees") as Context;
                const path = context.getPath();

                const utils = new Utils(this);
                await utils.crud('delete', new JSONModel({ path: path }));
                item.getBinding("items")?.refresh();
        }

        public onBeforeUpload(event: UploadSet$BeforeUploadStartsEvent): void {
                const item = event.getParameter("item") as UploadSetItem;
                const utils = new Utils(this);
                const context = this.getView()?.getBindingContext("mEmployees");;
                const model = this.getOwnerComponent()?.getModel("zemployees") as ODataModel;
                const token = model.getSecurityToken();
                const fileName = item.getFileName();
                const mediaType = item.getMediaType();
                //const orderId = context?.getProperty("OrderID");
                const sapId = utils.getEmail();
                const employeeId = context?.getProperty("EmployeeId");

                // console.log({
                //         fileName,
                //         mediaType,
                //         token,
                //         orderId,
                //         sapId,
                //         employeeId
                // });

                const headerToken = new Item({
                        key: "x-csrf-token",
                        text: token
                });

                const headerSlug = new Item({
                        key: 'slug',
                        text: `${sapId};${employeeId};${fileName};${mediaType}`
                });


                item.addHeaderField(headerToken);
                item.addHeaderField(headerSlug);
        }

        public onUploadCompleted(event: UploadSet$UploadCompletedEvent): void {
                const uploadSet = event.getSource();
                uploadSet.getBinding("items")?.refresh();
        }

        public async onDeleteEmployee(event: Button$PressEvent): Promise<void> {

                const utils = new Utils(this);
                const context = this.getView()?.getBindingContext("mEmployees");;
                const sapId = utils.getEmail();
                const employeeId = context?.getProperty("EmployeeId");
                const object = {
                        path: `/Users(EmployeeId='${employeeId}',SapId='${sapId}')`,
                        filters: [
                                new Filter("SapId", "EQ", utils.getEmail()),
                               new Filter("EmployeeId", "EQ", employeeId)
                        ]
                }
                const results = await utils.crud('delete', new JSONModel(object));
                this.onNavToDetails();

        }

        public onNavToDetails(): void {

                const model = this.getModel("view") as JSONModel;
                model.setProperty("/layout", "TwoColumnsMidExpanded");
                const router = this.getRouter();
                router.navTo("RouteEmployees");

        }
        private dialog: Dialog;
        public async onAscender(oEvent: Button$PressEvent): Promise<void> {
                const view = this.getView() as View;
                if (!this.dialog) {
                        this.dialog = await Fragment.load({
                                id: view.getId(),
                                name: "com.logaligroup.finalproject.fragment.newSalary",
                                controller: this
                        }) as Dialog;

                        // Agregar a la vista para que herede modelos y ciclo de vida
                        view.addDependent(this.dialog);
                }

                // Asegúrate de que el modelo existe con datos iniciales si es necesario
                const oModel = view.getModel("form") as JSONModel;
                if (!oModel) {
                        // Si no existe, créalo para evitar errores
                        view.setModel(new JSONModel({ newSalaryValue: 0, CreationDate: new Date(), Comment: "" }), "form");
                }

                this.dialog.open();


        }

        public onCloseDialog(): void {
                this.dialog.close();
        }

        public async onSaveDialog(event: Button$PressEvent): Promise<void> {
                const oModel = (this.getView() as View).getModel("form") as JSONModel;
                const oData = oModel.getData();
                if (this._validateForm(oData)) {
                        // Si la validación pasa, procedemos con el guardado

                        const utils = new Utils(this);
                        const context = this.getView()?.getBindingContext("mEmployees");;
                        const sapId = utils.getEmail();
                        const employeeId = context?.getProperty("EmployeeId");
                        const salary = {
                                path: '/Salaries',
                                data: {
                                        SapId: sapId,
                                        // EmployeeId: "0007",
                                        EmployeeId: employeeId,
                                        Amount: oData.newSalary,
                                        Waers: "EUR",
                                        Comments: oData.comment,
                                        CreationDate: oData.creationDate
                                        //     SalaryId: "0001"
                                }
                        };
                        // console.log("Nuevo Salario", salary);
                        await utils.crud('createdetail', new JSONModel(salary));
                        this.dialog.close();
                        this.onNavToDetails();
                } else {
                        MessageBox.error("Por favor, complete los campos obligatorios.");
                        //MessageBox.error(resourceBundle.getText("error") || 'no text defined');
                }

                //console.log("Todo el modelo:", oData);

                // const sValue = oModel.getProperty("/newSalaryValue");
                // console.log("Valor específico:", sValue);
        }

        private _validateForm(data: any): boolean {
                // Obtenemos la referencia al input usando el ID que definimos en el fragment
                // Recuerda que al usar Fragment.load con el ID de la vista, el ID es recuperable:
                const oInputSalario = this.byId("idSalario") as Input;
                const oDatePicker = this.byId("idDate") as DatePicker;
                const oTextArea = this.byId("idTexto") as TextArea;
                // const sValue = oInputSalario.getValue();
                const sValue = data.newSalary;
                let bValid = true;

                // Validación: No vacío y mayor a cero
                if (!data.newSalary || parseFloat(data.newSalary) <= 0) {
                        oInputSalario.setValueState(ValueState.Error);
                        oInputSalario.setValueStateText("El salario debe ser mayor a 0");
                        bValid = false;
                } else {
                        oInputSalario.setValueState(ValueState.None);
                }

                if (!data.creationDate || parseFloat(data.creationDate) <= 0) {
                        oDatePicker.setValueState(ValueState.Error);
                        oDatePicker.setValueStateText("Ingresar Fecha");
                        bValid = false;
                } else {
                        oDatePicker.setValueState(ValueState.None);
                }

                if (!data.comment || parseFloat(data.comment) <= 0) {
                        oTextArea.setValueState(ValueState.Error);
                        oTextArea.setValueStateText("Ingresar Comentario");
                        bValid = false;
                } else {
                        oTextArea.setValueState(ValueState.None);
                }
                return bValid;
        }

        // Opcional: Limpiar el estado de error cuando el usuario escriba algo
        public onInputChange(oEvent: any): void {
                const oInput = oEvent.getSource() as Input;
                if (oInput.getValue()) {
                        oInput.setValueState(ValueState.None);
                }
        }
        public onDateChange(oEvent: any): void {
                const oDatePicker = oEvent.getSource() as DatePicker;
                if (oDatePicker.getValue()) {
                        oDatePicker.setValueState(ValueState.None);
                }
        }
        public onTextChange(oEvent: any): void {
                const oTextArea = oEvent.getSource() as TextArea;
                if (oTextArea.getValue()) {
                        oTextArea.setValueState(ValueState.None);
                }
        }
}