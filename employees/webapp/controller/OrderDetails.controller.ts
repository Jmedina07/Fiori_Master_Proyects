import View from "sap/ui/core/mvc/View";
import BaseController from "./BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Signature from "../control/Signature";
import Context from "sap/ui/model/odata/v2/Context";
import Utils from "../utils/Utils";
import MessageBox from "sap/m/MessageBox";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import Filter from "sap/ui/model/Filter";
import UploadSet, { UploadSet$AfterItemRemovedEvent, UploadSet$BeforeUploadStartsEvent, UploadSet$UploadCompletedEvent } from "sap/m/upload/UploadSet";
import UploadSetItem, { UploadSetItem$OpenPressedEvent } from "sap/m/upload/UploadSetItem";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Item from "sap/ui/core/Item";


/**
 * @namespace com.logaligroup.employees.controller
 */

export default class OrderDetails extends BaseController {


    public onInit() : void | undefined {
        const router = this.getRouter();
        router.getRoute("RouteOrderDetails")?.attachPatternMatched(this.onBindingContext.bind(this));
    }

    private onBindingContext (event : Route$PatternMatchedEvent) : void {
        const args = event.getParameter("arguments") as any;
        const employeeId = args.key;
        const orderId = args.key2;

        const view = this.getView() as View;

        ///Orders(10248)
        view.bindElement({
            path: `/Orders(${orderId})`,
            model: 'northwind',
            events: {
                change: () => {
                    this.read();
                    this.searchFiles();
                },
                dataRequest: () => {
                    view.setBusy(true);
                },
                dataReceived: () => {
                    view.setBusy(false);
                }
            }
        })
    }

    public onClearPress () : void {
        const signature = this.byId("signature") as Signature;
        signature.clear();
    }

    public async onSavePress () : Promise<void> {
        const signature = this.byId("signature") as Signature;
        const bindingContext = this.getView()?.getBindingContext("northwind") as Context;
        const resourceBundle = this.getResourceBundle();
        const utils = new Utils(this);


        if (!signature.isFill()) {
            MessageBox.error(resourceBundle.getText("fillSignature") || '');
        } else {
            const sSignature = signature.getSignature();
            //data:image/png;base64,
            const sMediaContent = sSignature.replace("data:image/png;base64,","");
            const body = {
                path: '/SignatureSet',
                data: {
                    OrderId: bindingContext.getProperty("OrderID").toString(),
                    SapId: utils.getEmail(),
                    EmployeeId: bindingContext.getProperty("EmployeeID").toString(),
                    MimeType: 'image/png',
                    MediaContent: sMediaContent
                }
            };
            
            await utils.crud('create', new JSONModel(body));
        }
    }

    private async read () : Promise<void | ODataListBinding> {

        const bindingContext = this.getView()?.getBindingContext("northwind") as Context;
        const utils = new Utils(this);

        let body = {
            path: '/SignatureSet',
            filters:[
                new Filter("OrderId","EQ", bindingContext.getProperty("OrderID").toString()),
                new Filter("SapId","EQ", utils.getEmail()),
                new Filter("EmployeeId","EQ",bindingContext.getProperty("EmployeeID").toString())
            ]
        };

        const results = await utils.read(new JSONModel(body));
        this.showSignature(results);
    }

    public showSignature (data : void | ODataListBinding ) : void {
        let results = data as any;
        const signature = this.byId("signature") as Signature;
        const mediaContent = results.results[0].MediaContent;
        signature.setSignature("data:image/png;base64,"+mediaContent);
    }

    public onRefreshPress () : void {
        this.read();
    }

    public onBeforeUpload (event : UploadSet$BeforeUploadStartsEvent) : void {
        const item = event.getParameter("item") as UploadSetItem;
        const utils = new Utils(this);
        const context = this.getView()?.getBindingContext("northwind");
        const model = this.getOwnerComponent()?.getModel("zinvoices") as ODataModel;
        const token = model.getSecurityToken();
        const fileName = item.getFileName();
        const mediaType = item.getMediaType();
        const orderId = context?.getProperty("OrderID");
        const sapId = utils.getEmail();
        const employeeId = context?.getProperty("EmployeeID");

        console.log({
            fileName,
            mediaType,
            token,
            orderId,
            sapId,
            employeeId
        });

        const headerToken = new Item({
            key: "x-csrf-token",
            text: token
        });

        const headerSlug = new Item({
            key: 'slug',
            text: `${orderId};${sapId};${employeeId};${fileName};${mediaType}`
        });

        item.addHeaderField(headerToken);
        item.addHeaderField(headerSlug);
    }

    public onUploadCompleted (event : UploadSet$UploadCompletedEvent) : void {
        const uploadSet = event.getSource();
            uploadSet.getBinding("items")?.refresh();
    }

    private searchFiles () : void {
        const utils = new Utils(this);
        const context = this.getView()?.getBindingContext("northwind");
        const orderId = context?.getProperty("OrderID");
        const sapId = utils.getEmail();
        const employeeId = context?.getProperty("EmployeeID");

        const uploadSet = this.byId("upload") as UploadSet;
            uploadSet.bindAggregation("items", {
                path: 'zinvoices>/FilesSet',
                filters: [
                    new Filter("OrderId","EQ",orderId),
                    new Filter("SapId","EQ",sapId),
                    new Filter("EmployeeId","EQ",employeeId)
                ],
                template: new UploadSetItem({
                    fileName: '{zinvoices>FileName}',
                    mediaType: '{zinvoices>MimeType}',
                    visibleEdit: false,
                    visibleRemove: true,
                    url: "hola",
                    openPressed: this.download.bind(this)
                })
            });
    }

    private download (event : UploadSetItem$OpenPressedEvent) : void {
        const item = event.getSource() as UploadSetItem;
        const context = item.getBindingContext("zinvoices") as Context;
        const path = context.getPath();
        // /sap/opu/odata/sap/YSAPUI5_SRV_01/FilesSet(AttId='0668',OrderId='010258',SapId='c25c385%40logaligroup.com',EmployeeId='0001')/$value
        const url = `/comlogaligroupemployees/sap/opu/odata/sap/YSAPUI5_SRV_01${path}/$value`
        item.setUrl(url);
    }

    public async onAfterRemoved (event: UploadSet$AfterItemRemovedEvent) : Promise<void> {

        const item = event.getParameter("item") as UploadSetItem;
        const context = item.getBindingContext("zinvoices") as Context;
        const path = context.getPath();

        const utils = new Utils(this);
        await utils.crud('delete', new JSONModel({path: path}));
        item.getBinding("items")?.refresh();
    }
}