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
import UploadSet, { UploadSet$AfterItemRemovedEvent } from "sap/m/upload/UploadSet";
import UploadSetItem, { UploadSetItem$OpenPressedEvent } from "sap/m/upload/UploadSetItem";
import File from "sap/ui/core/util/File"; // Asegúrate de importar esto


/**
 * @namespace com.logaligroup.finalproject.controller
 */
export default class Detail extends BaseController {

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

        let arg = event.getParameter("arguments") as any;
        let id = arg.ID;
        // // 1. Enlazamos la ruta OData del empleado a la vista
        const oIconTabBar = this.byId("idIconTabBar") as IconTabBar;

        const oMessage = this.byId("idMessage") as IllustratedMessage;
        const oHeader = this.byId("header") as ObjectHeader;
        this.loadIncidences();
        if (id > 0) {
            this.read(id);
            this.searchFiles(id);
            oIconTabBar.setVisible(true);
            oHeader.setVisible(true);
            oMessage.setVisible(false);

        }
        else {
            oIconTabBar.setVisible(false);
            oHeader.setVisible(false);
            oMessage.setVisible(true);

        }
        const view = this.getView() as View;

        // view.bindElement({
        //     path: `/Salaries(${id})`,
        //     model: 'zemployees',
        //     events: {
        //         change: () => {
        //             //this.read();
        //             this.searchFiles();
        //         },
        //         dataRequested: () => {
        //             view.setBusy(true)
        //         },
        //         dataReceived: () => {
        //             view.setBusy(false)
        //         }
        //     }
        // });
    }

    private async read(employeeId: string): Promise<void> {
        // private async read () : Promise<void | ODataListBinding> {   
        const bindingContext = this.getView()?.getBindingContext("zemployees") as Context;
        const utils = new Utils(this);
        const salary = {
            path: '/Salaries',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail())
                // new Filter("EmployeeId", "EQ", employeeId)
            ]
        };
        //console.log(salary);
        const Attachment = {
            path: '/Attachments',
            filters: [
                new Filter("SapId", "EQ", utils.getEmail())
                // new Filter("EmployeeId", "EQ", employeeId)
            ]
        };
        const Salaries = await utils.read(new JSONModel(salary));
        const Atachments = await utils.read(new JSONModel(Attachment));

        console.log(Salaries);

    }

    private searchFiles(employeeId: string): void {
        // private async read(employeeId: string): Promise<void> {
        const utils = new Utils(this);
        //const context = this.getView()?.getBindingContext("zemployees");
        const sapId = utils.getEmail();
        //const employeeId = context?.getProperty("EmployeeID");

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
            extension = extension.substring(0,extension.lastIndexOf(";"));

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

}