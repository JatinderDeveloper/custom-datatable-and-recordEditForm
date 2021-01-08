import { LightningElement, api, wire, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getColumns from "@salesforce/apex/DataTableController.getColumns";

export default class CustomRecordEditForm extends LightningElement {
  @api currentRecordId = "";
  @api objectApiName = "";
  @api fields = "";
  @api heading="";
  @track fieldArray = [];
  @api bShowModal = false;
  @api fieldSetName = "";
  @track showLoadingSpinner;


  connectedCallback() {
    let fieldData = [];
    if (this.fields.length > 0) {
      console.log('field Data');
      fieldData = this.fields.split(",");
      this.handlefiledValueSet(fieldData);
    } else {
      getColumns({ fields: this.fields, objectName: this.objectApiName, fieldSetName: this.fieldSetName })
        .then((result) => {
          let filedValuewithComma = '';
          result.forEach(function (obj) {
            console.log('column value--->' + obj.apiName);
            filedValuewithComma += obj.apiName + ',';
          });
          let filedSetValue = filedValuewithComma.slice(0, -1);
          fieldData = filedSetValue.split(",");
          console.log('--column value--->' + fieldData + ' lenght--' + fieldData.length);
          this.handlefiledValueSet(fieldData);
        })
        .catch((error) => {
          this.error = error;
        });
    }

  }
  // closing modal box
  closeModal() {
    this.bShowModal = false;
    this.dispatchEvent(new CustomEvent('close'));
  }

  // handleing record edit form submit
  handleSubmit(event) {
    this.showLoadingSpinner = true;
    // prevending default type sumbit of record edit form
    event.preventDefault();
    // querying the record edit form and submiting fields to form
    this.template
      .querySelector("lightning-record-edit-form")
      .submit(event.detail.fields);

    this.showLoadingSpinner = false;

  }
  // refreshing the datatable after record edit form success
  handleSuccess() {
    // closing modal
    this.bShowModal = false;
    // showing success message
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Success!!",
        message: " Updated Successfully!!.",
        variant: "success"
      })
    );
    this.dispatchEvent(new CustomEvent('success'));
  }
  handlefiledValueSet(fieldData) {
    if (fieldData.length > 0) {
      fieldData.forEach((data) => {
        console.log('--Data--->' + fieldData);
        this.fieldArray.push({
          Key: this.fieldArray.length + 1,
          Name: data
        });
      });
    }
  }

}