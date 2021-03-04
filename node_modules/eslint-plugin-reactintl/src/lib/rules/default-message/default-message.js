import { getProp, getPropValue, hasEveryProp, elementType } from 'jsx-ast-utils';

const errorMessage = 'Missing defaultMessage or id attribute';

const containsIdAndDefault = (node) => {
    // Cannot contextualise properties inserted dynamically
    // with spread operator, therefore we ignore these from validation;
    const hasSpreadOperator = node.attributes
        .filter(prop => prop.type === 'JSXSpreadAttribute').length > 0;

    if (hasSpreadOperator) {
        return true;
    }

    // The component is only valid if we supply defaultMessage
    //  with the ID for components requesting a translation string.
    const defaultMessageValue = getPropValue(
        getProp(node.attributes, 'defaultMessage')
    );
    const allPropsExist = hasEveryProp(node.attributes, ['id', 'defaultMessage'], {
        ignoreCase: true,
        spreadStrict: false,
    });

    return (allPropsExist && !!defaultMessageValue);
};

module.exports = {
    create: (context) => ({
        JSXOpeningElement: (node) => {
            const options = context.options[0] || {};
            const componentOptions = options.components || [];
            const typesToValidate = ['FormattedMessage'].concat(componentOptions);
            const nodeType = elementType(node);

            // Only check 'FormattedMessage' elements and custom types.
            if (typesToValidate.indexOf(nodeType) === -1) {
                return;
            }

            if (!containsIdAndDefault(node)) {
                context.report({
                    node,
                    message: errorMessage,
                });
            }
        },
    }),
};
