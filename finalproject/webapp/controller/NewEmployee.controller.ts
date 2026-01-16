import BaseController from "./BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import JSONModel from "sap/ui/model/json/JSONModel";
import Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import NavContainer from "sap/m/NavContainer";
import Page from "sap/m/Page";
import DynamicPage from "sap/f/DynamicPage";
import Input from "sap/m/Input";
import SegmentedButton, { SegmentedButton$SelectionChangeEvent } from "sap/m/SegmentedButton";
import Slider from "sap/m/Slider";
import Button from "sap/m/Button";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Label from "sap/m/Label";
import Text from "sap/m/Text";
import MessageBox from "sap/m/MessageBox";
import Utils from "../utils/Utils";
import DatePicker from "sap/m/DatePicker";
import TextArea from "sap/m/TextArea";
import Filter from "sap/ui/model/Filter";
import UploadSet, { UploadSet$AfterItemRemovedEvent, UploadSet$BeforeUploadStartsEvent, UploadSet$UploadCompletedEvent, UploadSet$AfterItemAddedEvent } from "sap/m/upload/UploadSet";
import UploadSetItem from "sap/m/upload/UploadSetItem";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Item from "sap/ui/core/Item";
import View from "sap/ui/core/mvc/View";

/**
 * @namespace com.logaligroup.finalproject.controller
 */
// Define el tipo de dato que esperas
interface IReadResult {
    results: any[];
    __count?: number; // Propiedad opcional
}
// Definimos interfaces para la estructura del modelo de datos esperada
interface StepTwoData {
    name?: string;
    apellido?: string;
    dni?: string;
    creationDate?: Date;
    comment?: string;
    sapId?: string;
    employeeId?: string;
    type?: string;
    amount: string
}
// interface EmployeeData {
//     SapId: string;
//     Type: string;
//     FirstName: string;
//     LastName: string;
//     Dni: string;
//     CreationDate?: Date | null;
//     // ... otros campos
//     // UserToSalary:
//     // {
//     //     SapId: string;
//     //     Amount: string;
//     //     Waers: string;
//     //     Comments: string;
//     //     CreationDate: Date;
//     // }[];
//     UserToSalary: any[];
//     // UserToAttachment: any[];
// }
interface ModelData {
    // Estas son las rutas de binding usadas en el XML
    //titleClickable: boolean;
    steptwo: StepTwoData;
}
type MessageBoxFunction = "confirm" | "warning";
// Define una interfaz para el historial (history)
interface History {
    prevPaymentSelect: string | null;
    prevDiffDeliverySelect: boolean | null;
}
// Variable de historial fuera de la clase para mantener el estado

const history: History = {
    prevPaymentSelect: null,
    prevDiffDeliverySelect: null
};
export default class NewEmployee extends BaseController {

    private _wizard!: Wizard;
    private _oNavContainer!: NavContainer;
    private _oDynamicPage!: DynamicPage;
    private model!: JSONModel;
    private screendata: ModelData;
    private oUploadSet!: UploadSet;
    // private _oEmployee: { path: string, data: EmployeeData };


    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

        const router = this.getRouter();
        router.getRoute("RouteNewEmployee")?.attachPatternMatched(this.onBindElement.bind(this));

        // 1. Modelo para archivos
        const oData = { files: [] as Array<{ name: string }> };
        const oFormModel = new JSONModel(oData);
        this.getView()?.setModel(oFormModel, "form");

