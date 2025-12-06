/*global QUnit*/
import Controller from "com/logaligroup/finalproject/controller/Master.controller";

QUnit.module("Main Controller");

QUnit.test("I should test the Main controller", function (assert: Assert) {
	const oAppController = new Controller("Main");
	oAppController.onInit();
	assert.ok(oAppController);
});