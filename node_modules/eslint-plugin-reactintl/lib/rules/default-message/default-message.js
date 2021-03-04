'use strict';

var _jsxAstUtils = require('jsx-ast-utils');

var errorMessage = 'Missing defaultMessage or id attribute';

var containsIdAndDefault = function containsIdAndDefault(node) {
    // Cannot contextualise properties inserted dynamically
    // with spread operator, therefore we ignore these from validation;
    var hasSpreadOperator = node.attributes.filter(function (prop) {
        return prop.type === 'JSXSpreadAttribute';
    }).length > 0;

    if (hasSpreadOperator) {
        return true;
    }

    // The component is only valid if we supply defaultMessage
    //  with the ID for components requesting a translation string.
    var defaultMessageValue = (0, _jsxAstUtils.getPropValue)((0, _jsxAstUtils.getProp)(node.attributes, 'defaultMessage'));
    var allPropsExist = (0, _jsxAstUtils.hasEveryProp)(node.attributes, ['id', 'defaultMessage'], {
        ignoreCase: true,
        spreadStrict: false
    });

    return allPropsExist && !!defaultMessageValue;
};

module.exports = {
    create: function create(context) {
        return {
            JSXOpeningElement: function JSXOpeningElement(node) {
                var options = context.options[0] || {};
                var componentOptions = options.components || [];
                var typesToValidate = ['FormattedMessage'].concat(componentOptions);
                var nodeType = (0, _jsxAstUtils.elementType)(node);

                // Only check 'FormattedMessage' elements and custom types.
                if (typesToValidate.indexOf(nodeType) === -1) {
                    return;
                }

                if (!containsIdAndDefault(node)) {
                    context.report({
                        node: node,
                        message: errorMessage
                    });
                }
            }
        };
    }
};