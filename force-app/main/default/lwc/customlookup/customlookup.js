import { api, LightningElement, track } from "lwc";
import findRecords from "@salesforce/apex/LookupController.findRecords";
export default class Customlookup extends LightningElement {
  searchKey = "";
  @api objectApiName = "";
  @api wherePart = "";
  @api limit = "";
  @api offSet = "";
  @api label = "";
  @api placeHolder = "";
  @api searchField = "";
  @track records = [];
  @track uniqueIds = [];
  @track selectedName = "";
  @track selectedRecords = [];
  @track selectedId = "";
  @track listVisible;
  @track focusIndex = 1;

  @api iconName = "";
  @api multiSelect = "";
  //boolean
  @track showSearchIcon = true;
  @track inputReadOnly = false;
  @track selectedValue=false;
  @track mulitpleSelection;
  processing = false;
  //set

  //css
  boxValue = "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click";
  @track boxclass = this.boxValue;

  // when user serach key word in input filed
  searchKeyword(event) {
    this.searchKey = event.target.value;
    this.selectedName = event.target.value;
    console.log("Search item" + this.searchKey);
    if(this.selectedValue){
      return;
    }
    this.processing = true;
    this.getLookupResult();
  }
   // when user click to list item 
  clickListItem(event, enterValue) {
    let selectedId = "";
    let selectedName = "";
    if (enterValue) {
      let recordData = this.records;
      let focusIndex = this.focusIndex - 1;
      selectedId = recordData[focusIndex].Id;
      selectedName = recordData[focusIndex].Name;
      this.selectedName = selectedName;
    } else {
      selectedId = event.currentTarget.dataset.id;
      selectedName = event.currentTarget.dataset.name;
      this.selectedName = selectedName;
    }
    this.boxclass = this.boxValue;

    let selectedRecords = this.selectedRecords;
    //console.log('selectedId------->' + selectedId);
    if (this.multiSelect == "true") {
      this.showSearchIcon = true;
      this.inputReadOnly = false;
      this.mulitpleSelection = true;
      this.selectedName = "";
      let duplicateValue = false;
      for (let i = 0; i < selectedRecords.length; i++) {
        if (selectedId === selectedRecords[i].RecordId) {
          duplicateValue = true;
          break;
        } else {
          duplicateValue = false;
        }
      }
      if (!duplicateValue) {
        let newsObject = {
          Id: this.selectedRecords[this.selectedRecords.length - 1]
            ? this.selectedRecords[this.selectedRecords.length - 1].Id + 1
            : 0,
          Name: selectedName,
          RecordId: selectedId
        };
        this.selectedRecords.push(newsObject);
        this.uniqueIds.push(selectedId);
        //console.log('uniqueIds------>' + this.uniqueIds + '---->');
      }
      console.log(JSON.stringify(this.selectedRecords));
      const selectedEvent = new CustomEvent("multiplevalueselected", {
        detail: {
          selectedRecords
        }
      });
      this.dispatchEvent(selectedEvent);
    } else {
      this.showSearchIcon = false;
      this.inputReadOnly = true;
      this.selectedValue= true;
      this.mulitpleSelection = false;

      const selectedEvent = new CustomEvent("valueselected", {
        detail: {
          selectedId: event.currentTarget.dataset.id,
          selectedName: event.currentTarget.dataset.name
        }
      });
      this.dispatchEvent(selectedEvent);
    }
  }
  // get the data from server 
  getLookupResult() {
    findRecords({
      searchKey: this.searchKey,
      objectName: this.objectApiName,
      wherePart: this.wherePart,
      limits: this.limit,
      searchField: this.searchField,
      idSet: this.uniqueIds
    })
      .then((result) => {
        console.log(result);
        if (result.length === 0) {
          this.records = [];
          this.boxclass = this.boxValue;
        } else {
          this.records = [];
          result.forEach((record) => {
            this.records.push({
              Id: record.Id,
              Name: record.Name,
              focusIndex: this.records.length + 1
            });
          });
          this.boxclass =
            "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open";
          // console.log(JSON.stringify(this.records));
        }
      })
      .catch((error) => {
        this.records = [];
        console.log(error);
      })
      .finally(() => (this.processing = false));
  }

