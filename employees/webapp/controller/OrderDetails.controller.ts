import View from "sap/ui/core/mvc/View";
import BaseController from "./BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Signature from "../control/Signature";
import Context from "sap/ui/model/Context";
import Utils from "../utils/Utils";
import MessageBox from "sap/m/MessageBox";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import Filter from "sap/ui/model/Filter";
import JSONModel from "sap/ui/model/json/JSONModel";


/**
 * @namespace com.logaligroup.employees.controller
 */
export default class OrderDetails extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void | undefined {

        const router = this.getRouter();
        router.getRoute("RouteOrderDetails")?.attachPatternMatched(this.onBindingContext.bind(this));

    }

    private onBindingContext(event : Route$PatternMatchedEvent ) : void {

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
                },
                dataRequest: () => {
                    view.setBusy(true);
                },
                dataReceived: () => {
                    view.setBusy(false);
                }
            }
        });        
    }

    public onClearPress(): void{
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

}