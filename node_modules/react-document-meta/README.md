React Document Meta [![Build Status](https://travis-ci.org/kodyl/react-document-meta.svg)](https://travis-ci.org/kodyl/react-document-meta) [![Coverage Status](https://coveralls.io/repos/github/kodyl/react-document-meta/badge.svg?branch=master)](https://coveralls.io/github/kodyl/react-document-meta?branch=master) [![npm version](https://badge.fury.io/js/react-document-meta.svg)](http://badge.fury.io/js/react-document-meta)
===================

HTML meta tags for React-based apps. Works for both client- and server-side rendering, and has a strict but flexible API.

Built with [React Side Effect](https://github.com/gaearon/react-side-effect)

___________________


Installation
-------------------
```
npm install --save react-document-meta
```

Note: React Side Effect requires React 0.14+ - and so does React Document Meta.


Using with React v0.13
-------------------
Due to several deprecations and breaking changes to React, you'll have to use `react-document-meta@^1.0.0`.


Upgrading from 0.1.x to 1.x
-------------------

As React Side Effect has been upgraded there is a few breaking changes, which is found in the [changelog](CHANGELOG.md).


Features
-------------------
- Supports extending and nesting on any number of levels
- Ability to auto generate some meta tags for open graph, twitter, and more

Usage
-------------------
See `example` folder for a working sample.

```javascript
import React from 'react';
import DocumentMeta from 'react-document-meta';

class Example extends React.Component {
  render() {
    const meta = {
      title: 'Some Meta Title',
      description: 'I am a description, and I can create multiple tags',
      canonical: 'http://example.com/path/to/page',
      meta: {
        charset: 'utf-8',
        name: {
          keywords: 'react,meta,document,html,tags'
        }
      }
    };

    return (
      <DocumentMeta {...meta}>
        <h1>Hello World!</h1>
      </DocumentMeta>
    );
  }
}

React.render(<Example />, document.getElementById('root'));
```

### Nesting
In most real world use cases, you would like to set some defaults and modify, replace or add just some of the meta tags. `react-document-meta` always use the deepest data set, but you can add an `extend` attribute (`<DocumentMeta {...metaData} extend />`), to instruct the component to merge with the meta data specified one level up. You can add the `extend` attribute to as many `DocumentMeta` components you would like, but the chain needs to be complete.

### Automatic Meta Tags
`react-document-meta` has the ability to generate meta tags based on the already provided meta data. Currently only open graph title, description and url is supported, which uses the data from `title`, `description` and `canonical`, and only in the case where the values has not been explicit set for `og:title`, `og:description` or `og:url` respectively.


Server Usage
-------------------
When using `react-document-meta` in a project with server-side rendering, you would like to have the final meta data chunk available in your HTML output. You can achieve this by calling `DocumentMeta.rewind()`.

Instead of getting a plain object, you can have the module return the meta as either React components or a HTML string. This is achieved by calling `DocumentMeta.renderAsReact()` or `DocumentMeta.renderAsHTML()`.

```javascript
import React from 'react';
import DocumentMeta from 'react-document-meta';

export default handler = (...args) => {
  ...
  const app = React.renderToString(components);
  const meta = DocumentMeta.renderAsHTML();
  const markup = `
    <html>
      <head>
        ${meta}
      </head>
      <body>
        <div id="app">
          ${app}
        </div>
      </body>
    </html>
  `
  ...
}
```


TODO:
-------------------
- [ ] Create full documentation
- [ ] Improve flexibility for custom attributes