  getFocusout() {
    setTimeout(() => {
      this.searchKey = "";
      this.records = [];
      this.processing = false;
      this.focusIndex = 1;
      
    }, 300);
  }
  // when use click to cross button inside input filed
  resetData() {
    this.selectedName = "";
    this.inputReadOnly = false;
    this.selectedValue= false;
    this.showSearchIcon = true;
    const selectedEvent = new CustomEvent("valueselected", {
      detail: {
        selectedId: "",
        selectedName: ""
      }
    });
    this.dispatchEvent(selectedEvent);
  }
  // when user click to pill cross icon
  removeRecord(event) {
    let selectedDataId = event.target.name;
    let selectedRecords = this.selectedRecords;
    let uniqueIds = this.uniqueIds;
    let selectedRecordsIndex;
    let removeId;
    // console.log('selectedDataId---' + selectedDataId);
    for (let i = 0; i < selectedRecords.length; i++) {
      if (selectedDataId === selectedRecords[i].Id) {
        selectedRecordsIndex = i;
        removeId = selectedRecords[i].RecordId;
      }
    }
    selectedRecords.splice(selectedRecordsIndex, 1);
    uniqueIds.splice(removeId, 1);
    // console.log('uniqueIds---' + uniqueIds);
  }

  get showCloseButton() {
    return this.mulitpleSelection == false && this.showSearchIcon == false
      ? true
      : false;
  }
  
  keyPressController(event) {
    const keyCode = event.which || event.keyCode || 0;
    console.log("keyCode---------->" + event.which);
    if (event.which == 40) {
      this.moveFocusDown(this.focusIndex);
    } else if (event.which == 38) {
      this.moveFocusUp(this.focusIndex);
    } else if (event.which == 13) {
      this.clickListItem(event, true);
    }
  }
  // when user press up keyword
  moveFocusUp(focusIndexValue) {
    const lstSelectedRecord = this.records;
    if (lstSelectedRecord && lstSelectedRecord.length > 0) {
      let focusIndex = focusIndexValue;
      focusIndex--;
      if (focusIndex < 1) {
        focusIndex = lstSelectedRecord.length;
        let name = "[data-name=" + lstSelectedRecord[lstSelectedRecord.length - 1].Name +" ]";
        this.template.querySelector(name).style.backgroundColor = "#F5F5F5";

        let preName = "[data-name=" + lstSelectedRecord[0].Name + " ]";
        this.template.querySelector(preName).style.backgroundColor = "#FFFFFF";
      } else {
        let data = "[data-name=" + lstSelectedRecord[focusIndex - 1].Name + " ]";
        this.template.querySelector(data).style.backgroundColor = "#F5F5F5";

        let preName = "[data-name=" + lstSelectedRecord[focusIndex].Name + " ]";
        this.template.querySelector(preName).style.backgroundColor = "#FFFFFF";
      }
      this.focusIndex = focusIndex;
       console.log("focusIndex------->" + focusIndex);
    }
  }
  // when user press down keyword
  moveFocusDown(focusIndexValue) {
    const lstSelectedRecord = this.records;
    if (lstSelectedRecord && lstSelectedRecord.length > 0) {
      let focusIndex = focusIndexValue;
      focusIndex++;
      if (focusIndex > lstSelectedRecord.length) {
        focusIndex = 1;
        let name = "[data-name=" + lstSelectedRecord[lstSelectedRecord.length - 1].Name + " ]";
        this.template.querySelector(name).style.backgroundColor = "#FFFFFF";

        let preName = "[data-name=" + lstSelectedRecord[0].Name + " ]";
        this.template.querySelector(preName).style.backgroundColor = "#F5F5F5";
      } else {
        let name = "[data-name=" + lstSelectedRecord[focusIndex - 1].Name + " ]";
        this.template.querySelector(name).style.backgroundColor = "#F5F5F5";

        let preName = "[data-name=" + lstSelectedRecord[focusIndex - 2].Name + " ]";
        this.template.querySelector(preName).style.backgroundColor = "#FFFFFF";
      }
      this.focusIndex = focusIndex;
       console.log("focusIndex------->" + focusIndex);
    }
  }

  onMouseEnter(event) {
    this.focusIndex = event.target.dataset.targetId;
    console.log("<-----focusIndex------->" + this.focusIndex);
  }
  onMouseLeave(event){
    this.focusIndex = 1;
  }
}