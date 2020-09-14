<template>
    <card
        :data-theme-registration="theme"
        :card-heading="title"
        is-rounded
        has-outline
        is-page-content-wrapper
        card-heading-position="center"
        data-test-id="registration-component">
        <p
            v-if="shouldShowLoginLink"
            :class="$style['c-loginLink']"
            data-test-id="create-account-login-link">
            {{ loginSettings.preLinkText }} <a :href="loginSettings.url">{{ loginSettings.linkText }}</a>
        </p>

        <form
            type="post"
            :class="$style['o-form']"
            @submit.prevent="onFormSubmit">
            <!-- TODO WCB-1031 - Extract error messages into a separate component -->

            <section
                id="error-summary-container"
                :class="$style['is-visuallyHidden']"
                role="alert">
                <p
                    v-if="genericErrorMessage"
                    :class="$style['o-form-error']">
                    <warning-icon :class="$style['o-form-error-icon']" />
                    {{ genericErrorMessage }}
                </p>
            </section>
            <form-field
                v-model="firstName"
                name="firstName"
                data-test-id="input-first-name"
                label-text="First name"
                input-type="text"
                label-style="inline"
                aria-describedby="error-message-firstname"
                :aria-invalid="!!describeFirstnameErrorMessage"
                @blur="$v.firstName.$touch">
                <template
                    v-if="describeFirstnameErrorMessage"
                    #error>
                    <p
                        id="error-message-firstname"
                        :class="$style['o-form-error']"
                        data-test-id='error-first-name-empty'>
                        <warning-icon :class="$style['o-form-error-icon']" />
                        {{ describeFirstnameErrorMessage }}
                    </p>
                </template>
            </form-field>

            <form-field
                v-model="lastName"
                name="lastName"
                data-test-id="input-last-name"
                label-text="Last name"
                input-type="text"
                label-style="inline"
                aria-describedby="error-message-lastname"
                :aria-invalid="!!describeLastnameErrorMessage"
                @blur="$v.lastName.$touch">
                <template
                    v-if="describeLastnameErrorMessage"
                    #error>
                    <p
                        id="error-message-lastname"
                        :class="$style['o-form-error']"
                        data-test-id='error-last-name-empty'>
                        <warning-icon :class="$style['o-form-error-icon']" />
                        {{ describeLastnameErrorMessage }}
                    </p>
                </template>
            </form-field>

            <form-field
                v-model="email"
                name="email"
                data-test-id="input-email"
                label-text="Email"
                input-type="email"
                label-style="inline"
                aria-describedby="error-message-email"
                :aria-invalid="!!describeEmailErrorMessage"
                @blur="$v.email.$touch">
                <!-- For when we want to add validation on blur of input - @blur="$v.email.$touch" -->
                <template
                    v-if="describeEmailErrorMessage"
                    #error>
                    <p
                        id="error-message-email"
                        :class="$style['o-form-error']"
                        data-test-id='error-email-empty'>
                        <warning-icon :class="$style['o-form-error-icon']" />
                        {{ describeEmailErrorMessage }}
                    </p>
                </template>
            </form-field>

            <form-field
                v-model="password"
                name="password"
                data-test-id="input-password"
                label-text="Password"
                input-type="password"
                label-style="inline"
                aria-describedby="error-message-password"
                :aria-invalid="!!describePasswordErrorMessage"
                @blur="$v.password.$touch">
                <template
                    v-if="shouldShowPasswordRequiredError"
                    #error>
                    <p
                        id="error-message-password"
                        :class="$style['o-form-error']"
                        data-test-id='error-password-empty'>
                        <warning-icon :class="$style['o-form-error-icon']" />
                        {{ describePasswordErrorMessage }}
                    </p>
                    <p
                        v-if="shouldShowPasswordMinLengthError"
                        :class="$style['o-form-error']"
                        data-test-id='error-password-minlength'>
                        <warning-icon :class="$style['o-form-error-icon']" />
                        Password is less than four characters
                    </p>
                    <p
                        v-if="shouldShowPasswordMaxLengthError"
                        :class="$style['o-form-error']"
                        data-test-id='error-password-maxlength'>
                        <warning-icon :class="$style['o-form-error-icon']" />
                        Password exceeds 50 characters
                    </p>
                </template>
            </form-field>

            <form-button
                data-test-id="create-account-submit-button"
                button-style="primary"
                is-full-width
                :disabled="shouldDisableCreateAccountButton">
                {{ buttonText }}
            </form-button>
        </form>
        <p :class="$style['c-legal-hyperlinks']">
            {{ copy.navLinks.termsAndConditions.prefix }}
            <a
                data-test-id="ts-and-cs-link"
                :href="copy.navLinks.termsAndConditions.url"
                target="_blank">{{ copy.navLinks.termsAndConditions.text }}</a>{{ copy.navLinks.termsAndConditions.suffix }}
            {{ copy.navLinks.privacyPolicy.prefix }}
            <a
                data-test-id="privacy-policy-link"
                :href="copy.navLinks.privacyPolicy.url"
                target="_blank">{{ copy.navLinks.privacyPolicy.text }}</a>
            {{ copy.navLinks.cookiesPolicy.prefix }}
            <a
                data-test-id="cookies-policy-link"
                :href="copy.navLinks.cookiesPolicy.url"
                target="_blank">{{ copy.navLinks.cookiesPolicy.text }}</a>{{ copy.navLinks.cookiesPolicy.suffix }}
        </p>
    </card>
