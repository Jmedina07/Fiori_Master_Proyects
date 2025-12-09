import BaseController from "./BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import NavContainer from "sap/m/NavContainer";
import Page from "sap/m/Page";
import EventBus from "sap/ui/core/EventBus";
import DynamicPage from "sap/f/DynamicPage";
import { ValueState } from "sap/ui/core/library";
import PropertyBinding from "sap/ui/model/PropertyBinding";
import Input from "sap/m/Input";
import SegmentedButton, { SegmentedButton$SelectionChangeEvent } from "sap/m/SegmentedButton";
import SegmentedButtonItem from "sap/m/SegmentedButtonItem";

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
        router.getRoute("RouteNewEmployee")?.attachPatternMatched(this.onBindElement.bind(this));

    }
    private loadIncidences(): void {

        this._wizard = this.byId("employeeWizard") as Wizard;
        this._oNavContainer = this.byId("navContainer") as NavContainer;
        this._oDynamicPage = this.getPage();

        this.model = new JSONModel();

        // Usamos attachRequestCompleted para manejar la carga asíncrona de datos
        this.model.attachRequestCompleted(null, () => {
            const oData = this.model.getData() as ModelData;

            this.model.setProperty("/steptwo", {});
        }, this);

        // Cargar datos (asume que los paths son correctos en un proyecto real)
        this.model.loadData(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
        this.getView()?.setModel(this.model);

    }
    public getPage(): DynamicPage {
        return this.byId("dynamicPage") as DynamicPage;
    }
    private onBindElement(event: Route$PatternMatchedEvent): void {

        this.loadIncidences();



    }
    public onButtonSelect(): number {

        // 1. Obtener el ítem (SegmentedButtonItem) que fue seleccionado.
        // Se usa 'getParameter("item")' para obtener el control que cambió.
        const segmentedButton = this.byId("butonselect") as SegmentedButton;

        // Utilizamos getSelectedKey() para obtener la clave (key) del item seleccionado
        const selectedKey: number = Number( segmentedButton.getSelectedKey().toString() );

        return selectedKey ;


    }

    public checksteptwo(): void {

        //const oInput = this.byId("myInputId") as SegmentedButton;

        // const oNameBinding = ( this.model.bindProperty("/steptwo") as PropertyBinding );
        // const sCurrentName = oNameBinding.getValue().bindProperty as StepTwoData;

        // //console.log("Binding", name);
        // console.log( "Name;", sCurrentName);
        // 1. Obtener la instancia del control de entrada
        const option = this.onButtonSelect();
        if( option == 1)
        {
            
        }
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
}