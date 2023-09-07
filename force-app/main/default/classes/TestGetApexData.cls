@isTest
public with sharing class TestGetApexData {

    public static void createRecords(Integer amount) {
        List<Centro__c> centros = new List<Centro__c>();
        for (Integer i=1;i<=amount;i++) {
            centros.add(
                new Centro__c(
                    Name='Centro' + i
                    )
                );
        }
        insert centros;
        List<Especialidad__c> especialidades = new List<Especialidad__c>();
        for(Integer i=1;i<=amount;i++) {
            especialidades.add(
                new Especialidad__c(
                    Name='EspecialidadCentroA' + i,
                    Centro__c = centros[0].Id
                )
            );
            especialidades.add(
                new Especialidad__c(
                    Name='EspecialidadCentroB' + i,
                    Centro__c = centros[1].Id
                )
            );
        }
        insert especialidades;
        List<Disponibilidad__c> disponibilidades = new List<Disponibilidad__c>();
        for(Integer i=1;i<=amount;i++) {
            disponibilidades.add(
                new Disponibilidad__c(
                    Name='DisponibilidadEsp' + i,
                    Especialidad__c  = especialidades[0].Id,
                    Fecha_de_inicio__c = System.today() - i,
                    Fecha_fin__c = System.today() + i
                )
            );
            disponibilidades.add(
                new Disponibilidad__c(
                    Name='DisponibilidadEspB' + i,
                    Especialidad__c  = especialidades[1].Id,
                    Fecha_de_inicio__c = System.today() - i -2,
                    Fecha_fin__c = System.today() + i + 2
                )
            );
        }
        insert disponibilidades;
        List<Hueco__c> huecos = new List<Hueco__c>();
        for(Integer i=1;i<=amount;i++) {
            huecos.add(
                new Hueco__c(
                    Disponibilidad__c  = disponibilidades[0].Id,
                    Hora_de_inicio__c = Time.newInstance(8 - i,0,0,0),
                    Hora_fin__c = Time.newInstance(8 + i,0,0,0),
                    Fecha__c = System.today() + i
                )
            );
            huecos.add(
                new Hueco__c(
                    Disponibilidad__c  = disponibilidades[1].Id,
                    Hora_de_inicio__c = Time.newInstance(12 + i,0,0,0),
                    Hora_fin__c = Time.newInstance(12 + i,0,0,0),
                    Fecha__c = System.today() + i
                )
            );
        }
        insert huecos;
    }

    public static void createContacts(Integer amount) {
        List<Contact> contacts = new List<Contact>();
        for (Integer i=1;i<=amount;i++) {
            contacts.add(
                new Contact(
                    FirstName='First ' + i,
                    LastName='Last ' + i,
                    Email='testApex' + i + '@test.com',
                    Phone='1234567' + i
                    )
                );
        }
        insert contacts;
    }

    @isTest static void testGetData() {

        TestGetApexData.createRecords(101);

        Test.startTest();
        List<Centro__c> cent = getApexData.getCentros();
        List<Especialidad__c> espe = getApexData.getEspecialidades(cent[0].Id);
        List<Disponibilidad__c> disp = getApexData.getDisponibilidades(espe[0].Id);
        Date selectedDate = System.today() + 2;
        List<Hueco__c> huec = getApexData.getHuecos(selectedDate, espe[0].Id);

        Test.stopTest();

        System.assertEquals(cent[0].Name, 'Centro1');
        System.assertEquals(cent.size(), 100);
        System.assertEquals(espe.size(), 100);
        System.assertEquals(espe[0].Name, 'EspecialidadCentroA1');
        System.assertEquals(disp.size(), 100);
        System.assert(huec.size() > 0);
        System.assert(huec.size() <= 100);

    }

    @isTest static void testGetExistingContactByEmail() {

        TestGetApexData.createContacts(10);

        Test.startTest();
        List<Contact> cont = getApexData.getContact('testApex1@test.com', '42342234');
        Test.stopTest();

        System.assertEquals(cont[0].Name, 'First 1 Last 1');
        System.assertEquals(cont.size(), 1);

    }

    @isTest static void testGetExistingContactByPhone() {

        TestGetApexData.createContacts(10);

        Test.startTest();
        List<Contact> cont = getApexData.getContact('testApex43242341@test.com', '12345678');
        Test.stopTest();

        System.assertEquals(cont[0].Phone, '12345678');
        System.assertEquals(cont.size(), 1);
    }

    @isTest static void testGetNonExistingContact() {

        TestGetApexData.createContacts(10);

        Test.startTest();
        List<Contact> cont = getApexData.getContact('noEmail', '43242352524');
        Test.stopTest();

        System.assertEquals(cont.size(), 0);
    }
}