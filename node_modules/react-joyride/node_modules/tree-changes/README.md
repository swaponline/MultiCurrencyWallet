# tree-changes

[![NPM version](https://badge.fury.io/js/tree-changes.svg)](https://www.npmjs.com/package/tree-changes) [![build status](https://travis-ci.org/gilbarbara/tree-changes.svg)](https://travis-ci.org/gilbarbara/tree-changes) [![Maintainability](https://api.codeclimate.com/v1/badges/93528e49029782f5f7d2/maintainability)](https://codeclimate.com/github/gilbarbara/tree-changes/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/93528e49029782f5f7d2/test_coverage)](https://codeclimate.com/github/gilbarbara/tree-changes/test_coverage)

Compare changes between two datasets.

## Setup

```bash
npm install tree-changes
```

> React is an optional dependency and npm install it by default.  
> If you don't need it, just add `--no-optional` when installing this package.

## Usage

```typescript
import treeChanges from 'tree-changes';

const previousData = {
  hasData: false,
  sort: {
    data: [{ type: 'asc' }, { type: 'desc' }],
    status: 'idle',
  },
};

const newData = {
  hasData: true,
  sort: {
    data: [{ type: 'desc' }, { type: 'asc' }],
    status: 'success',
  },
};

const { changed, changedFrom } = treeChanges(previousData, newData);

changed(); // true

changed('hasData'); // true
changed('hasData', true); // true
changed('hasData', true, false); // true

// support nested matches. with dot notation
changed('sort.data.0.type', 'desc'); // true

// works with array values too
changed('sort.status', ['done', 'success']); // true

// if you only need to know the previous value 
changedFrom('sort.status', 'idle'); // true
```

#### Works with arrays too.

```typescript
import treeChanges from 'tree-changes';

const { changed } = treeChanges([0, { id: 2 }], [0, { id: 4 }]);

changed(); // true
changed(0); // false
changed(1); // true
changed('1.id', 4); // true
```

> It uses [fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal) to compare properties.

## API

**added**(`key: Key`, `value?: Value`)  
Check if something was added to the data.  
Works with arrays and objects (using Object.keys).

```typescript
import treeChanges from 'tree-changes';

const previousData = {
  actions: {},
  messages: [],
};

const newData = {
  actions: { complete: true },
  messages: ['New Message'],
  sudo: true,
};

const { added } = treeChanges(previousData, newData);

added(); // true
added('actions'); // true
added('messages'); // true
added('sudo'); // true
```

**changed**(`key?: Key`, `actual?: Value`, `previous?: Value`)  
Check if the data has changed.  
It also can compare to the `actual` value or even with the `previous`.

**changedFrom**(`key: Key`, `previous: Value`, `actual?: Value`)  
Check if the data has changed from `previous` or from `previous` to `actual`.

**decreased**(`key: Key`, `actual?: Value`, `previous?: Value`)  
Check if both values are numbers and the value has decreased.  
It also can compare to the `actual` value or even with the `previous`.

```typescript
import treeChanges from 'tree-changes';

const previousData = {
  ratio: 0.9,
  retries: 0,
};

const newData = {
  ratio: 0.5,
  retries: 1,
};

const { decreased } = treeChanges(previousData, newData);

decreased('ratio'); // true
decreased('retries'); // false
```

**emptied**(`key: Key`)  
Check if the data was emptied. Works with arrays, objects and strings.

```typescript
import treeChanges from 'tree-changes';

const previousData = {
  data: { a: 1 },
  items: [{ name: 'test' }],
  missing: 'username',
};

const newData = {
  data: {},
  items: [],
  missing: '',
};

const { emptied } = treeChanges(previousData, newData);

emptied('data'); // true
emptied('items'); // true
emptied('missing'); // true
```

**filled**(`key: Key`)  
Check if the data was filled (from a previous empty value). Works with arrays, objects and strings.

```typescript
import treeChanges from 'tree-changes';

const previousData = {
  actions: {},
  messages: [],
  username: '',
};

const newData = {
  actions: { complete: true },
  messages: ['New Message'],
  username: 'John',
};

const { filled } = treeChanges(previousData, newData);

filled('actions'); // true
filled('messages'); // true
filled('username'); // true
```

**increased**(`key: Key`, `actual?: Value`, `previous?: Value`)  
Check if both values are numbers and the value has increased.  
It also can compare to the `actual` value or even with the `previous`.

```typescript
import treeChanges from 'tree-changes';

const previousData = {
  ratio: 0.9,
  retries: 0,
};

const newData = {
  ratio: 0.5,
  retries: 1,
};

const { increased } = treeChanges(previousData, newData);

increased('retries'); // true
increased('ratio'); // false
```

**removed**(`key: Key`, `value?: Value`)  
Check if something was removed from the data.  
Works with arrays and objects (using Object.keys).

```typescript
import treeChanges from 'tree-changes';

const previousData = {
  data: { a: 1 },
  items: [{ name: 'test' }],
  switch: false,
};

const newData = {
  data: {},
  items: [],
};

const { removed } = treeChanges(previousData, newData);

removed(); // true
removed('data'); // true
removed('items'); // true
removed('switch'); // true
```

> **Types**  
> type Key = string | number;  
> type ValidTypes = string | boolean | number | Record<string, any> };  
> type Value = ValidTypes | ValidTypes[];

## With React

### Functional components with hooks

```typescript jsx
import React from 'react';
import useTreeChanges from 'tree-changes/lib/hook';

function App(props) {
  const { changed } = useTreeChanges(props);

  React.useEffect(() => {
    if (changed('hasData', true)) {
    	sendAnalyticsEvent('load', 'MySuperPage');
  	}
  });

  return <div>...</div>;
}
```

> It's safe to run all the methods with a `useEffect` without dependencies but it works with them too.

### Class components

```typescript jsx
import treeChanges from 'tree-changes';

class App extends React.Component {
  componentDidUpdate(prevProps) {
    const { changed, increased } = treeChanges(prevProps, this.props);

    if (increased('retries')) {
      // dispatch some error
    }

    if (changed('hasData', true)) {
      // send data to analytics or something.
    }
  }
	...
}
```

## License

MIT
