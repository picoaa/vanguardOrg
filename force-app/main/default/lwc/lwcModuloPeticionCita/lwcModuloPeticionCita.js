import { LightningElement , track} from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

//Apex methods
import getCentros from '@salesforce/apex/getApexData.getCentros';
import getEspecialidades from '@salesforce/apex/getApexData.getEspecialidades';
import getDisponibilidades from '@salesforce/apex/getApexData.getDisponibilidades';
import getHuecos from '@salesforce/apex/getApexData.getHuecos';
import getContact from '@salesforce/apex/getApexData.getContact';

//Contact object and fields
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import OBSERVACIONES_FIELD from '@salesforce/schema/Contact.Observaciones__c';

//Centro Medico object and fields
import CITAMEDICA_OBJECT from '@salesforce/schema/Cita_Medica__c';
import CENTRO_FIELD from '@salesforce/schema/Cita_Medica__c.Centro__c';
import ESPECIALIDAD_FIELD from '@salesforce/schema/Cita_Medica__c.Especialidad__c';
import HUECO_FIELD from '@salesforce/schema/Cita_Medica__c.Hueco__c';
import CONTACT_FIELD from '@salesforce/schema/Cita_Medica__c.Nombre_de_Cliente__c';

export default class LwcModuloPeticionCita extends LightningElement {

    @track cenOptions = [];
    @track espOptions = [];
    @track disOptions = [];
    @track hueOptions = [];

    error = '';
    currentStep = '1';
    espDisabled = true;
    disDisabled = true;

    backDisabled = false;
    nextDisabled = true;
    submitDisabled = true;
    

    centroValue = '';
    especialidadValue = '';
    fechaValue = '';
    huecoValue = '';

    cenName = '';
    espName = '';
    hueName = '';
    citName = '';

    minDate = '';
    maxDate = '';
    espId = '';

    firstNameValue = '';
    lastNameValue = '';
    emailValue = '';
    phoneValue = '';
    commentsValue = '';
    contactValue = '';

    toastMessage = 'Enhorabuena! La cita médica se ha procesado correctamente. ' + 
        'Por favor, guarda tu número de cita ya que te lo pediremos más adelante:';
    showSpinner = false;
    showSpinnerSubmit = false;
    citaSubmitted = false;

    get centroOptions() {
        return this.cenOptions;
    }

    get especialidadOptions() {
        return this.espOptions;
    }

    get huecosOptions() {
        return this.hueOptions;
    }

    get isStepOne() {
        return this.currentStep === "1";
    }
 
    get isStepTwo() {
        return this.currentStep === "2";
    }
 
    get isStepThree() {
        return this.currentStep === "3";
    }

    get isStepFour() {
        return this.currentStep === "4";
    }
 
    get isEnableNext() {
        return this.currentStep !== "4";
    }
 
    get isEnablePrev() {
        return this.currentStep !== "1";
    }
 
    get isEnableFinish() {
        return this.currentStep === "4";
    }

    connectedCallback() {
        this.showSpinner = true;
        getCentros()
        .then(result => {
            let arr = [];
            for(let i=0; i<result.length; i++) {
                arr.push({label: result[i].Name, value: result[i].Id});
            }
            this.cenOptions = arr;
            this.showSpinner = false;
        })
        .catch((error) => {
            this.error = error;
            this.showSpinner = false;
        });
    }

    handleChangeCentro(event) {
        this.showSpinner = true;
        this.centroValue = event.detail.value;
        this.cenName = event.target.options.find(opt => opt.value === event.detail.value).label;
        getEspecialidades({centroId: this.centroValue})
        .then(result => {
            let arr = [];
            for(let i=0; i<result.length; i++) {
                arr.push({label: result[i].Name, value: result[i].Id});
            }
            this.espOptions = arr;
            this.espDisabled = false;
            this.showSpinner = false;
        })
        .catch((error) => {
            this.error = error;
            this.showSpinner = false;
        });
    }

    handleChangeEspecialidad(event) {
        this.showSpinner = true;
        this.especialidadValue = event.detail.value;
        this.espName = event.target.options.find(opt => opt.value === event.detail.value).label;
        getDisponibilidades({especialidadId: this.especialidadValue})
        .then(result => {
            this.maxDate = result[0].Fecha_fin__c;
            this.minDate = result[0].Fecha_de_inicio__c;
            this.disDisabled = false;
            this.showSpinner = false;
        })
        .catch((error) => {
            this.error = error;
            this.showSpinner = false;
        });
    }

    handleChangeFecha(event) {
        this.showSpinner = true;
        this.fechaValue = event.detail.value;
        getHuecos({fechaSeleccionada: this.fechaValue, espId: this.especialidadValue})
        .then(result => {
            let arr = [];
            for(let i=0; i<result.length; i++) {
                arr.push({label: result[i].Resumen_Hueco__c, value: result[i].Id});
            }
            this.hueOptions = arr;
            this.showSpinner = false;
            this.nextDisabled = false;
        })
        .catch((error) => {
            this.error = error;
            this.showSpinner = false;
        });
    }

    handleChangeHueco(event) {
        this.huecoValue = event.detail.value;
        this.hueName = event.target.options.find(opt => opt.value === event.detail.value).label;
        this.handleNextDisabled();
    }

