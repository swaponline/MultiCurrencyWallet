import { RuleTester } from 'eslint';
import assign from 'object.assign';
import rule from './default-message';
import parseJSX from '../../utils/parseJSX';

const ruleTester = new RuleTester();

const expectedError = {
    message: 'Missing defaultMessage or id attribute',
    type: 'JSXOpeningElement',
};

const array = [{
    components: ['FormattedMessage', 'TextField'],
}];

ruleTester.run('default-message', rule, {
    valid: [
        { code: '<FormattedMessage id="foo" defaultMessage="bar" />', options: array },
        { code: '<TextField id="foo" defaultMessage="bar" />', options: array },
    ].map(parseJSX),
    invalid: [
        { code: '<FormattedMessage id="foo" />', options: array, errors: [expectedError] },
        { code: '<TextField id="foo" />', options: array, errors: [expectedError] },
        { code: '<FormattedMessage defaultMessage="bar" />', options: array, errors: [expectedError] },
        { code: '<TextField />', options: array, errors: [expectedError] },
    ].map(parseJSX),
});