        // 2. CORRECCIÓN: Asignar a la propiedad de la clase this.model
        this.model = new JSONModel(Object.assign({}, this.initialModelData));
        this.getView()?.setModel(this.model); // Modelo por defecto

    }
    // Define la estructura inicial/vacía de tu modelo
    private initialModelData: any = {

        selectedOption: "", // Para el SegmentedButton
        steptwo: {
            name: "",
            apellido: "",
            dni: null,
            cif: null,
            creationDate: null,
            comment: "",
            sapId: "",
            employeeId: "",
            type: "",
            // Salario y Precio son Sliders, que se manejan mejor por ID o se inicializan aquí si están en el modelo
        },
        stepthree: {
            Note: "" // Para el TextArea
        },
        // Aquí deberías incluir cualquier otra propiedad que uses en el Wizard
        // como /CreditCard, /CashOnDelivery, /BillingAddress, etc. si las usas.

        // Propiedades de ejemplo para el modelo
        // selectedPayment: "",
        // BillingAddress: {
        //     Address: "",
        //     City: "",
        //     ZipCode: "",
        //     Country: "",
        //     Note: ""
        // },
        // selectedDeliveryMethod: "",

    };
    private loadIncidences(): void {
        // Buscamos el control
        const oWizard = this.byId("employeeWizard") as Wizard;

        // Asignamos a la propiedad privada de la clase
        if (oWizard) {
            this._wizard = oWizard;
        } else {
            console.error("No se pudo encontrar el Wizard 'employeeWizard'");
            return;
        }

        this._oNavContainer = this.byId("navContainer") as NavContainer;
        this._oDynamicPage = this.getPage();

        // Asegurar que el modelo esté vinculado
        if (!this.model) {
            this.model = this.getView()?.getModel() as JSONModel;
        }

        const oSaveBtn = this.byId("savebuton") as Button;
        if (oSaveBtn) oSaveBtn.setVisible(false);
    }
    /**
         * Reinicia el Wizard al primer paso y limpia los datos.
         */
    private _resetWizard(): void {
        const oWizard = this.byId("employeeWizard") as Wizard;

        // 1. Limpiar los datos del modelo principal sin destruirlo
        // 1. Limpiar modelo principal

        if (this.model) {
            // Opción A: Crear un objeto totalmente nuevo basado en la estructura inicial
            // Esto rompe cualquier referencia a datos anteriores
            const oEmptyData = JSON.parse(JSON.stringify(this.initialModelData));

            // Opción B: Forzar manualmente los campos clave a vacío si la estructura falla
            oEmptyData.selectedOption = "";
            oEmptyData.steptwo.name = "";
            oEmptyData.steptwo.apellido = "";
            oEmptyData.steptwo.dni = null;
            oEmptyData.steptwo.cif = null;
            oEmptyData.steptwo.creationDate = null;
            oEmptyData.steptwo.comment = "";

            this.model.setData(oEmptyData);
            this.model.updateBindings(true); // <--- Vital para que la UI se entere
        }

        // 2. Limpiar el modelo de archivos (form)
        const oFormModel = this.getView()?.getModel("form") as JSONModel;
        if (oFormModel) {
            oFormModel.setProperty("/files", []);
        }

        const oUploadSet = this.byId("upload") as UploadSet;
        if (oUploadSet) {
            // Eliminar items cargados
            const aItems = oUploadSet.getItems();
            aItems.forEach((oItem: any) => {
                oUploadSet.removeItem(oItem);
                oItem.destroy();
            });
            // B. IMPORTANTE: Eliminar items que están pendientes de subir (la cola visual)
            const aIncompleteItems = oUploadSet.getIncompleteItems() || [];
            aIncompleteItems.forEach((oItem: any) => {
                oUploadSet.removeItem(oItem);
                oItem.destroy();
            });
            // Limpiar el input oculto del navegador
            const oUploader = oUploadSet.getDefaultFileUploader();
            if (oUploader) {
                oUploader.clear();
            }

            // Limpiar items incompletos
            oUploadSet.removeAllIncompleteItems();
        }

        // 4. Resetear el Wizard al paso 1
        const oFirstStep = this.byId("ContentsStep") as WizardStep;
        if (oWizard && oFirstStep) {
            oWizard.discardProgress(oFirstStep, false);
            oWizard.goToStep(oFirstStep, false);
        }
    }
    // private _resetWizard(): void {

    //     const oWizard = this.byId("employeeWizard") as Wizard;
    //     //const oModel = this.getView().getModel() as JSONModel;

    //     const oModel = this.model = new JSONModel();

    //     // 1. Reiniciar el modelo de datos a su estado inicial
    //     // (Esto limpiará todos los campos de entrada, botones de segmento, etc. que estén enlazados al modelo)
    //     oModel.setData(this.initialModelData);

    //     // 2. Volver al primer paso del Wizard
    //     const oFirstStep = this.byId("ContentsStep") as WizardStep;
    //     if (oWizard && oFirstStep) {
    //         // Ir al primer paso
    //         oWizard.discardProgress(oFirstStep, false);

    //         // Opcional: Reiniciar la navegación al primer Page
    //         const oNavContainer = this.byId("navContainer") as NavContainer;
    //         const oDynamicPage = this.byId("dynamicPage") as DynamicPage;
    //         if (oNavContainer && oDynamicPage) {
    //             oNavContainer.to(oDynamicPage.getId());
    //         }

    //     } else {
    //         // Manejo de error si no se encuentra el Wizard o el primer paso
    //         console.error("No se encontró el Wizard o el primer paso.");
    //     }
    //     // 2. Limpiar el UploadSet manualmente
    //     const oUploadSet = this.byId("upload") as UploadSet;
    //     if (oUploadSet) {
    //         const oform = this.getView()?.getModel("form") as JSONModel;

    //         if (oform) {
    //             // Asignar un array vacío a la propiedad específica
    //             oform.setProperty("/files", []);
    //         }

    //         oUploadSet.removeAllItems();
    //         oUploadSet.removeAllIncompleteItems();
    //         const oUploader = oUploadSet.getDefaultFileUploader();
    //         if (oUploader) {
    //             oUploader.clear();
    //         }
    //     }
    //     const oInitialData = {
    //         name: "",
    //         apellido: "",
    //         dni: "",
    //         cif: "",
    //         date: null,
    //         salario: 24000, // Valor inicial del slider
    //         precio: 400     // Valor inicial del slider
    //     };

    //     // 3. Actualizar la ruta del modelo
    //     oModel.setProperty("/steptwo", oInitialData);
    // }
    public completedHandler(): void {
        const oModel = this.getView()?.getModel("form") as JSONModel;
        let aFiles = oModel.getProperty("/files") as Array<{ name: string }>;
        const iTotalRowCount: number = aFiles.length;
        // 1. Obtener la referencia al control Title por su ID
        const oTitle = this.byId("files") as Text;
        oTitle.setText(`(${iTotalRowCount}) Ficheros`)
        this._oNavContainer.to(this.byId("wizardReviewPage") as Page);
    }
    public getPage(): DynamicPage {
        return this.byId("dynamicPage") as DynamicPage;
    }
    private frontcustomizing(): void {

        const option = this.onButtonSelect();
        const ocifInput = this.byId("Cif") as Input;
        const odniInput = this.byId("Dni") as Input;
        const osalarioSlider = this.byId("Salario") as Slider;
        const oprecioSlider = this.byId("Precio") as Slider;
        const lbldni = this.byId("lbldni") as Label;
        const lblcif = this.byId("lblcif") as Label;
        const txtdni = this.byId("txtdni") as Text;
        const txtcif = this.byId("txtcif") as Text;
        const resourceBundle = (this.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
        const option2 = resourceBundle.getText("tipoempleado2")

        if (option == option2) {

            ocifInput.setVisible(true);
            odniInput.setVisible(false);
            oprecioSlider.setVisible(true);
            osalarioSlider.setVisible(false);
            lbldni.setVisible(false);
            txtdni.setVisible(false);
            lblcif.setVisible(true);
            txtcif.setVisible(true);
        }
        else {
            ocifInput.setVisible(false);
            odniInput.setVisible(true);
            oprecioSlider.setVisible(false);
            osalarioSlider.setVisible(true);
            lbldni.setVisible(true);
            txtdni.setVisible(true);
            lblcif.setVisible(false);
            txtcif.setVisible(false);
        }

    }
    private onBindElement(event: Route$PatternMatchedEvent): void {
        this._resetWizard();
        this.loadIncidences();
        this.frontcustomizing();

    }
    public onSegmentedButtonChange(oEvent: SegmentedButton$SelectionChangeEvent): void {
        this.setDiscardableProperty({
            message: "Are you sure you want to change the Employee type ? This will discard your progress.",
            discardStepId: "ContentsStep",
            modelPath: "/selectedOption",
            historyPath: "prevPaymentSelect"
        });

    }
    public onchange(): void {
        this.setDiscardableProperty({
            message: "",
            discardStepId: "ContentsStep",
            modelPath: "/selectedOption",
            historyPath: "prevPaymentSelect"
        });

    }

    public onValidation(): void {


    }
    /**
         * Función genérica para manejar cambios en el modelo que podrían requerir
         * descartar el progreso del wizard si ya se ha avanzado.
         * @param params Parámetros que contienen el mensaje, el ID del paso a descartar, el path del modelo y el path del historial.
         */
    private setDiscardableProperty(params: {
        message: string;
        discardStepId: string;
        modelPath: string;
        historyPath: keyof History;
    }): void {
        const discardStep = this.byId(params.discardStepId) as WizardStep;

        if (this._wizard.getProgressStep() !== discardStep) {
            MessageBox.warning(params.message, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: (oAction: string) => {
                    if (oAction === MessageBox.Action.YES) {
                        this._wizard.discardProgress(discardStep, false);
                        // Asegurar el tipado correcto para el historial
                        history[params.historyPath] = this.model.getProperty(params.modelPath) as any;
                        this.loadIncidences();
                        this.frontcustomizing();
                    } else {
                        // Restablecer el valor anterior
                        this.model.setProperty(params.modelPath, history[params.historyPath]);
                    }
                }
            });
        } else {
            // El usuario aún está en el paso, actualizar el historial sin MessageBox
            this.loadIncidences();
            this.frontcustomizing();
            history[params.historyPath] = this.model.getProperty(params.modelPath) as any;
        }
    }


    public onButtonSelect(): string {

        // 1. Obtener el ítem (SegmentedButtonItem) que fue seleccionado.
        // Se usa 'getParameter("item")' para obtener el control que cambió.
        const segmentedButton = this.byId("butonselect") as SegmentedButton;

        // Utilizamos getSelectedKey() para obtener la clave (key) del item seleccionado
        const selectedKey = segmentedButton.getSelectedKey().toString();

        return selectedKey;


    }

    public checksteptwo(): void {
        // SEGURIDAD: Si _wizard es undefined, intentamos recuperarlo de nuevo
        if (!this._wizard) {
            this._wizard = this.byId("employeeWizard") as Wizard;
        }

        // Si después de intentar recuperarlo sigue fallando, salimos de la función
        if (!this._wizard) {
            return;
        }

        let vbal = true;
        const steptwo = this.byId("steptwo") as WizardStep;

        const name: string = (this.byId("Name") as Input).getValue();
        const apellido: string = (this.byId("Apellido") as Input).getValue();
        const cif: string = (this.byId("Cif") as Input).getValue();
        const dni: string = (this.byId("Dni") as Input).getValue();
        const date: Date | null = (this.byId("Date") as DatePicker).getDateValue();

        // Lógica de validación
        if (name.length < 3) {
            vbal = false;
        } else if (apellido.length < 5) {
            vbal = false;
        } else if (cif.length < 5 && dni.length < 5) {
            vbal = false;
        } else if (date === null) {
            vbal = false;
        }

        // Ahora es seguro llamar a los métodos
        if (vbal) {
            this._wizard.validateStep(steptwo);
        } else {
            this._wizard.invalidateStep(steptwo);
        }
    }

    public onClosePress(): void {

        const router = this.getRouter();
        router.navTo("menu");
        const model = this.getModel("view") as JSONModel;
        model.setProperty("/layout", "OneColumn");

    }

    public handleWizardCancel(): void {
        this.handleMessageBoxOpen("Are you sure you want to cancel your purchase?", "warning");
    }

    public handleWizardSave(): void {
        this.handleMessageBoxOpen("Are you sure you want to submit your report?", "confirm");
    }

    private handleMessageBoxOpen(sMessage: string, sMessageBoxType: MessageBoxFunction): void {

        // Configuración de las acciones (YES/NO) y el manejador de cierre
        const oActionConfig = {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            // oAction será tipado como una string literal de las acciones (ej: "YES")
            onClose: (oAction: string) => {
                // La comparación directa con "YES" (string) es la más segura y compatible
                if (oAction === MessageBox.Action.YES) { // SAPUI5 define Action.YES como la string "YES"
                    // Descartar el progreso y volver al inicio
                    const firstStep = this._wizard.getSteps()[0];
                    this._wizard.discardProgress(firstStep, false);
                    this._resetWizard();
                    this.handleNavBackToFirst();
                    this.refreshScreen();
                }
            }
        };

        // Usamos el switch para llamar al método correcto
        switch (sMessageBoxType) {
            case "confirm":
                MessageBox.confirm(sMessage, oActionConfig);
                break;
            case "warning":
                MessageBox.warning(sMessage, oActionConfig);
                break;
            default:
                MessageBox.show(sMessage, oActionConfig);
                break;
        }
    }

    public handleNavBackToFirst(): void {
        this.navBackToStep(this.byId("ContentsStep") as WizardStep);
    }
    public handleNavBackToTwo(): void {
        this.navBackToStep(this.byId("steptwo") as WizardStep);
    }
    public handleNavBackToThree(): void {
        this.navBackToStep(this.byId("stepthree") as WizardStep);
    }

    private navBackToStep(step: WizardStep): void {
        const fnAfterNavigate = () => {
            this._wizard.goToStep(step, false);

            this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
        };

        this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
        this._oNavContainer.to(this._oDynamicPage);
    }


    public async saveEmployee(): Promise<void> {


        await this.getScreenData();
        const data = this.screendata.steptwo;
        if (!this.isObjectEmpty(data)) {

            const utils = new Utils(this);
            const sEmpId = data.employeeId?.toString().substring(0, 4);
            //const oDate = new Date(); // O la fecha que desees
            const employee = {
                path: '/Users',
                data: {
                    SapId: data.sapId,
                    // EmployeeId: sEmpId,  //Descomentar
                    Type: data.type,
                    FirstName: data.name,
                    LastName: data.apellido,
                    Dni: data.dni,
                    CreationDate: data.creationDate,
                    Comments: data.comment,
                    UserToSalary: 
                        [
                            {
                                SapId: data.sapId,
                                // EmployeeId: sEmpId,
                                Amount: data.amount.toString(), // OData suele pedir importes como string
                                Waers: "EUR",
                                Comments: data.comment,
                                CreationDate: data.creationDate
                                // SalaryId: "0001"
                            }
                        ]
                    // Aquí usamos el nombre de la Navigation Property definida en el metadata
                }


            };
            // await utils.crud('createUser', new JSONModel(employee));
            const result = await utils.crud('create', new JSONModel(employee));
            this.screendata.steptwo.employeeId = result.EmployeeId;
            const dataprev = this.initialModelData;
            this.onStartUpload();
            this.refreshScreen();

        }

    }
    // public async saveEmployee(): Promise<void> {

    //     const oFormData = this.getView()?.getModel("form") as JSONModel;
    //     await this.getScreenData();
    //     const data = this.screendata.steptwo;
    //     if (!this.isObjectEmpty(data)) {

    //         const utils = new Utils(this);
    //         const sEmpId = data.employeeId?.toString().substring(0, 4);
    //         const oDate = new Date(); // O la fecha que desees
    //         // Dentro de tu función de guardado:
    //         this._oEmployee.data = {
    //             SapId: data.sapId,
    //             Type: data.type,
    //             FirstName: data.name,
    //             LastName: data.apellido,
    //             Dni: data.dni,
    //             CreationDate: oDate,
    //             UserToSalary: []
    //             // UserToAttachment: []
    //             // UserToAttachment: oFormData.getProperty("/attachments")
    //         } as EmployeeData;
    //         this._oEmployee.data.UserToSalary.push({
    //             SapId: data.sapId,
    //             Amount: data.amount.toString(),
    //             Waers: "EUR",
    //             Comments: data.comment,
    //             CreationDate: oDate
    //         });
    //         // const files = oFormData.getProperty("/files");
    //         // this._oEmployee.data.UserToAttachment.push(oFormData.getProperty("/files"));

    //         const result = await utils.crud('create', new JSONModel(this._oEmployee));
    //         this.screendata.steptwo.employeeId = result.EmployeeId;
    //         console.log("resultado", result);
    //         // const employee = {
    //         //     path: '/Users',
    //         //     data: {
    //         //         SapId: data.sapId,
    //         //         //EmployeeId: sEmpId,  //Descomentar
    //         //         Type: data.type,
    //         //         FirstName: data.name,
    //         //         LastName: data.apellido,
    //         //         Dni: data.dni,
    //         //         CreationDate: oDate,
    //         //         UserToSalary:
    //         //             [
    //         //                 {
    //         //                     SapId: data.sapId,
    //         //                     //EmployeeId: sEmpId,
    //         //                     Amount: data.amount.toString(), // OData suele pedir importes como string
    //         //                     Waers: "EUR",
    //         //                     Comments: data.comment,
    //         //                     CreationDate: oDate
    //         //                     // SalaryId: "0001"
    //         //                 }
    //         //             ],
    //         //         UserToAttachment: [
    //         //             {
    //         //                 SapId: data.sapId,
    //         //                 EmployeeId: "",
    //         //                 DocName: "",
    //         //                 MimeType: ""
    //         //             }

    //         //         ]
    //         //     }

    //         // };            
    //         //await utils.crud('create', new JSONModel(employee));
    //         this.onStartUpload();
    //         this.refreshScreen();
    //     }

    // }

    private async getId(): Promise<string> {

        const utils = new Utils(this);
        let employeeId: string = "";
        const object = {
            path: '/Users',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail())
            ]
        };

        // Forzamos el tipo de retorno usando 'as IReadResult'
        try {
            const results = await utils.read(new JSONModel(object)) as unknown as IReadResult;
            const valores = results.results.map(res => res.EmployeeId);
            let valorMaximo = Math.max(...valores);
            valorMaximo++;
            employeeId = valorMaximo.toString().padStart(4, '0');

        } catch (oError) {
            // Aquí capturamos el error 400 sin que la app se detenga
            console.error("Error en la consulta:", oError);
            employeeId = ("1").toString().padStart(4, '0');

            // Extraemos el mensaje del backend (basado en tu log de error)


        }

        return employeeId;
    }

    private async getScreenData(): Promise<void> {

        const utils = new Utils(this);
        const sapId = utils.getEmail();


        const model = this.initialModelData;
        const resourceBundle = (this.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
        const name = (this.byId("Name") as Input).getValue().toString();
        const apellido = (this.byId("Apellido") as Input).getValue().toString();
        let dni = "", amount = "";

        var selectedKey = this.model.getProperty("/selectedOption").toString();
        const option1 = resourceBundle.getText("tipoempleado1");
        const option2 = resourceBundle.getText("tipoempleado2");
        const option3 = resourceBundle.getText("tipoempleado3");
        const type = ((selectedKey === option1) ? 1 : (selectedKey === option2) ? 2 : 3).toString();
        if (selectedKey === option2) {
            dni = (this.byId("Cif") as Input).getValue().toString();
            amount = (this.byId("Precio") as Slider).getValue().toString();
        } else {
            dni = (this.byId("Dni") as Input).getValue().toString();
            amount = (this.byId("Salario") as Slider).getValue().toString()
        }
        const date: Date | null = (this.byId("Date") as DatePicker).getDateValue();
        //const note = this.model.getProperty("/stepthree/Note");
        const comments = (this.byId("Note") as TextArea).getValue().toString();
        //const employeeId = "1";
        //const employeeId = (await this.getId()).toString();


        const data = {
            name: name,
            apellido: apellido,
            dni: dni,
            creationDate: date,
            comment: comments,
            sapId: sapId,
            //employeeId: employeeId,
            type: type,
            amount: amount
        } as StepTwoData;
        this.screendata = {
            steptwo: data
        };

    }
    private isObjectEmpty<T extends object>(obj: T): boolean {
        // Comprueba si el array de las claves del objeto tiene longitud 0
        return Object.keys(obj).length === 0;
    }
    public async onBeforeUpload(event: UploadSet$BeforeUploadStartsEvent): Promise<void> {


        const item = event.getParameter("item") as UploadSetItem;
        const model = this.getOwnerComponent()?.getModel("zemployees") as ODataModel;
        const token = model.getSecurityToken();
        const fileName = item.getFileName();
        const mediaType = item.getMediaType();
        const data = this.screendata.steptwo;

        if (!this.isObjectEmpty(data)) {

            const headerToken = new Item({
                key: "x-csrf-token",
                text: token
            });

            const headerSlug = new Item({
                key: 'slug',
                text: `${data.sapId};${data.employeeId};${fileName};${mediaType}`
            });

            item.addHeaderField(headerToken);
            item.addHeaderField(headerSlug);
        }
    }
    public onStartUpload(): void {
        const uploadSet = this.byId("upload") as UploadSet;

        if (uploadSet) {
            // 2. Llamar al método upload()
            // Esto iniciará el proceso de subida para todos los archivos que estén en estado "Pending"
            uploadSet.upload();
        }
    }
    public onUploadCompleted(event: UploadSet$UploadCompletedEvent): void {
        const uploadSet = event.getSource();
        uploadSet.getBinding("items")?.refresh();
    }
    /**
        * Se dispara cuando el usuario agrega un archivo al UploadSet
             */
    public onFileAdded(oEvent: UploadSet$AfterItemAddedEvent): void {
        const oItem = oEvent.getParameter("item") as UploadSetItem;
        const oModel = this.getView()?.getModel("form") as JSONModel;
        const aFiles = oModel.getProperty("/files");

        // Agregamos el nombre del archivo al modelo
        aFiles.push({
            name: oItem.getFileName()
        });

        oModel.setProperty("/files", aFiles);

    }
    /**
         * Se dispara cuando el usuario elimina un archivo del UploadSet
         */

    public onFileRemoved(oEvent: UploadSet$AfterItemRemovedEvent): void {
        const oItem = oEvent.getParameter("item") as UploadSetItem;
        const oModel = this.getView()?.getModel("form") as JSONModel;
        let aFiles = oModel.getProperty("/files") as Array<{ name: string }>;

        // Filtramos para eliminar el archivo de la lista de revisión
        aFiles = aFiles.filter(file => file.name !== oItem.getFileName());

        oModel.setProperty("/files", aFiles);
    }

    // public refreshScreen(): void {
    //     this.loadIncidences();
    //     const firstStep = this._wizard.getSteps()[0];
    //     this._wizard.discardProgress(firstStep, false);
    //     this._resetWizard();
    //     this.handleNavBackToFirst();
    //     this.onchange();
    // }
    public refreshScreen(): void {
        // 1. Volvemos a la página principal donde está el Wizard 
        // (Esto es vital porque si estás en wizardReviewPage no verás los cambios)
        this._oNavContainer.to(this._oDynamicPage);

        // 2. Ejecutamos la limpieza profunda
        const dataprev2 = this.initialModelData;
        this._resetWizard();
        this.loadIncidences();
        this.frontcustomizing();

        // 3. Ocultar el botón de guardado (que se activó al final del Wizard anterior)
        const oSaveBtn = this.byId("savebuton") as Button;
        if (oSaveBtn) {
            oSaveBtn.setVisible(false);
        }
    }

}