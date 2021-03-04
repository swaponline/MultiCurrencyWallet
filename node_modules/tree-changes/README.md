tree-changes
===

[![NPM version](https://badge.fury.io/js/tree-changes.svg)](https://www.npmjs.com/package/tree-changes) [![build status](https://travis-ci.org/gilbarbara/tree-changes.svg)](https://travis-ci.org/gilbarbara/tree-changes) [![Maintainability](https://api.codeclimate.com/v1/badges/93528e49029782f5f7d2/maintainability)](https://codeclimate.com/github/gilbarbara/tree-changes/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/93528e49029782f5f7d2/test_coverage)](https://codeclimate.com/github/gilbarbara/tree-changes/test_coverage)

Get changes between two versions of data with similar shape.

## Setup

```bash
npm install tree-changes
```

## Usage

```js
import treeChanges from 'tree-changes';

const savedData = {
    data: { a: 1 },
    hasData: false,
    items: [{ name: 'test' }],
    ratio: 0.9,
    retries: 0,
  	sort: {
      data: [{ type: 'asc' }, { type: 'desc' }],
      status: 'idle',
    },
    switch: false,
};

const newData = {
    data: { a: 1 },
    hasData: true,
    items: [],
    ratio: 0.5,
    retries: 1,
  	sort: {
      data: [{ type: 'desc' }, { type: 'asc' }],
      status: 'success',
    },
};

const {
  changed,
  changedFrom,
  changedTo,
  increased,
  decreased,
} = treeChanges(savedData, newData);

if (changed('hasData')) {
    // execute some side-effect
}

if (changedFrom('retries', 0, 1) {
    // should we try again?
}

// works with array values too
if (changedFrom('sort.status', 'idle', ['done', 'success']) {
    // status has changed!
}

// support nested match 
if (changedTo('sort.data.0.type', 'desc') {
    // update the type
}

if (decreased('ratio')) {
    // do something!
}

if (increased('retries')) {
    // hey, slow down.
}
```

####  Works with arrays too.

```js
import treeChanges from 'tree-changes';

const { changed, changedTo } = treeChanges([0, { id: 2 }], [0, { id: 4 }]);

changed(); // true
changed(0); // false
changed(1); // true
changedTo('1.id', 4); // true
```

> It uses [deep-diff](https://github.com/flitbit/diff) to compare plain objects/arrays and [nested-property](https://github.com/cosmosio/nested-property) to get the nested key.

## With React

### Class components

```js
import treeChanges from 'tree-changes';

class Comp extends React.Component {
    ...
    componentDidUpdate(prevProps) {
        const { changedFrom, changedTo } = treeChanges(prevProps, this.props);
        
        if (changedFrom('retries', 0, 1) {
            // dispatch some error
        }
        
        if (changedTo('hasData', true)) {
            // send data to analytics or something.
        }
    }
    ...
}
```

### Functional components with hooks

```jsx
import React, { useEffect, useRef } from 'react';
import treeChanges from 'tree-changes';

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

function useTreeChanges(props) {
  const prevProps = usePrevious(props) || {};

  return treeChanges(prevProps, props);
}

const Page = (props) => {
  const { changedTo } = useTreeChanges(props);

  if (changedTo('isLoaded', true)) {
    sendAnalyticsEvent('load', 'MySuperPage')
  }

  return <div>...</div>;
};
```

## API

**changed**(`key: KeyType`)  
Check if the value has changed. Supports objects and arrays.

**changedFrom**(`key: KeyType`, `previous: InputType`, `actual?: InputType`)  
Check if the value has changed from `previous` to `actual`. 

**changedTo**(`key: KeyType`, `actual: InputType`)  
Check if the value has changed to `actual`. 

**increased**(`key: KeyType`)  
Check if both versions are numbers and the value has increased. 

**decreased**(`key: KeyType`)  
Check if both versions are numbers and the value has decreased. 

> type KeyType = string | number;
type InputType = string | boolean | number | object | Array<string | boolean | number | object>;
