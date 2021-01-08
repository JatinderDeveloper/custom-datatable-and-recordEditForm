public with sharing class DataTableController {
    public DataTableController() {

    }
    @AuraEnabled(cacheable=true)
    public static List<sobject> getData(String fields,String objectName,String wherePart,String limits,String offSet,String fieldSetName) {
      System.debug('fields----'+fields+'object---------'+objectName);
        string sQuery =''; 
        
        if(String.isBlank(limits)){
            limits ='10';
          }
          if(String.isBlank(fields)){
            fields=fieldSetName;
          }
          if(String.isNotBlank(offSet)){
              limits +=' '+offSet;
          }
          if(String.isNotBlank(wherePart)){
            sQuery = 'SELECT '+ fields +' FROM ' +objectName+ ' WHERE '+wherePart+' LIMIT '+limits;
            
          }else{
            sQuery = 'SELECT '+ fields +' FROM ' +objectName +' LIMIT '+limits;
          }
          
          List<sObject> lstOfRecords = new  List<sObject>();
          try {
            lstOfRecords = Database.query(String.escapeSingleQuotes(sQuery));
          }
          catch(Exception ex) {
              throw new AuraHandledException(ex.getMessage());
          }
          return lstOfRecords;
    }

    @AuraEnabled
    public static string getColumns(String fields,String objectName){
      System.debug('fields----'+fields+'object---------'+objectName);
      List<Columns> columnList = new List<Columns>();
      if(String.isNotBlank(fields)){
        String[] fieldsData  = fields.split(',');
        for(String data:fieldsData){
          //System.debug('Data------>'+data);
          String fieldTypeName = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(data).getDescribe().getType().name(); 
          String fieldlable = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(data).getDescribe().getlabel();
          Columns column = new Columns();
          column.apiName=data;
          column.label=fieldlable;
          column.type=fieldTypeName;
          columnList.add(column);
        }
        
        }
        System.debug('columnList----------->'+columnList);
        return JSON.serialize(columnList);
    }
   

    @AuraEnabled
    public static void deleteData(Id lstIds){
        try {
          Database.DeleteResult deleteResult = Database.delete(lstIds, true);
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
  
    @AuraEnabled
    public static List<FieldSetField> getFieldSetFieldsByFieldSetName(String objectApiName, String fieldSetName)
    {
        List<Schema.FieldSetMember> fieldSetMembers = ((SObject)Type.forName(objectApiName).newInstance()).getSObjectType().getDescribe().FieldSets.getMap().get(fieldSetName).getFields();
        //Equal to: 
        //List<Schema.FieldSetMember> fieldSetMembers = Schema.getGlobalDescribe().get(objectName).getDescribe().FieldSets.getMap().get(fieldSetName).getFields();
        List<FieldSetField> fields = new List<FieldSetField>();
        try {
          for (Schema.FieldSetMember fieldSetMember : fieldSetMembers)
          {
              FieldSetField fieldSetField = new FieldSetField(fieldSetMember);
              fields.add(fieldSetField);
          }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        
        return fields;
    }

    public class Columns{
      @AuraEnabled
      public String label{get;set;}
      @AuraEnabled
      public String apiName{get;set;}
      @AuraEnabled
      public String type{get;set;}
    }
    public class FieldSetField
    {
    @AuraEnabled
    public Boolean dbRequired;
    @AuraEnabled
    public String apiName;
    @AuraEnabled
    public String label;
    @AuraEnabled
    public Boolean required;
    @AuraEnabled
    public String type;

    public FieldSetField(Schema.FieldSetMember fieldSetMember)
    {
        this.dbRequired = fieldSetMember.dbRequired;
        this.apiName = fieldSetMember.fieldPath;
        this.label = fieldSetMember.label;
        this.required = fieldSetMember.required;
        this.type = String.valueOf(fieldSetMember.getType());
    }
  }

}