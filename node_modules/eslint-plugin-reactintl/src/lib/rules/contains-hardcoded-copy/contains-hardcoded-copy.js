const errorMessage = 'Element contains hardcoded copy';

function reportError (node, context) {
    context.report({
        node,
        message: errorMessage,
    });
}

function isLiteral (child) {
    const childIsLiteral = child && child.type === 'Literal' && child.value;

    if (childIsLiteral) {
        return true;
    }

    return false;
}

// After removing all whitespace check if there's any
// part of the literal left to evaluate
function literalLength (child) {
    const childValue = child && child.value && child.value.replace
        && child.value.replace(/[ \t\r\n]+/g, '').length;
    return Boolean(childValue);
}

module.exports = {
    create: (context) => ({
        JSXOpeningElement: (node) => {
            const firstChildOfNode = node.parent.children[0];

            if (isLiteral(firstChildOfNode) && literalLength(firstChildOfNode)) {
                reportError(firstChildOfNode, context);
            }
        },
        JSXExpressionContainer: (node) => {
            const expressionInNode = node.expression;

            if (isLiteral(expressionInNode) && literalLength(expressionInNode)) {
                reportError(expressionInNode, context);
            }
        },
    }),
};
