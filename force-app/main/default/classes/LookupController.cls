public with sharing class LookupController {
@AuraEnabled  
public static List<sobject> findRecords(String searchKey, String objectName, String wherePart,String limits,String offSet,String searchField,List<Id> idSet) {  
  string searchText = '\'%' + String.escapeSingleQuotes(searchKey) + '%\''; 
  string sQuery =''; 
  if(String.isBlank(limits)){
    limits ='5';
  }
  if(String.isBlank(searchField)){
    searchField='Id ,Name';
    }
    if(String.isNotBlank(offSet)){
      limits +=' '+offSet;
    }
  if(String.isNotBlank(wherePart)){
   searchText +=' AND ' + wherePart;
    
  }
  if(idSet.size() > 0){
    sQuery ='SELECT '+ searchField +' FROM ' +objectName+ ' WHERE Name LIKE '+searchText+' AND  Id NOT IN :idSet LIMIT '+limits;

  }else{
    sQuery = 'SELECT '+ searchField +' FROM ' +objectName+ ' WHERE Name LIKE '+searchText+' LIMIT '+limits;
  }
  List<sObject> lstOfRecords = new  List<sObject>();
  try {
    lstOfRecords = Database.query(sQuery);
  }
  catch(Exception ex) {
      throw new AuraHandledException(ex.getMessage());
  }

  return lstOfRecords; 
  
} 

}