# eslint-plugin-reactintl

An ESLint Plugin for the [react-intl](https://github.com/yahoo/react-intl) package. This was created initially to check that all instances of FormattedMessage as well as a definable array of custom components have a defaultMessage attribute. It satisfies this requirement with room for growth.

## Installation
Inside your package, run `npm install --save-dev eslint-plugin-reactintl` to install and save the plugin as a dev dependency of your package.

Inside `.eslintrc.js`, add ``"reactintl"`` as a plugin. You can also extend the linter from just checking on the default `FormattedMessage` by adding to the components array.
```
module.exports = {
    "plugins": ["reactintl"],
    "rules": {
        "reactintl/default-message": ['error', {
            "components": [ "AnotherComponentToLint" ],
        }],
    },
}
```

## Rules
- `default-message`
    - ensures a component has defaultMessage and id supplied, unless the properties are added in a spread operator
    - define other components you want to apply the same linting on in the component property of the rule options (`[ "AnotherComponentToLint" ]`)
    - [documentation](https://github.com/dpvitt/eslint-plugin-reactintl/blob/master/src/lib/rules/default-message/default-message.md)
- `contains-hardcoded-copy`
    - ensures all nodes do not contain hardcoded copy / string literals.
    - not recommended to turn this all the time as it's very intensive, but it will save time in retrospectively adding FormattedMessage components to wrap around strings
    - [documentation](https://github.com/dpvitt/eslint-plugin-reactintl/blob/master/src/lib/rules/contains-hardcoded-copy/contains-hardcoded-copy.md)

## Development

### Directory Layout
- `src/lib/index` contains the default rules and exports of the module
- `src/lib/rules` contains individual rules consumed by the above config

### Building
When running `npm run build`, we transpile all rules and the index from `src/` to `lib/` in the root.

### Testing
Spec files are found inline with the source and md document. Run `npm run test` to run all tests in the package.

### Publishing
Run `npm publish` to publish the latest version to NPM. Before this complete the `prepublish` script will run to test and build rules.

----

This code was based on the [eslint-plugin-jsx-a11y](https://github.com/evcohen/eslint-plugin-jsx-a11y) code and follows code patterns I enjoyed there. It also consumes [jsx-ast-utils](https://github.com/evcohen/jsx-ast-utils), a utility modules for analysing JSX.
