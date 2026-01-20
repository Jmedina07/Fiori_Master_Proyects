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
import { ValueState } from "sap/ui/core/library";

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
interface ModelData {
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

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

        const router = this.getRouter();
        router.getRoute("RouteNewEmployee")?.attachPatternMatched(this.onBindElement.bind(this));

        // 1. Modelo para archivos
        const oData = { files: [] as Array<{ name: string }> };
        const oFormModel = new JSONModel(oData);
        this.getView()?.setModel(oFormModel, "form");

        this.model = new JSONModel(Object.assign({}, this.initialModelData));
        this.getView()?.setModel(this.model); // Modelo por defecto

    }

    private initialModelData: any = {

        selectedOption: "",
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
        },
        stepthree: {
            Note: "" // Para el TextArea
        },

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
    private _resetWizard(): void {
        const oWizard = this.byId("employeeWizard") as Wizard;

        if (this.model) {

            const oEmptyData = JSON.parse(JSON.stringify(this.initialModelData));

            oEmptyData.selectedOption = "";
            oEmptyData.steptwo.name = "";
            oEmptyData.steptwo.apellido = "";
            oEmptyData.steptwo.dni = null;
            oEmptyData.steptwo.cif = null;
            oEmptyData.steptwo.creationDate = null;
            oEmptyData.steptwo.comment = "";

            this.model.setData(oEmptyData);
            this.model.updateBindings(true);
        }

        const oFormModel = this.getView()?.getModel("form") as JSONModel;
        if (oFormModel) {
            oFormModel.setProperty("/files", []);
        }

        const oUploadSet = this.byId("upload") as UploadSet;
        if (oUploadSet) {
            const aItems = oUploadSet.getItems();
            aItems.forEach((oItem: any) => {
                oUploadSet.removeItem(oItem);
                oItem.destroy();
            });
            const aIncompleteItems = oUploadSet.getIncompleteItems() || [];
            aIncompleteItems.forEach((oItem: any) => {
                oUploadSet.removeItem(oItem);
                oItem.destroy();
            });
            const oUploader = oUploadSet.getDefaultFileUploader();
            if (oUploader) {
                oUploader.clear();
            }
            oUploadSet.removeAllIncompleteItems();
        }

        const oFirstStep = this.byId("ContentsStep") as WizardStep;
        if (oWizard && oFirstStep) {
            oWizard.discardProgress(oFirstStep, false);
            oWizard.goToStep(oFirstStep, false);
        }
    }
    public completedHandler(): void {

        const oModel = this.getView()?.getModel("form") as JSONModel;
        let aFiles = oModel.getProperty("/files") as Array<{ name: string }>;
        const iTotalRowCount: number = aFiles.length;
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
                        history[params.historyPath] = this.model.getProperty(params.modelPath) as any;
                        this.loadIncidences();
                        this.frontcustomizing();

                    } else {

                        this.model.setProperty(params.modelPath, history[params.historyPath]);
                    }
                }
            });

        } else {
            
            this.loadIncidences();
            this.frontcustomizing();
            history[params.historyPath] = this.model.getProperty(params.modelPath) as any;

        }
    }


    public onButtonSelect(): string {

        const segmentedButton = this.byId("butonselect") as SegmentedButton;
        const selectedKey = segmentedButton.getSelectedKey().toString();
        return selectedKey;


    }

    public checksteptwo(): void {

        if (!this._wizard) {
            this._wizard = this.byId("employeeWizard") as Wizard;
        }

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

        if (name.length < 2) {
            vbal = false;
        } else if (apellido.length < 2) {
            vbal = false;
        } else if (cif.length < 5 && dni.length < 5) {
            vbal = false;
        } else if (date === null) {
            vbal = false;
        }
        if (dni.length > 0) {
            vbal = this.onDniChange((this.byId("Dni") as Input), vbal);
        }
        if (vbal) {
            this._wizard.validateStep(steptwo);
        } else {
            this._wizard.invalidateStep(steptwo);
        }
    }

    public onClosePress(): void {

        this.onNavToBack();
        // const router = this.getRouter();
        // router.navTo("menu");
        // const model = this.getModel("view") as JSONModel;
        // model.setProperty("/layout", "OneColumn");

    }

    public handleWizardCancel(): void {
        this.handleMessageBoxOpen("Are you sure you want to cancel your purchase?", "warning");
    }

    public handleWizardSave(): void {
        this.handleMessageBoxOpen("Are you sure you want to submit your report?", "confirm");
    }

    private handleMessageBoxOpen(sMessage: string, sMessageBoxType: MessageBoxFunction): void {

        const oActionConfig = {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: (oAction: string) => {
                if (oAction === MessageBox.Action.YES) {
                    const firstStep = this._wizard.getSteps()[0];
                    this._wizard.discardProgress(firstStep, false);
                    this._resetWizard();
                    this.handleNavBackToFirst();
                    this.refreshScreen();
                }
            }
        };

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
            const employee = {
                path: '/Users',
                data: {
                    SapId: data.sapId,
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
                                Amount: data.amount.toString(),
                                Waers: "EUR",
                                Comments: data.comment,
                                CreationDate: data.creationDate
                            }
                        ]
                }


            };
            const result = await utils.crud('create', new JSONModel(employee));
            this.screendata.steptwo.employeeId = result.EmployeeId;
            const dataprev = this.initialModelData;
            this.onStartUpload();
            this.refreshScreen();

        }

    }

    private async getId(): Promise<string> {

        const utils = new Utils(this);
        let employeeId: string = "";
        const object = {
            path: '/Users',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail())
            ]
        };

        try {
            const results = await utils.read(new JSONModel(object)) as unknown as IReadResult;
            const valores = results.results.map(res => res.EmployeeId);
            let valorMaximo = Math.max(...valores);
            valorMaximo++;
            employeeId = valorMaximo.toString().padStart(4, '0');

        } catch (oError) {

            console.error("Error en la consulta:", oError);
            employeeId = ("1").toString().padStart(4, '0');


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
        const comments = (this.byId("Note") as TextArea).getValue().toString();

        const data = {
            name: name,
            apellido: apellido,
            dni: dni,
            creationDate: date,
            comment: comments,
            sapId: sapId,
            type: type,
            amount: amount
        } as StepTwoData;
        this.screendata = {
            steptwo: data
        };

    }
    private isObjectEmpty<T extends object>(obj: T): boolean {
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
            uploadSet.upload();
        }
    }
    public onUploadCompleted(event: UploadSet$UploadCompletedEvent): void {
        const uploadSet = event.getSource();
        uploadSet.getBinding("items")?.refresh();
    }

    public onFileAdded(oEvent: UploadSet$AfterItemAddedEvent): void {
        const oItem = oEvent.getParameter("item") as UploadSetItem;
        const oModel = this.getView()?.getModel("form") as JSONModel;
        const aFiles = oModel.getProperty("/files");
        aFiles.push({
            name: oItem.getFileName()
        });

        oModel.setProperty("/files", aFiles);

    }

    public onFileRemoved(oEvent: UploadSet$AfterItemRemovedEvent): void {
        const oItem = oEvent.getParameter("item") as UploadSetItem;
        const oModel = this.getView()?.getModel("form") as JSONModel;
        let aFiles = oModel.getProperty("/files") as Array<{ name: string }>;
        aFiles = aFiles.filter(file => file.name !== oItem.getFileName());
        oModel.setProperty("/files", aFiles);
    }

    public refreshScreen(): void {

        this._oNavContainer.to(this._oDynamicPage);
        const dataprev2 = this.initialModelData;
        this._resetWizard();
        this.loadIncidences();
        this.frontcustomizing();
        const oSaveBtn = this.byId("savebuton") as Button;
        if (oSaveBtn) {
            oSaveBtn.setVisible(false);
        }
    }

    public onDniChange(iDi: Input, vbal: boolean): boolean {
        const oInput = iDi;
        const sDni: string = iDi.getValue();


        const regularExp: RegExp = /^\d{8}[a-zA-Z]$/;
        const letterList: string = "TRWAGMYFPDXBNJZSQVHLCKET";

        if (regularExp.test(sDni)) {

            const sNumberStr: string = sDni.substring(0, sDni.length - 1);
            const sLetter: string = sDni.substring(sDni.length - 1, sDni.length).toUpperCase();
            const nNumber: number = parseInt(sNumberStr, 10) % 23;
            const sCorrectLetter: string = letterList.substring(nNumber, nNumber + 1);

            if (sCorrectLetter !== sLetter) {

                vbal = false;
                oInput.setValueState(ValueState.Error);
                oInput.setValueStateText("La letra del DNI no es válida");
            } else {

                oInput.setValueState(ValueState.Success);
                oInput.setValueStateText("DNI correcto");
            }
        } else {

            vbal = false;
            oInput.setValueState(ValueState.Error);
            oInput.setValueStateText("Formato de DNI inválido (8 números y 1 letra)");
        }

        return vbal;

    }

}