    handleChangeName(event) {
        this.firstNameValue = event.target.value;
        this.handleNextDisabled()
    }

    handleChangeLastName(event) {
        this.lastNameValue = event.target.value;
        this.handleNextDisabled()
    }

    handleChangeEmail(event) {
        this.emailValue = event.target.value;
        this.handleNextDisabled()
    }

    handleChangePhone(event) {
        this.phoneValue = event.target.value;
        this.handleNextDisabled()
    }

    handleChangeComments(event) {
        this.commentsValue = event.target.value;
    }

    handleOnStepClick(event) {
        if(((this.currentStep === '1' || this.currentStep === '2' || this.currentStep === '3') && event.target.value > this.currentStep) && this.nextDisabled === true) {
            console.log('not allowed to go forward');
        } else if(this.currentStep === '4' && this.citaSubmitted === true) {
            console.log('not allowed go back after pedir cita')
        } else {
            this.currentStep = event.target.value;
            this.handleNextDisabled();
        }
    }
 
    handleNext() {
        if(this.currentStep === "1") {
            this.currentStep = "2";
        }
        else if(this.currentStep === "2") {
            this.currentStep = "3";
        }
        else if(this.currentStep === "3") {
            this.currentStep = "4";
            this.submitDisabled = false;
        }
        this.handleNextDisabled();
    }
 
    handlePrev() {
        if(this.currentStep === "4") {
            this.currentStep = "3";
        }
        else if(this.currentStep === "3") {
            this.currentStep = "2";
        }
        else if(this.currentStep === "2") {
            this.currentStep = "1";
        }
        this.handleNextDisabled();
    }

    handleNextDisabled() {
        if(this.currentStep === '1' && this.centroValue === '' && this.especialidadValue === '' && this.fechaValue === '') {
            this.nextDisabled = true;
        } else if (this.currentStep === '2' && this.huecoValue === '') {
            this.nextDisabled = true;
        } else if (this.currentStep === '3' && this.firstNameValue === '') {
            this.nextDisabled = true;
        } else if (this.currentStep === '3' && this.lastNameValue === '') {
            this.nextDisabled = true;
        } else if (this.currentStep === '3' && this.emailValue === '') {
            this.nextDisabled = true;
        } else if (this.currentStep === '3' && this.phoneValue === '') {
            this.nextDisabled = true;
        } else {
            this.nextDisabled = false;
        }
    }
 
    handleSubmit() {
        this.submitDisabled = true;
        this.backDisabled = true;
        this.showSpinnerSubmit = true;
        this.citaSubmitted = true;
        // call apex and decides if create contact and then calls createCita() method
        getContact({email: this.emailValue, phone: this.phoneValue})
        .then( data => {
            if(data.length > 0) {
                console.log('Contact not created')
                console.log('Found contact record with the same email or phone number')
                this.contactValue = data[0].Id;
                this.createCita();
            } else {
                try {
                    const fields = {};

                    fields[FIRSTNAME_FIELD.fieldApiName] = this.firstNameValue;
                    fields[LASTNAME_FIELD.fieldApiName] = this.lastNameValue;
                    fields[EMAIL_FIELD.fieldApiName] = this.emailValue;
                    fields [PHONE_FIELD.fieldApiName] = this.phoneValue;
                    fields [OBSERVACIONES_FIELD.fieldApiName] = this.commentsValue;

                    const recordInput = {
                        apiName: CONTACT_OBJECT.objectApiName,
                        fields: fields
                    };
                    
                    console.log('recordInput Contact object set');

                    createRecord(recordInput)
                    .then((record) => {
                        console.log('Created contact record');
                        this.contactValue = record.id;
                        this.createCita();
                    });

                } catch(error) {
                    console.error('Error creating contact' + error.message);
                    this.showToast('Resultado', 'Lo sentimos, ha habido un problema y tu cita no se ha podido procesar. Por favor, inténtalo de nuevo de nuevo más tarde o ponte en contacto con los Administradores del sistema.', 'error', 'sticky');
                }
            }
        })
    }

    createCita() {
        try {
            const fields = {};

            fields[CENTRO_FIELD.fieldApiName] = this.centroValue;
            fields[ESPECIALIDAD_FIELD.fieldApiName] = this.especialidadValue;
            fields[HUECO_FIELD.fieldApiName] = this.huecoValue;
            fields[CONTACT_FIELD.fieldApiName] = this.contactValue;

            const recordInput = {
                apiName: CITAMEDICA_OBJECT.objectApiName,
                fields: fields
            };
            
            console.log('recordInput cita object set');

            createRecord(recordInput)
            .then((record) => {
                console.log('Created cita record');
                console.log(record);
                this.citName = record.fields.Name.value;
                this.showToast('Resultado', 'success', 'sticky');
            });

        } catch(error) {
            console.error('Error creating cita' + error.message);
            this.showToast('Resultado', 'Lo sentimos, ha habido un problema y tu cita no se ha podido procesar. Por favor, inténtalo de nuevo de nuevo más tarde o ponte en contacto con los Administradores del sistema.', 'error', 'sticky');
        }
    }

    showToast(title, variant, mode) {
        this.showSpinnerSubmit = false;
        const event = new ShowToastEvent({
            title: title,
            message: this.toastMessage + ' {0}',
            messageData: [
                this.citName,
            ],
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(event);
    }
}