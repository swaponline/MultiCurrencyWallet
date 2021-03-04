import defaultMessage from './rules/default-message/default-message';
import containsHardcodedCopy from './rules/contains-hardcoded-copy/contains-hardcoded-copy';

/**
 * @fileoverview Ensures react-intl components have a defaultMessage supplied
 * @author Dan Pavitt
 */

module.exports = {
    rules: {
        'default-message': defaultMessage,
        'contains-hardcoded-copy': containsHardcodedCopy,
    },
    configs: {
        recommended: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            rules: {
                'default-message': 'warning',
                'contains-hardcoded-copy': 'off',
            },
        },
        strict: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            rules: {
                'default-message': 'warning',
                'contains-hardcoded-copy': 'off',
            },
        },
    },
};
