import BaseController from "./BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import JSONModel from "sap/ui/model/json/JSONModel";
import Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import NavContainer from "sap/m/NavContainer";
import Page, { Page$NavButtonPressEvent } from "sap/m/Page";
import DynamicPage from "sap/f/DynamicPage";
import Input from "sap/m/Input";
import SegmentedButton, { SegmentedButton$SelectionChangeEvent } from "sap/m/SegmentedButton";
import Slider from "sap/m/Slider";
import Button from "sap/m/Button";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Label from "sap/m/Label";
import Text from "sap/m/Text";
import MessageBox, { Action, Icon } from "sap/m/MessageBox";
import ValueState from "sap/ui/core/ValueStateSupport";
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
    steptwo: StepTwoData;
}
type MessageBoxFunction = "confirm" | "warning";
// Define una interfaz para el historial (history)
interface History {
    prevPaymentSelect: string | null;
    prevDiffDeliverySelect: boolean | null;
}
// Variable de historial fuera de la clase para mantener el estado
// El uso de 'var history' en el código original sugiere un estado global/estático.
const history: History = {
    prevPaymentSelect: null,
    prevDiffDeliverySelect: null
};
export default class NewEmployee extends BaseController {

    private _wizard!: Wizard;
    private _oNavContainer!: NavContainer;
    private _oDynamicPage!: DynamicPage;
    private model!: JSONModel;


    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        console.log("Entro a New Employes");
        const router = this.getRouter();
        router.getRoute("newEmployee")?.attachPatternMatched(this.onBindElement.bind(this));

    }
    // Define la estructura inicial/vacía de tu modelo
    private initialModelData: any = {
        selectedOption: "", // Para el SegmentedButton
        steptwo: {
            name: "",
            apellido: "",
            dni: null,
            cif: null,
            date: null
            // Salario y Precio son Sliders, que se manejan mejor por ID o se inicializan aquí si están en el modelo
        },
        stepthree: {
            Note: "" // Para el TextArea
        },
        // Aquí deberías incluir cualquier otra propiedad que uses en el Wizard
        // como /CreditCard, /CashOnDelivery, /BillingAddress, etc. si las usas.

        // Propiedades de ejemplo para el modelo
        selectedPayment: "",
        BillingAddress: {
            Address: "",
            City: "",
            ZipCode: "",
            Country: "",
            Note: ""
        },
        selectedDeliveryMethod: "",
        titleClickable: false // Propiedad de DynamicPage
    };
    private loadIncidences(): void {

        const oWizard = this.byId("employeeWizard") as Wizard;
        this._oNavContainer = this.byId("navContainer") as NavContainer;
        this._oDynamicPage = this.getPage();

        this.model = new JSONModel();

        // Usamos attachRequestCompleted para manejar la carga asíncrona de datos
        this.model.attachRequestCompleted({}, () => {
            const oData = this.model.getData() as ModelData;
            oData.steptwo = {};
            this.model.setData(oData, true);
            //this.model.setProperty("/steptwo", "Step Two");
            //  this.model.setProperty("/steptwo", {});

        });
        // }, this);
        //this.model.updateBindings();
        // Cargar datos (asume que los paths son correctos en un proyecto real)
        this.model.loadData(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
        this.getView()?.setModel(this.model);
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
    /**
         * Reinicia el Wizard al primer paso y limpia los datos.
         */
    private _resetWizard(): void {

        const oWizard = this.byId("employeeWizard") as Wizard;
        //const oModel = this.getView().getModel() as JSONModel;

        const oModel = this.model = new JSONModel();

        // 1. Reiniciar el modelo de datos a su estado inicial
        // (Esto limpiará todos los campos de entrada, botones de segmento, etc. que estén enlazados al modelo)
        oModel.setData(this.initialModelData);

        // Opcionalmente, puedes inicializar los Sliders a sus valores por defecto si no están enlazados al modelo
        // const oSalarioSlider = this.byId("Salario") as Slider;
        // oSalarioSlider.setValue(24000); 
        // const oPrecioSlider = this.byId("Precio") as Slider;
        // oPrecioSlider.setValue(400);

        // 2. Volver al primer paso del Wizard
        const oFirstStep = this.byId("ContentsStep") as WizardStep;
        if (oWizard && oFirstStep) {
            // Ir al primer paso
            oWizard.discardProgress(oFirstStep, false);

            // Opcional: Reiniciar la navegación al primer Page
            const oNavContainer = this.byId("navContainer") as NavContainer;
            const oDynamicPage = this.byId("dynamicPage") as DynamicPage;
            if (oNavContainer && oDynamicPage) {
                oNavContainer.to(oDynamicPage.getId());
            }

            // Opcional: Mostrar un mensaje
            //MessageToast.show("Formulario y Wizard reiniciados.");
        } else {
            // Manejo de error si no se encuentra el Wizard o el primer paso
            console.error("No se encontró el Wizard o el primer paso.");
        }

    }
    public completedHandler(): void {

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

        this.loadIncidences();
        this.frontcustomizing();

    }
    public onSegmentedButtonChange(oEvent: SegmentedButton$SelectionChangeEvent): void {
        this.setDiscardableProperty({
            message: "Are you sure you want to change the payment type ? This will discard your progress.",
            discardStepId: "ContentsStep",
            modelPath: "/selectedOption",
            historyPath: "prevPaymentSelect"
        });

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
                        this.frontcustomizing();
                    } else {
                        // Restablecer el valor anterior
                        this.model.setProperty(params.modelPath, history[params.historyPath]);
                    }
                }
            });
        } else {
            // El usuario aún está en el paso, actualizar el historial sin MessageBox
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
                // Esto no debería suceder gracias al tipado de MessageBoxFunction
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
    // private _navBackToStep(step: WizardStep): void {
    //     const fnAfterNavigate = () => {
    //         this._wizard.goToStep(step, false);
    //         this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
    //     }.bind: any(this);

    //     this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
    //     this._oNavContainer.to(this._oDynamicPage);
    // }

    private navBackToStep(step: WizardStep): void {
        const fnAfterNavigate = () => {
            this._wizard.goToStep(step, false);

            this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
        };

        this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
        this._oNavContainer.to(this._oDynamicPage);
    }


    private saveEmployee(): void {


        const signature = this.byId("signature") as Signature;
        const bindingContext = this.getView()?.getBindingContext("northwind") as Context;
        const resourceBundle = this.getResourceBundle();
        //const utils = new Utils(this);


        if (!signature.isFill()) {
            MessageBox.error(resourceBundle.getText("fillSignature") || '');
        } else {
            const sSignature = signature.getSignature();
            //data:image/png;base64,
            const sMediaContent = sSignature.replace("data:image/png;base64,", "");
            const body = {
                path: '/Users',
                data: {
                    OrderId: bindingContext.getProperty("OrderID").toString(),
                    SapId: "",
                    EmployeeId: bindingContext.getProperty("EmployeeID").toString(),
                    MimeType: 'image/png',
                    MediaContent: sMediaContent
                }
            };

            await utils.crud('create', new JSONModel(body));
        }


    }
}