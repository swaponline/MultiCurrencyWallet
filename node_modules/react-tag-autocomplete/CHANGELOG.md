# Changelog

## 6.1.0

- Added `suggestionsTransform` option to allow custom filtering and sorting of suggestions ([sibiraj-s](https://github.com/sibiraj-s))

## 6.0.0

- Added `clearInput` method to programmatically clear input text
- Added `suggestionComponent` option to allow the rendering of a custom suggestion component  ([tjphopkins](https://github.com/tjphopkins))
- Added `searchWrapper` to `classNames` option
- Added ES6 package and `"module"` entry point
- Added `id` option to configure the component ID
- Added `removeButtonText` option to configure the selected tag remove button title attribute
- Refactored `ariaLabel` option to `ariaLabelText` to match other text options
- Refactored `placeholder` option to `placeholderText` to match other text options
- Refactored keyboard event handlers to use `KeyboardEvent.key`
- Refactored event handlers and callbacks to use `on` prefixes
- Refactored `classNames` option to avoid creating new and merging objects for each top-level props change
- Refactored `deleteTag` method so it no longer clears the input text when a tag is removed
- Refactored `delimiters` option to be an array of `KeyboardEvent.key` values
- Refactored `onInput` callback to provide basic support for `delimiters` entered on soft keyboards
- Removed `clearInputOnDelete` option
- Removed `autofocus` option
- Removed `delimiterChars` option
- Updated React dependency to 16.5+

## 5.13.1

- Fixed an issue where cursor focus could be lost after removing a selected tag

## 5.13.0

- Added `ariaLabel` option ([Herdismaria](https://github.com/Herdismaria))

## 5.12.1

- Fixed an issue where the `componentDidUpdate()` callback of the input component can be called too many times

## 5.12.0

- Added `noSuggestionsText` option ([jraack](https://github.com/jraack))

## 5.11.2

- Fixed an issue with the delimiter key logic which would attempt to add a previously selected suggestion even when it was no longer in the suggestion list.

## 5.11.1

- Fixed an issue with suggestion highlighting when the entered query is blank

## 5.11.0

- Added the current query as the second argument for the `suggestionsFilter` option

## 5.10.0

- Added `suggestionsFilter` option ([paulshannon](https://github.com/paulshannon))

## 5.9.0

- Added `clearInputOnDelete` option ([yefrem](https://github.com/yefrem))

## 5.8.2

- Updated contents of package tarball to remove unnecessary files and decrease filesize

## 5.8.1

- Removed unnecessary `componentWillReceiveProps()` method from input component

## 5.8.0

- Added `handleValidate` option ([axelniklasson](https://github.com/axelniklasson))

## 5.7.1

- Fixed missing `onChange` attribute warnings in development mode

## 5.7.0

- Added `addOnBlur` option ([APILLSBURY](https://github.com/APILLSBURY) and [jedrzejiwanicki](https://github.com/jedrzejiwanicki))

## 5.6.0

- Added `inputAttributes` option ([juliettepretot](https://github.com/juliettepretot))

## 5.5.0

- Refactored input into a controlled component (also fixes Preact compatibility)
- Refactored focus and blur handlers to capture events (also fixes Preact compatibility)
- Added `handleFocus` and `handleBlur` callbacks ([Pomax](https://github.com/Pomax))
- Updated dependencies ([ajmas](https://github.com/ajmas))

## 5.4.1

- Fixed return key submitting containing form when `minQueryLength` is set to 0 and suggestions are active ([Drahoslav7](https://github.com/Drahoslav7))

## 5.4.0

- Added `delimiters` property to override keyboard codes for picking suggestions ([Pomax](https://github.com/Pomax))

## 5.3.0

- Updated component compatibility with React v15.5 which silences deprecation warnings
- Refactored examples code away from `createClass` to ES6 syntax

## 5.2.0

- Add `allowBackspace` option to disable the ability to delete the selected tags when backspace is pressed while focussed on the text input
- Refactors `updateInputWidth` method to update when any props change ([@joekrill](https://github.com/joekrill))

## 5.1.0

- Added `tagComponent` option to allow the rendering of a custom tag component

## 5.0.4

- Fixed cursor focus being lost when clicking a suggestion

## 5.0.3

- Fixed word boundary regex restricting suggestions to ascii characters

## 5.0.2

- Fixed unescaped queries throwing an exception when being converted to regexp

## 5.0.1

- Fixed `maxSuggestionsLength` not being passed to suggestions component

## 5.0.0

- Removed `delimiters` option
- Added support for jsnext entry point
- Removed functionality to hide suggestions list when escape is pressed
- Added functionality to hide suggestions list when input is blurred
- Added class name to component root when input is focused
- Refactored components to ES6 class syntax and stateless functions
- Refactored components to use Standard code style
- Refactored `classNames` option to better match usage and use BEM naming convention

## 4.3.1

- Fixed React semver that was too tight

## 4.3.0

- Updated to support React 15.0.0

## 4.2.0

- Added `allowNew` option
- Fixed incorrect partial matches when adding a tag

## 4.1.1

- Fixed mising index from active descendent attribute

## 4.1.0

- Added `classNames` option

## 4.0.2

- Fixed missing `type` attribute from tag buttons

## 4.0.1

- Fixed out of date dist package

## 4.0.0

- Removed `busy` option and status indicator
- Added `maxSuggestionsLength` option
