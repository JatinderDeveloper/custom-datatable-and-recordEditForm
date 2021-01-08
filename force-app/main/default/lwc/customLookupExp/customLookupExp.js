import { LightningElement, track,api } from 'lwc';

export default class CustomLookupExp extends LightningElement {
    @track selectedRecordId = '';
    @track selectedName = '';
    @track multipleRecord=[];

    handleValueSelcted(event) {
        this.selectedRecordId = event.detail.selectedId;
        this.selectedName = event.detail.selectedName;
       
    }
    multipleValueSelected(event){
        this.multipleRecord=event.detail.selectedRecords;
    }

    get singleValue(){
        return (((this.selectedRecordId !='')?true:false));
    }
    get multipleValue(){
        return ((this.multipleRecord.length > 0)?true:false);
    }
}