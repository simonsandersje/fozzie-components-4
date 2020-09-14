import { withKnobs, select, text } from '@storybook/addon-knobs';
import Registration from '../src/components/Registration.vue';
import { withA11y } from '@storybook/addon-a11y';

export default {
    title: 'Components/Organisms',
    decorators: [withKnobs, withA11y]
};

export const RegistrationComponent = () => ({
    components: { Registration },
    props: {
        locale: {
            default: select('Locale', ['en-GB', 'en-AU'])
        },
        title: {
            default: text('Title', 'Create Account')
        },
        buttonText: {
            default: text('Button Text', 'Create Account')
        },
        createAccountUrl: {
            default: text('Dummy Account URL', 'http://account-url.example.com')
        }
    },
    parameters: {
        notes: 'some documentation here'
    },
    template: '<registration :locale="locale" :title="title" :button-text="buttonText" :create-account-url="createAccountUrl"/>'
});

RegistrationComponent.storyName = 'f-registration';
