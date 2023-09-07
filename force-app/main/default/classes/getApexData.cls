public with sharing class getApexData {
    @AuraEnabled
    public static List<Centro__c> getCentros(){
        return [Select Id, Name From Centro__c Order By Name Asc Limit 100];
    }

    @AuraEnabled
    public static List<Especialidad__c> getEspecialidades(String centroId){
        return [Select Id, Name From Especialidad__c Where Centro__r.Id = :centroId Order By Name Asc Limit 100];
    }

    @AuraEnabled
    public static List<Disponibilidad__c> getDisponibilidades(String especialidadId){
        Date todaysDate = System.today();
        return [
            Select Id, Fecha_de_inicio__c, Fecha_fin__c 
            From Disponibilidad__c 
            Where Especialidad__r.Id = :especialidadId AND Fecha_fin__c >= :todaysDate 
            Order By Fecha_fin__c Desc
            Limit 100
        ];
    }

    @AuraEnabled
    public static List<Hueco__c> getHuecos(Date fechaSeleccionada, String espId) {
        Date todaysDate = System.today();
        Date fechaJs = fechaSeleccionada;
        Date abanicoFechasLow = fechaJs - 4;
        Date abanicoFechasUp = fechaJs + 4;
        return [
            Select Id, Fecha__c, Name, Hora_de_inicio__c, Hora_fin__c, Resumen_Hueco__c 
            From Hueco__c 
            Where Disponibilidad__r.Especialidad__r.Id = :espId
                AND Disponibilidad__r.Fecha_fin__c >= :todaysDate
                AND Fecha__c >= :todaysDate
                AND (Fecha__c >= :abanicoFechasLow AND Fecha__c <= :abanicoFechasUp)
            Order By Fecha__c Asc
            Limit 100
        ];
    }

    @AuraEnabled
    public static List<Contact> getContact(String email, String phone){
        return [
            Select Id, Name, Phone 
            From Contact 
            Where Email = :email OR Phone = :phone
            Limit 1
        ];
    }
}