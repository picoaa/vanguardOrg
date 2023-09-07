import { createElement } from 'lwc';
import LwcModuloPeticionCita from 'c/lwcModuloPeticionCita';

describe('c-lwc-modulo-peticion-cita', () => {

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();
    });

    it('DOM renders the correct elements and properties', () => {

        // Arrange (Creates initial element)
        const element = createElement('c-lwc-modulo-peticion-cita', {
            is: LwcModuloPeticionCita
        });

        // Add elements to dom and Act
        document.body.appendChild(element);

        const lightningCard = element.shadowRoot.querySelector('lightning-card');
        const stepIndicator = element.shadowRoot.querySelector('lightning-progress-indicator');
        const stepButton = element.shadowRoot.querySelectorAll('lightning-progress-step');
        const comboboxFirstStep = element.shadowRoot.querySelectorAll('lightning-combobox');
        const fechaInput = element.shadowRoot.querySelectorAll('lightning-input');
        const nextButton = element.shadowRoot.querySelector('lightning-button');

        expect(lightningCard.title).toBe('Petición de Cita Médica');
        expect(stepIndicator.currentStep).toBe('1');
        expect(stepButton[0].label).toBe('Paso 1');
        expect(comboboxFirstStep.length).toBe(2);
        expect(comboboxFirstStep[0].label).toBe('Centro');
        expect(comboboxFirstStep[1].label).toBe('Especialidad');
        expect(fechaInput.length).toBe(1);
        expect(fechaInput[0].label).toBe('Selecciona una fecha');
        expect(nextButton.disabled).toBe(true);
        expect(nextButton.label).toBe("Siguiente");
    });

    it('Next button is reactive to user click and 2nd step page is rendered after user set the inputs', () => {

        // Arrange (Creates initial element)
        const element = createElement('c-lwc-modulo-peticion-cita', {
            is: LwcModuloPeticionCita
        });

        // Add elements to dom and Act
        document.body.appendChild(element);

        const stepIndicator = element.shadowRoot.querySelector('lightning-progress-indicator');
        const nextButton = element.shadowRoot.querySelector('lightning-button');

        // Mocked the button propertie value as if the user has added all the info needed in the inputs
        nextButton.disabled = false;
        nextButton.click();
        
        return Promise.resolve()
            .then(() => {
                const comboboxSecondStep = element.shadowRoot.querySelectorAll('lightning-combobox');
                const buttonsSecondStep = element.shadowRoot.querySelectorAll('lightning-button');
                expect(comboboxSecondStep.length).toBe(1);
                expect(stepIndicator.currentStep).toBe('2');
                expect(buttonsSecondStep.length).toBe(2);
            })
    });

    it('Step button does not react to user click and 2nd step page is not rendered if the input fields are not set by user previously', () => {

        // Arrange (Creates initial element)
        const element = createElement('c-lwc-modulo-peticion-cita', {
            is: LwcModuloPeticionCita
        });

        // Add elements to dom and Act
        document.body.appendChild(element);

        const stepButton = element.shadowRoot.querySelectorAll('lightning-progress-step');
        const stepIndicator = element.shadowRoot.querySelector('lightning-progress-indicator');

        stepButton[0].click();
        
        return Promise.resolve()
            .then(() => {
                const comboboxFirstStep = element.shadowRoot.querySelectorAll('lightning-combobox');
                const buttonsFirstStep = element.shadowRoot.querySelectorAll('lightning-button');
                expect(stepIndicator.currentStep).toBe('1');
                expect(comboboxFirstStep.length).toBe(2);
                expect(buttonsFirstStep.length).toBe(1);

            })
    });
});