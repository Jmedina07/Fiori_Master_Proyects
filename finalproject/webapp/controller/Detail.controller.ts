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
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Integer from "sap/ui/model/type/Integer";


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
                const id = (event.getParameter("arguments") as any).ID;
                if (id == 0) {
                        this.refresh_data(id);
                }
                else {
                        const model = (this.getOwnerComponent() as UIComponent).getModel("mEmployees") as JSONModel;
                        const data = model.getData(); // Esto es el array de resultados

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
                                                },
                                                dataRequested: () => {
                                                        view.setBusy(true)
                                                },
                                                dataReceived: () => {
                                                        view.setBusy(false)
                                                }
                                        }
                                });
                                // (this.getView() as View).bindElement({
                                //         path: sPath,
                                //         model: "zemployees",
                                //         events: {
                                //                 change: () => {
                                //                         this.read();
                                //                 },
                                //                 dataRequested: () => {
                                //                         view.setBusy(true)
                                //                 },
                                //                 dataReceived: () => {
                                //                         view.setBusy(false)
                                //                 }
                                //         }
                                // });

                        }

                        // let arg = event.getParameter("arguments") as any;            Lo comentado ya jalaba pero se lee nuevamente el dato de la Base de Datos
                        // let id = arg.ID;
                        // // // 1. Enlazamos la ruta OData del empleado a la vista
                        // const oIconTabBar = this.byId("idIconTabBar") as IconTabBar;

                        // const oMessage = this.byId("idMessage") as IllustratedMessage;
                        // const oHeader = this.byId("header") as ObjectHeader;

                        // if (id > 0) {
                        //         const sPath = `/('${id}')`;

                        //         ( this.getView() as View).bindElement({
                        //                 path: sPath,
                        //                 model: "zemployees"
                        //         });
                        //         this.refresh_data(id);
                        //         oIconTabBar.setVisible(true);
                        //         oHeader.setVisible(true);
                        //         oMessage.setVisible(false);
                        //         this.loadIncidences();

                        // }
                        // else {
                        //         oIconTabBar.setVisible(false);
                        //         oHeader.setVisible(false);
                        //         oMessage.setVisible(true);

                        // }
                        // const view = this.getView() as View;
                }

        }

        private async refresh_data(employeeId?: string): Promise<void> {

                let id = Number(employeeId);
                // // 1. Enlazamos la ruta OData del empleado a la vista
                const oIconTabBar = this.byId("idIconTabBar") as IconTabBar;

                const oMessage = this.byId("idMessage") as IllustratedMessage;
                const oHeader = this.byId("header") as ObjectHeader;

                if (id > 0) {
                        const sPath = `/('${id}')`;

                        oIconTabBar.setVisible(true);
                        oHeader.setVisible(true);
                        oMessage.setVisible(false);
                        //this.loadIncidences();

                }
                else {
                        oIconTabBar.setVisible(false);
                        oHeader.setVisible(false);
                        oMessage.setVisible(true);

                }
        }

        private async read(employeeId: string): Promise<void> {
                // private async read () : Promise<void | ODataListBinding> {   

                const utils = new Utils(this);

                const employ = {
                        path: '/Users',
                        filters: [
                                new Filter("SapId", "EQ", utils.getEmail()),
                                new Filter("EmployeeId", "EQ", employeeId)
                        ]
                };

                const demploy = await utils.read(new JSONModel(employ));
                this.showResults(demploy);
                // const salary = {
                //         path: '/Salaries',
                //         filters: [
                //                 new Filter("SapId", "EQ", utils.getEmail()),
                //                 new Filter("EmployeeId", "EQ", employeeId)
                //         ]
                // };
                // const Salaries = await utils.read(new JSONModel(salary));

                // console.log(Salaries);

        }
        public showResults(data: void | ODataListBinding): void {
                let results = data as any;
                const oResultsModel = new JSONModel();
                console.log(results.results[0].FirstName);
                console.log(results.results[0]);
                oResultsModel.setData(results.results[0]);
                this.getView()?.setModel(oResultsModel, "zemployee");  //Prueba para ver si no pierde el valor
                //this.getOwnerComponent()?.setModel(oResultsModel, "zemployee");


                const object = results as any;
                const form = this.getModel("form") as JSONModel;
                form.setData(object.results);

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



                // // 1. Obtener el modelo OData (el que tiene la URL /sap/opu/odata/...)
                // // Si no tiene nombre en el manifest, usa getModel() sin parámetros
                // let oDataModel = (this.getOwnerComponent() as UIComponent).getModel() as ODataModel;
                // if (!oDataModel) {
                //         // Si sigue siendo undefined, probamos con el nombre técnico que suele usarse
                //         oDataModel = this.getOwnerComponent()?.getModel("zemployees") as ODataModel;
                // }
                // // 2. Construir la ruta exacta hacia los adjuntos de ESTE empleado
                // // La sintaxis debe ser igual a la que viste en el "uri" del log
                // const sPath = `/Users(EmployeeId='${employeeId}',SapId='${sapId}')/UserToAttachment`;

                // // 3. Hacer la lectura directa al servidor
                // oDataModel.read(sPath, {
                //         success: (oData: any) => {
                //                 // oData.results contiene el array real de archivos
                //                 const aFiles = oData.results || [];

                //                 // 4. Crear un modelo JSON local solo para este control
                //                 const oFilesModel = new JSONModel(aFiles);
                //                 this.getView()?.setModel(oFilesModel, "archivosLocal");

                //                 // 5. Vincular el UploadSet al nuevo modelo local
                //                 uploadSet.bindAggregation("items", {
                //                         path: "archivosLocal>/",
                //                         template: new UploadSetItem({
                //                                 fileName: "{archivosLocal>DocName}",
                //                                 mediaType: "{archivosLocal>MimeType}",
                //                                 visibleEdit: false,
                //                                 visibleRemove: true
                //                                 // URL para descargar el archivo físico
                //                                 //url: oDataModel.sServiceUrl + sPath + `(DocName='{archivosLocal>DocName}')/$value`
                //                         })
                //                 });
                //         },
                //         error: (oError: any) => {
                //                 console.error("Error al cargar adjuntos:", oError);
                //         }
                // });


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

}