![logo](/docs/images/value-link-logo.png)

# Purely functional data binding for React

Lightweight (6.5K minified) purely functional two-way data binding for the React designed to be used in TypeScript and ES6. Having much in common with `useState` React Hook, `valuelink` develops the concept much further providing the simple and elegant solution for handling of the compound state and form validation.

```javascript
// Minimal working example demonstrating the two-way data binding with React Hook.
import { useLink } from 'valuelink'
import * as React from 'react'

export const MyCoolComponent = ( props ) => {
    const name = useLink( '' );

    return (
        <input {...name.props} />
    )
}
```
An introductory article, explaining the rationale behind the design and giving the high-level overview of how amazing NestedLink is: [React Hooks, form validation, and complex state](https://itnext.io/react-hooks-and-two-way-data-binding-dd4210f0ed94)

Here's the series of 5-minute tutorials to quickly understand the concept and its rationale (examples uses the standard React state, though state hooks are supported as well):

- [The basics of ValueLink design pattern](https://medium.com/@gaperton/managing-state-and-forms-with-react-part-1-12eacb647112#.j7sqgkj88)
- [Form validation with ValueLinks](https://medium.com/@gaperton/react-forms-with-value-links-part-2-validation-9d1ba78f8e49#.nllbm4cr7)
- [Complex state with ValueLinks](https://medium.com/@gaperton/state-and-forms-in-react-part-3-handling-the-complex-state-acf369244d37#.x0fjcxljo)

NestedLink is used as two-way data binding technology in [React-MVx](https://volicon.github.io/React-MVx/), which is an MVVM application framework replacing the standard React component state with deeply observable serializable classes.

## Features

- Declarative binding of the component state elements to form controls.
- Instant "as you type" form validation.
- Easy handling of nested state with objects and arrays.
- Pricise TypeScript typings.
- 'pure render' optimization friendly.

Reference implementation of 'linked' UI controls (`valuelink/tags`):

- Standard tags: `<Input />` and `<TextArea />` (with validation), `<Select />`,
- Custom tags: `<Radio />`, `<Checkbox />`, `<NumberInput />`

![dialog](/docs/images/comparison.png)

## Examples

- [Typical data binding scenarios](https://volicon.github.io/NestedLink/example/databinding.html)([source](/example/src/databinding.jsx))
- [Reusable stateful components](https://volicon.github.io/NestedLink/example/asaf.html)([source](/example/src/asaf.jsx))
- [Complex app state example](https://volicon.github.io/NestedLink/)([source](/example/src/userslist.jsx))
- [TodoMVC](/NestedLink/example/todomvc/)([source](/example/todomvc/src))

## [API Reference](/docs/api.md)

## [Data Bound Controls Reference](/docs/databinding.md)

## How to

### Use in your project

There are no side dependencies except `react` as peer dependency. Installation:

`npm install valuelink --save-dev`

Usage:

```javascript
import React from 'react'
import Link, { LinkedComponent } from 'valuelink'

// If you're using TypeScript or the modern module bundler (like webpack 2) supporting ES6 imports and "tree shaking".
import { Input, TextArea, Select, Radio, Checkbox } from 'valuelink/lib/tags'

// For all other cases there's CommonJS tags module, when previous option won't work.
import { Input, TextArea, Select, Radio, Checkbox } from 'valuelink/tags'
```

Refer to the [databinding examples](/example/src/databinding.jsx) and the [manual](/docs/databinding.md) for the typical data binding scenarios.

* [/lib](/lib) folder contains ES5 modules prebuilt with ES6 exports suitable for modern build tools like `webpack 2`.
* [/dist](/dist) folder contains minified UMD ES5 assembly exporting `NestedLink` global valiable.

### Create your own data bound controls

Use [tags.jsx](/tags.jsx) or [src/tags.tsx](/src/tags.tsx) as the starting boilerplate for your components.
Copy this file over to your project, and start hacking.

### Create the binding to the custom state container

ValueLink abstracts data binding from both the particular control and the state container. The [default binding](/src/component.ts) implemented
in the library is for the standard React state. It's fairly easy to create your own.

You need to subclass React.Component and make your own `linkAt` and `linkAll` methods.
You can either use `Link.value` inside to create links dynamically, or extend the `Link` as it's done in [/src/component.ts](/src/component.ts).

### Start hacking

![design](/docs/images/valuelinks.jpg)

If you want to play with the examples, fix the bug, or whatever:

`npm install` - installs the dependencies.

`npm run build` - compiles everything including examples.

## Release Notes
### v1.6

React Hooks support.

- `useLink( initValue )` - create linked state.
- `setLinks({ lnk1, lnk2, ... }, json )` - bulk set link values from an object.
- `linksValues({ lnk1, lnk2, ... })` - extract values object from links.
- `linksErrors({ lnk1, lnk2, ... })` - extract errors object from links.

### v1.5

- `<input {...link.props} />` can be used to bind the link to any of the standard controls expecting `value` and `onChange` props.

---
![usedby](/docs/images/usedby.png)
