import BaseController from "./BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import NavContainer from "sap/m/NavContainer";
import Page, { Page$NavButtonPressEvent } from "sap/m/Page";
import EventBus from "sap/ui/core/EventBus";
import DynamicPage from "sap/f/DynamicPage";
import { ValueState } from "sap/ui/core/library";
import PropertyBinding from "sap/ui/model/PropertyBinding";
import Input from "sap/m/Input";
import SegmentedButton, { SegmentedButton$SelectionChangeEvent } from "sap/m/SegmentedButton";
import SegmentedButtonItem from "sap/m/SegmentedButtonItem";
import Slider from "sap/m/Slider";
import Button from "sap/m/Button";

/**
 * @namespace com.logaligroup.finalproject.controller
 */

// Definimos interfaces para la estructura del modelo de datos esperada
interface StepTwoData {
    name?: string;
    apellido?: string;
    dni?: string;
    cfi?: string;
    date?: string;
}
interface ModelData {
    // Estas son las rutas de binding usadas en el XML
    titleClickable: boolean;
    // ProductCollection: any[]; // Usaremos 'any' ya que no se define su estructura aquí
    // ProductsTotalPrice: number;
    // selectedPayment: string;
    // selectedDeliveryMethod: string;
    steptwo: StepTwoData;
    // CreditCard: CreditCardData;
    // CashOnDelivery: CashOnDeliveryData;
    // BillingAddress: BillingAddressData;
    // CardNumber?: string;
}

export default class NewEmployee extends BaseController {

    private _wizard!: Wizard;
    private _oNavContainer!: NavContainer;
    private _oDynamicPage!: DynamicPage;
    private model!: JSONModel;

    // Almacenamos los pasos para una referencia fácil
    private _ContentsStep!: WizardStep;
    private _steptwo!: WizardStep;
    private _stepthree!: WizardStep;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        console.log("Entro a New Employes");
        const router = this.getRouter();
        router.getRoute("newEmployee")?.attachPatternMatched(this.onBindElement.bind(this));

    }
    private loadIncidences(): void {

        const oWizard = this.byId("employeeWizard") as Wizard;
        this._oNavContainer = this.byId("navContainer") as NavContainer;
        this._oDynamicPage = this.getPage();

        this.model = new JSONModel();

        // Usamos attachRequestCompleted para manejar la carga asíncrona de datos
        this.model.attachRequestCompleted({}, () => {
            const oData = this.model.getData() as ModelData;

            this.model.setProperty("/steptwo", {});
        }, this);

        // Cargar datos (asume que los paths son correctos en un proyecto real)
        // this.model.loadData(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
        // this.getView()?.setModel(this.model);
        // Realiza una verificación de tipo para asegurar que es un Wizard (buena práctica de TS)
        if (oWizard instanceof Wizard) {
            this._wizard = oWizard;
        } else {
            // Manejo de error si el ID es incorrecto o el control no es un Wizard
            console.error("Control con ID 'wizard' no encontrado o no es un sap.m.Wizard.");
            // O lanza un error: throw new Error("Wizard no encontrado.");
        }
        const buton = this.byId("savebuton") as Button;
        buton.setVisible(false);

    }
    public completedHandler(): void {
//        this._oNavContainer = this.byId("wizardBranchingReviewPage") as Page;
        this._oNavContainer.to( this.byId("wizardBranchingReviewPage") as Page );
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
        if (option == 2) {

            ocifInput.setVisible(true);
            odniInput.setVisible(false);
            oprecioSlider.setVisible(true);
            osalarioSlider.setVisible(false);
        }
        else {
            ocifInput.setVisible(false);
            odniInput.setVisible(true);
            oprecioSlider.setVisible(false);
            osalarioSlider.setVisible(true);
        }

    }
    private onBindElement(event: Route$PatternMatchedEvent): void {

        this.loadIncidences();
        this.frontcustomizing();

    }
    public onSegmentedButtonChange(oEvent: SegmentedButton$SelectionChangeEvent): void {

        this.frontcustomizing();
    }

    public onButtonSelect(): number {

        // 1. Obtener el ítem (SegmentedButtonItem) que fue seleccionado.
        // Se usa 'getParameter("item")' para obtener el control que cambió.
        const segmentedButton = this.byId("butonselect") as SegmentedButton;

        // Utilizamos getSelectedKey() para obtener la clave (key) del item seleccionado
        const selectedKey: number = Number(segmentedButton.getSelectedKey().toString());

        return selectedKey;


    }
    public checkstepone(): void {
        //this.frontcustomizing();
    }
    public checksteptwo(): void {

        const oNameInput = this.byId("Name") as Input;
        const oApellidoInput = this.byId("Apellido") as Input;

        const steptwo = this.byId("steptwo") as WizardStep;
        // 2. Obtener el valor directamente del control
        const name: string = oNameInput.getValue();
        const apellido: string = oApellidoInput.getValue();
        // console.log("Name;", name);
        if (name.length > 3 && apellido.length > 5) {
            this._wizard.validateStep(steptwo);
        } else {
            this._wizard.invalidateStep(steptwo);
        }
    }

    public onClosePress(): void {

        const router = this.getRouter();
        router.navTo("master");

    }
}