</template>

<script>
import { globalisationServices } from '@justeat/f-services';
import { validationMixin } from 'vuelidate';
import {
    required, email, minLength, maxLength
} from 'vuelidate/lib/validators';
import { WarningIcon } from '@justeat/f-vue-icons';
import Card from '@justeat/f-card';
import '@justeat/f-card/dist/f-card.css';
import FormField from '@justeat/f-form-field';
import '@justeat/f-form-field/dist/f-form-field.css';
import FormButton from './Button.vue';
import tenantConfigs from '../tenants';
import RegistrationServiceApi from '../services/RegistrationServiceApi';
import EventNames from '../event-names';

/**
 * Tests for existence of valid chars only in a string.
 *
 * @param {string} value The string to test.
 * @return {boolean} True if there are no invalid chars in value, false otherwise.
 */
const meetsCharacterValidationRules = value => /^[\u0060\u00C0-\u00F6\u00F8-\u017Fa-zA-Z-' ]*$/.test(value);

export default {
    name: 'Registration',

    components: {
        Card,
        FormButton,
        FormField,
        WarningIcon
    },

    mixins: [validationMixin],

    props: {
        locale: {
            type: String,
            default: 'en-GB'
        },
        title: {
            type: String,
            default: 'Create Account'
        },
        buttonText: {
            type: String,
            default: 'Create Account'
        },
        createAccountUrl: {
            type: String,
            required: true
        },
        loginSettings: {
            type: Object,
            default: () => {}
        }

    },

    data () {
        const locale = globalisationServices.getLocale(tenantConfigs, this.locale, this.$i18n);
        const localeConfig = tenantConfigs[locale];
        const theme = globalisationServices.getTheme(locale);

        return {
            copy: { ...localeConfig },
            theme,
            firstName: null,
            lastName: null,
            email: null,
            password: null,
            shouldDisableCreateAccountButton: false,
            genericErrorMessage: null,
            shouldShowEmailAlreadyExistsError: false
        };
    },

    computed: {
        /*
         * Validation methods return true if the validation conditions
         * have not been met and the field has been `touched` by a user.
         * The $dirty boolean changes to true when the user has focused/lost
         * focus on the input field.
         */
        describeFirstnameErrorMessage () {
            if (this.shouldShowFirstNameRequiredError) {
                return 'Please include your first name';
            }

            if (this.shouldShowFirstNameMaxLengthError) {
                return 'First name exceeds 50 characters';
            }

            if (this.shouldShowFirstNameInvalidCharError) {
                return 'First name should only contain letters, hyphens or apostrophes';
            }
            return '';
        },
        shouldShowFirstNameRequiredError () {
            return !this.$v.firstName.required && this.$v.firstName.$dirty;
        },
        shouldShowFirstNameMaxLengthError () {
            return !this.$v.firstName.maxLength && this.$v.firstName.$dirty;
        },
        shouldShowFirstNameInvalidCharError () {
            return !this.$v.firstName.meetsCharacterValidationRules && this.$v.firstName.$dirty;
        },
        describeLastnameErrorMessage () {
            if (this.shouldShowFirstNameRequiredError) {
                return 'Please include your last name';
            }

            if (this.shouldShowFirstNameMaxLengthError) {
                return 'Last name exceeds 50 characters';
            }

            if (this.shouldShowFirstNameInvalidCharError) {
                return 'Last name should only contain letters, hyphens or apostrophes';
            }

            return '';
        },
        shouldShowLastNameRequiredError () {
            return !this.$v.lastName.required && this.$v.lastName.$dirty;
        },
        shouldShowLastNameMaxLengthError () {
            return !this.$v.lastName.maxLength && this.$v.lastName.$dirty;
        },
        shouldShowLastNameInvalidCharError () {
            return !this.$v.lastName.meetsCharacterValidationRules && this.$v.lastName.$dirty;
        },
        describeEmailErrorMessage () {
            if (this.shouldShowEmailRequiredError) {
                return 'Please enter your email address';
            } else if (this.shouldShowEmailInvalidError) {
                return 'Please enter a valid email address';
            }

            return '';
        },
        shouldShowEmailRequiredError () {
            return !this.$v.email.required && this.$v.email.$dirty;
        },
        shouldShowEmailMaxLengthError () {
            return !this.$v.email.maxLength && this.$v.email.$dirty;
        },
        shouldShowEmailInvalidError () {
            return !this.$v.email.email && this.$v.email.$dirty;
        },
        describePasswordErrorMessage () {
            if (this.shouldShowPasswordRequiredError) {
                return 'Please enter a password';
            }
            return '';
        },
        shouldShowPasswordRequiredError () {
            return !this.$v.password.required && this.$v.password.$dirty;
        },
        shouldShowPasswordMinLengthError () {
            return !this.$v.password.minLength && this.$v.password.$dirty;
        },
        shouldShowPasswordMaxLengthError () {
            return !this.$v.password.maxLength && this.$v.password.$dirty;
        },
        shouldShowLoginLink () {
            return this.loginSettings && this.loginSettings.linkText && this.loginSettings.url;
        },
        validationErrorsPresent () {
            return this.$v.$invalid;
        },
        tenant () {
            return {
                'en-GB': 'uk',
                'en-AU': 'au',
                'en-NZ': 'nz',
                'da-DK': 'dk',
                'es-ES': 'es',
                'en-IE': 'ie',
                'it-IT': 'it',
                'nb-NO': 'no'
            }[this.locale];
        }
    },

    validations: {
        firstName: {
            required,
            maxLength: maxLength(50),
            meetsCharacterValidationRules
        },
        lastName: {
            required,
            maxLength: maxLength(50),
            meetsCharacterValidationRules
        },
        email: {
            required,
            email,
            maxLength: maxLength(50)
        },
        password: {
            required,
            minLength: minLength(4),
            maxLength: maxLength(50)
        }
    },

    methods: {
        async onFormSubmit () {
            this.genericErrorMessage = null;
            this.shouldShowEmailAlreadyExistsError = false;

            if (this.isFormInvalid()) {
                return;
            }

            this.shouldDisableCreateAccountButton = true;
            try {
                const registrationData = {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    emailAddress: this.email,
                    password: this.password,
                    registrationSource: 'Native',
                    marketingPreferences: []
                };
                await RegistrationServiceApi.createAccount(this.createAccountUrl, this.tenant, registrationData);
                this.$emit(EventNames.CreateAccountSuccess);
            } catch (error) {
                let thrownErrors = error;
                if (error && error.response && error.response.data && error.response.data.errors) {
                    thrownErrors = error.response.data.errors;
                }

                if (Array.isArray(thrownErrors)) {
                    if (thrownErrors.some(thrownError => thrownError.errorCode === '409')) {
                        this.shouldShowEmailAlreadyExistsError = true;
                    } else {
                        this.genericErrorMessage = thrownErrors[0].description || 'Something went wrong, please try again later';
                    }
                } else {
                    this.genericErrorMessage = error;
                }
                this.$emit(EventNames.CreateAccountFailure, thrownErrors);
            } finally {
                this.shouldDisableCreateAccountButton = false;
            }
        },

        isFormInvalid () {
            this.$v.$touch();
            const isInvalid = this.$v.$invalid;

            let errorCount = 0;

            if (this.$v.firstName.$anyError) {
                errorCount++;
            }

            if (this.$v.lastName.$anyError) {
                errorCount++;
            }

            if (this.$v.email.$anyError) {
                errorCount++;
            }

            if (this.$v.password.$anyError) {
                errorCount++;
            }

            if (isInvalid) {
                this.genericErrorMessage = `There are ${errorCount} errors in the form`;
            } else {
                this.genericErrorMessage = null;
            }
            return isInvalid;
        }
    }
};
</script>

<style lang="scss" module>

// Form styling

.o-form {
    @include font-size(body-l);
}

.o-form-error {
    display: flex;
    align-items: center;
    color: $red;
    @include font-size(body-s);
    margin-top: spacing();
}

.o-form-error-icon {
    width: 16px;
    height: 16px;
    margin-right: spacing(x0.5);
}

* + .o-form {
    margin-top: spacing(x2);
}

.c-loginLink {
    text-align: center;
    a {
        color: $blue;
        text-decoration: none;
    }
}

.c-legal-hyperlinks {
    a {
        color: $blue;
        text-decoration: none;
    }
}
</style>
