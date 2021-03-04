v2.1.2
--------------------

#### Internal
- Add `prop-types` to dependencies as `PropTypes` from `react` is deprecated
- Use `webpack@2` in example


v2.1.1
--------------------

#### Bugs
- Move `react` and `react-dom` to peerDependencies to avoid loading multiple versions of `react`


v2.1.0
--------------------

#### Features
- Add `renderToStaticMarkup` as static method on `DocumentMeta`

#### Internal
- Rewrite as ES6 class


v2.0.2
--------------------

#### Internal
- Update `babel` to `6.x`
- Added code-coverage ([markdalgleish](https://github.com/markdalgleish))
- Added multiple nested pages to the client-side example


v2.0.1
--------------------

#### Bugs
- Fix issue with cloning/rendering children

#### Internal
- Added server-side rendering example


v2.0.0
--------------------

#### Breaking Changes
- React >= v0.14.0 is required as of v2.0.0


v1.1.0
--------------------

#### Features
- Passing null as value resets any previous declared value and remove the meta tag

#### Bugs
- Allow array of strings as value in prop type validation


v1.0.1
--------------------

#### Bugs
- Avoid crashing when trying to render without any props mounted


v1.0.0
--------------------

- `react-side-effect` has been updated to v1.0.1, which included breaking changes. Most of these is handled internally, maintaining the same API for `react-document-meta`. See below for breaking changes.


#### Breaking Changes
- `DocumentMeta.rewind()` no longer takes an argument with options, and therefore `.rewind({ asReact: true })` and `.rewind({ asHtml: true })` is no longer possible. Two new static methods has been added to support this feature: `.renderAsReact()` and `.renderAsHTML()`
