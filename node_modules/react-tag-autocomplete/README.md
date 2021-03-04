# React Tag Autocomplete

[![Build status](https://api.travis-ci.org/i-like-robots/react-tags.svg?branch=master)](https://travis-ci.org/i-like-robots/react-tags) [![Coverage Status](https://coveralls.io/repos/github/i-like-robots/react-tags/badge.svg?branch=master)](https://coveralls.io/github/i-like-robots/react-tags)

React Tag Autocomplete is a simple tagging component ready to drop in your React projects. Originally based on the [React Tags project](http://prakhar.me/react-tags/example) by Prakhar Srivastav this version removes the drag-and-drop re-ordering functionality, adds appropriate roles and ARIA states and introduces a resizing text input. [View demo](http://i-like-robots.github.io/react-tags/).

![Screenshot of React Tag Autocomplete](https://cloud.githubusercontent.com/assets/271645/25478773/54aa2bbe-2b3a-11e7-95cf-d419f3c24418.png)

## Installation

This is a [Node.js] module available through the [npm] registry. Before installing, download and install Node.js.

Installation is done using the [npm install] command:

```
npm install --save react-tag-autocomplete
```

[Node.js]: https://nodejs.org/en/
[npm]: https://www.npmjs.com/
[npm install]: https://docs.npmjs.com/getting-started/installing-npm-packages-locally

## Usage

Here's a sample implementation that initializes the component with a list of preselected `tags` and a `suggestions` list. For further customization details, see [options](#options).

```js
import React from 'react'
import ReactDOM from 'react-dom'
import ReactTags from 'react-tag-autocomplete'

class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      tags: [
        { id: 1, name: "Apples" },
        { id: 2, name: "Pears" }
      ],
      suggestions: [
        { id: 3, name: "Bananas" },
        { id: 4, name: "Mangos" },
        { id: 5, name: "Lemons" },
        { id: 6, name: "Apricots" }
      ]
    }

    this.reactTags = React.createRef()
  }

  onDelete (i) {
    const tags = this.state.tags.slice(0)
    tags.splice(i, 1)
    this.setState({ tags })
  }

  onAddition (tag) {
    const tags = [].concat(this.state.tags, tag)
    this.setState({ tags })
  }

  render () {
    return (
      <ReactTags
        ref={this.reactTags}
        tags={this.state.tags}
        suggestions={this.state.suggestions}
        onDelete={this.onDelete.bind(this)}
        onAddition={this.onAddition.bind(this)} />
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
```


### Options

- [`id`](#id-optional)
- [`tags`](#tags-optional)
- [`suggestions`](#suggestions-optional)
- [`suggestionsFilter`](#suggestionsfilter-optional)
- [`suggestionsTransform`](#suggestionsTransform-optional)
- [`placeholderText`](#placeholdertext-optional)
- [`ariaLabelText`](#arialabeltext-optional)
- [`removeButtonText`](#removeButtontext-optional)
- [`noSuggestionsText`](#noSuggestionsText-optional)
- [`autoresize`](#autoresize-optional)
- [`delimiters`](#delimiters-optional)
- [`minQueryLength`](#minquerylength-optional)
- [`maxSuggestionsLength`](#maxsuggestionslength-optional)
- [`classNames`](#classnames-optional)
- [`onAddition`](#onaddition-optional)
- [`onDelete`](#ondelete-optional)
- [`onInput`](#oninput-optional)
- [`onFocus`](#onfocus-optional)
- [`onBlur`](#onblur-optional)
- [`onValidate`](#onvalidate-optional)
- [`addOnBlur`](#addonblur-optional)
- [`allowNew`](#allownew-optional)
- [`allowBackspace`](#allowbackspace-optional)
- [`tagComponent`](#tagcomponent-optional)
- [`inputAttributes`](#inputAttributes-optional)

#### id (optional)

The ID attribute given to the listbox element. Default: `ReactTags`.

#### tags (optional)

An array of selected tags. Each tag is an object which must have an `id` and a `name` property. Defaults to `[]`.

```js
const tags =  [
  { id: 1, name: 'Apples' },
  { id: 2, name: 'Pears' }
]
```

#### suggestions (optional)

An array of tag suggestions. Each suggestion is an object which must have an `id` and a `name` property and an optional `disabled` property to make the suggestion non-selectable. Defaults to `[]`.

```js
const suggestions = [
  { id: 3, name: 'Bananas' },
  { id: 4, name: 'Mangos' },
  { id: 5, name: 'Lemons' },
  { id: 6, name: 'Apricots', disabled: true }
]
```

#### suggestionsFilter (optional)

A callback function to filter suggestion items with. The callback receives two arguments; a `suggestion` and the current `query` and must return a boolean value.

If no function is supplied the default filter is applied. Defaults to `null`.

**Note:** This filter will be ignored if [suggestionsTransform](#suggestionsTransform-optional) is supplied.

#### suggestionsTransform (optional)

A callback function to apply a custom filter to the suggestions. The callback receives two arguments; a `query` and the input [suggestions](#suggestions-optional) and must return a new array of suggestion items. Using this option you can filter and sort suggestions.

**Note:** This will supersede [suggestionsFilter](#suggestionsfilter-optional) in future.

```js
import matchSorter from "match-sorter";

function suggestionsFilter(query, suggestions) {
  return matchSorter(suggestions, query, { keys: ["name"] });
}
```

#### placeholderText (optional)

The placeholder string shown for the input. Defaults to `'Add new tag'`.

#### ariaLabelText (optional)

The aria-label string for the input. Defaults to placeholder string.

#### removeButtonText (optional)

The title text to add to the remove selected tag button. Default `'Click to remove tag'`.

#### noSuggestionsText (optional)

Message shown if there are no matching suggestions. Defaults to `null`.

#### autoresize (optional)

Boolean parameter to control whether the text-input should be automatically resized to fit its value. Defaults to `true`.

#### delimiters (optional)

Array of keys matching `KeyboardEvent.key` values. When a corresponding key is pressed it will trigger tag selection or creation. Defaults to `['Enter', 'Tab']`.

#### minQueryLength (optional)

Minimum query length required to show the suggestions list. Defaults to `2`.

#### maxSuggestionsLength (optional)

Maximum number of suggestions to display. Defaults to `6`.

#### classNames (optional)

Override the default class names used by the component. Defaults to:

```js
{
  root: 'react-tags',
  rootFocused: 'is-focused',
  selected: 'react-tags__selected',
  selectedTag: 'react-tags__selected-tag',
  selectedTagName: 'react-tags__selected-tag-name',
  search: 'react-tags__search',
  searchWrapper: 'react-tags__search-wrapper',
  searchInput: 'react-tags__search-input',
  suggestions: 'react-tags__suggestions',
  suggestionActive: 'is-active',
  suggestionDisabled: 'is-disabled'
}
```

#### onAddition (required)

Function called when the user wants to add a tag. Receives the tag.

```js
function onAddition(tag) {
  const tags = [...this.state.tags, tag]
  this.setState({ tags })
}
```

#### onDelete (required)

Function called when the user wants to delete a tag. Receives the tag index.

```js
function onDelete(i) {
  const tags = this.state.tags.slice(0)
  tags.splice(i, 1)
  this.setState({ tags })
}
```

#### onInput (optional)

Optional event handler when the input value changes. Receives the current query.

```js
function onInput(query) {
  if (!this.state.busy) {
    this.setState({ busy: true })

    return fetch(`query=${query}`).then((result) => {
      this.setState({ busy: false })
    })
  }
}
```

#### onFocus (optional)

Optional callback function for when the input receives focus. Receives no arguments.

#### onBlur (optional)

Optional callback function for when focus on the input is lost. Receives no arguments.

#### onValidate (optional)

Optional validation function that determines if tag should be added. Receives the tag object and must return a boolean.

```js
function onValidate(tag) {
  return tag.name.length >= 5;
}
```

#### addOnBlur (optional)

Creates a tag from the current input value when focus on the input is lost. Defaults to `false`.

#### allowNew (optional)

Enable users to add new (not suggested) tags. Defaults to `false`.

#### allowBackspace (optional)

Enable users to delete selected tags when backspace is pressed while focussed on the text input when empty. Defaults to `true`.

#### tagComponent (optional)

Provide a custom tag component to render. Receives the tag, button text, and delete callback as props. Defaults to `null`.

```jsx
function TagComponent({ tag, removeButtonText, onDelete }) {
  return (
    <button type='button' title={removeButtonText} onClick={onDelete}>
      {tag.name}
    </button>
  )
}
```

#### suggestionComponent (optional)

Provide a custom suggestion component to render. Receives the suggestion and current query as props. Defaults to `null`.

```jsx
function SuggestionComponent({ item, query }) {
  return (
    <span id={item.id} className={item.name === query ? 'match' : 'no-match'}>
      {item.name}
    </span>
  )
}
```

#### inputAttributes (optional)

An object containing additional attributes that will be applied to the text input. _Please note_ that this prop cannot overwrite existing attributes, it can only add new ones. Defaults to `{}`.


### API

By adding a `ref` to any instances of this component you can access its API methods.

#### `addTag(tag)`

Adds a tag to the list of selected tags. This will trigger the validation and addition callbacks.

#### `deleteTag(index)`

Removes a tag from the list of selected tags. This will trigger the delete callback.

#### `clearInput()`

Clears the input and current query.


### Styling

It is possible to customize the appearance of the component, the included styles found in `/example/styles.css` are only an example.


### Development

The component is written in ES6 and uses [Rollup](https://rollupjs.org/) as its build tool. Tests are written with [Jasmine](https://jasmine.github.io/) using [JSDOM](https://github.com/jsdom/jsdom).

```sh
npm install
npm run dev # will open http://localhost:8080 and watch files for changes
```

### Upgrading

To see all changes refer to [the changelog](CHANGELOG.md).

#### Upgrading from 5.x to 6.x

- React 16.5 or above is now required.
- Event handlers and callbacks have been renamed to use `on` prefixes, e.g. the `handleAddition()` callback should now be called `onAddition()`.
- The `delimiters` option is now an array of `KeyboardEvent.key` values and not `KeyboardEvent.keyCode` codes, e.g. `[13, 9]` should now be written as `['Enter', 'Tab']`. See https://keycode.info/ for more information.
- The `placeholder` option has been renamed `placeholderText`
- The `ariaLabel` option has been renamed `ariaLabelText`
- The `delimiterChars` option has been removed, use the `delimiters` option instead.
- The `clearInputOnDelete` option has been removed and is now the default behaviour
- The `autofocus` option has been removed.
