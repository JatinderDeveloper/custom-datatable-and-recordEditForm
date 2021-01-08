import { LightningElement, track, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import getData from "@salesforce/apex/DataTableController.getData";
import deleteData from "@salesforce/apex/DataTableController.deleteData";
import getColumns from "@salesforce/apex/DataTableController.getColumns";
import readFieldSet from "@salesforce/apex/DataTableController.getFieldSetFieldsByFieldSetName";
const actions = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];
const actionData = {
  type: "action",
  typeAttributes: {
    rowActions: actions,
    menuAlignment: "right"
  }
};
export default class CustomDataTable extends LightningElement {
  @track columns = [];
  @track data = [];
  @api objectApiName = "";
  @api wherePart = "";
  @api limit = "";
  @api offSet = "";
  @api fields = "";
  @api title = "";
  @track selected = [];
  @track showLoadingSpinner = false;
  @track bShowModal = false;
  @track recordId = "";
  @api fieldSetName = "";
  @track fieldSetChildValue = "";
  refreshTable;

  // this mehod is call when compoent is connectes to
  connectedCallback() {
    if (this.fields.length > 0) {
      getColumns({ fields: this.fields, objectName: this.objectApiName })
        .then((result) => {
          let colArray = JSON.parse(result);
          this.changeColumnDataType(colArray);
        })
        .catch((error) => {
          this.error = error;
        });
    } else {
      readFieldSet({ objectApiName: this.objectApiName, fieldSetName: this.fieldSetName })
        .then((result) => {
          this.changeColumnDataType(result);
          let filedSetValue = '';
          result.forEach(function (obj) {
            filedSetValue += obj.apiName + ',';
          });
          this.fieldSetChildValue = filedSetValue.slice(0, -1);

        })
        .catch((error) => {
          this.error = error;
        });
    }

  }

  // get the data from server
  @wire(getData, {
    fields: "$fields",
    objectName: "$objectApiName",
    wherePart: "$wherePart",
    limits: "$limit",
    offSet: "$offSet",
    fieldSetName: "$fieldSetChildValue"
  })
  getWiredata(result) {
    if (result.data) {
      this.refreshTable = result;
      if (result.length === 0) {
        this.data = [];
      } else {
        this.data = result.data;

      }
      console.log("data---------->" + JSON.stringify(this.data));
      this.error = "";
    } else if (result.error) {
      this.error = result.error;
      this.data = [];
    }
  }

  handleRowAction(event) {
    let actionName = event.detail.action.name;
    let row = event.detail.row;
    switch (actionName) {
      case "edit":
        this.recordId = row.Id;
        this.bShowModal = true;
        break;
      case "delete":
        this.deleteDataWithId(row);
        break;
    }
  }

  deleteDataWithId(currentRow) {
    this.showLoadingSpinner = true;
    let currentCon = this;
    // calling apex class method to delete the selected data
    deleteData({ lstIds: currentRow.Id })
      .then((result) => {
        console.log("result ====> " + result);
        // showing success message
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success!!",
            message: " Successfully deleted.",
            variant: "success"
          })
        );

        // refreshing table data using refresh apex
        //return refreshApex(this.refreshTable);
        currentCon.handleRefresh();
      })
      .catch((error) => {
        window.console.log("Error ====> " + error);
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error!!",
            message: error.message,
            variant: "error"
          })
        );
      })
      .finally(() => (this.showLoadingSpinner = false));
  }

  // refreshing the datatable
  handleRefresh() {
    return refreshApex(this.refreshTable);
  }

  handleClick(event) {
    console.log('click button');
    this.recordId = "";
    this.bShowModal = true;
  }
  handleChildEvent(event) {
    this.handleRefresh();
    this.recordId = "";
    this.bShowModal = false;
  }
  changeColumnDataType(resultData) {
    let colData = {};
    let colValue = [];
    resultData.forEach(function (obj) {
      if (obj.type === "STRING" || obj.type === "ID") {
        colData = { label: obj.label, fieldName: obj.apiName };
      } else if (obj.type === "DATE") {
        colData = {
          label: obj.label,
          fieldName: obj.apiName,
          type: "date"
        };
      } else if (obj.type === "DATETIME") {
        colData = {
          label: obj.label,
          fieldName: obj.apiName,
          type: "datetime"
        };
      } else if (obj.type === "Integer") {
        colData = {
          label: obj.label,
          fieldName: obj.apiName,
          type: "Integer"
        };
      } else if (obj.type === "BOOLEAN") {
        colData = {
          label: obj.label,
          fieldName: obj.apiName,
          type: "text"
        };
      } else {
        colData = { label: obj.label, fieldName: obj.apiName };
      }
      //console.log("colData--->" + JSON.stringify(colData));
      colValue.push(colData);
    });
    colValue.push(actionData);
    this.columns = colValue;
    console.log("col---->" + JSON.stringify(this.columns));
  }
}