

import RegistrationComponent from '../../../test-utils/component-objects/f-registration.component';

describe('f-registration component tests', () => {
    beforeEach(() => {
        // Arrange
        browser.url('http://localhost:8081');
    });

    it.only('should display errors if mandatory fields are empty', () => {
        // Arrange
        const userInfo = {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        };

        expect(RegistrationComponent.errorSummaryContainerRole()).toBe('alert');
        expect(RegistrationComponent.errorSummaryContainerMessageCount()).toBe(0);
        expect(RegistrationComponent.errorSummaryContainerDisplayed()).toBe(false);

        // Act
        RegistrationComponent.submitRegistrationForm(userInfo);

        // Assert
        expect(RegistrationComponent.isFirstNameEmptyErrorDisplayed()).toBe(true);
        expect(RegistrationComponent.isLastNameEmptyErrorDisplayed()).toBe(true);
        expect(RegistrationComponent.isEmailEmptyErrorDisplayed()).toBe(true);
        expect(RegistrationComponent.isPasswordEmptyErrorDisplayed()).toBe(true);
        expect(RegistrationComponent.errorSummaryContainerMessageCount()).toBe(1);
        expect(RegistrationComponent.errorSummaryContainerMessageText()).toBe('There are 4 errors in the form.');
    });

    it('should show and be able to click the legal documentation', () => {
        // Act
        RegistrationComponent.waitForRegistrationForm();

        // Assert
        expect(RegistrationComponent.termsAndConditionsLinkCanBeClicked()).toBe(true);
        expect(RegistrationComponent.privacyPolicyLinkCanBeClicked()).toBe(true);
        expect(RegistrationComponent.cookiesPolicyLinkCanBeClicked()).toBe(true);
    });
});
