<p>
  <img src="./images/redaction-logo-big.png" height="70" />
</p>

### Redux reducers without constants and dispatching!

Redaction is wrapper for reducers. The main purpose is to refuse from using constants and dispatch method in code.

[![Npm Version](https://badge.fury.io/js/redaction.svg)](https://www.npmjs.com/package/redaction)
[![Month Downloads](https://img.shields.io/npm/dm/redaction.svg)](http://npm-stat.com/charts.html?package=redaction)
[![Npm Licence](https://img.shields.io/npm/l/redaction.svg)](https://www.npmjs.com/package/redaction)


### Installation

To install the stable version:

```bash
npm install --save redaction
```


### Overview

In large projects usage of the standard Redux approach becomes a headache because of of the huge amount of constants and pushing the dispatch across the entire application logic. Redaction comes to help us solve these problems.

**Note:** Redaction is just wrapper over Redux, so it's not *reinventing the wheel*, it's **_sweet sugar_** :)

**BEWARE:** If you use / or planning to use SSR in your project **DON'T USE** Redaction! Currently there are some approaches inside which prevents from doing with SSR in easy way.. If you still want to use it and get problems with SSR fill free to contact me <a href="mailto:grammka@gmail.com">grammka@gmail.com</a>.

#### Redux approach

`constants/todos.js`
```js
const ADD_TODO = 'ADD_TODO'

export {
  ADD_TODO
}
```

`reducers/todos.js`
```js
import { ADD_TODO } from 'constants/todos'

const initialState = {
  todos: []
}

export default (state = initialState, action) => {
  switch (action.type) {

    case ADD_TODO:
      return {
        ...state,
        todos: [
          ...state.todos,
          action.payload
        ]
      }

    default:
      return state
  }
}
```

`actions/todos.js`
```js
import { ADD_TODO } from 'constants/todos'

export const addTodo = (text) => (dispatch) => {
  dispatch({
    type: ADD_TODO,
    payload: text
  })
}
```

`App.js`
```js
import { connect } from 'react-redux'
import { addTODO } from 'actions/todos' 

const App = ({ todos, addTodo }) => (
  <div>
    {
      todos.map((text, index) => (
        <div key={index}>{text}</div>
      ))
    }
    <button onClick={() => addTodo('new todo name')}>Add</button>
  </div>
)

const mapStateToProps = (state) => ({
  todos: state.todos,
})

const mapDispatchToProps = (dispatch) => ({
  addTodo: (text) => {
    dispatch(addTodo(text))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
```

#### Same with Redaction

`reducers/todos.js`
```js
export const initialState = {
 todos: []
}

export const addTodo = (state, payload) => ({ 
  ...state, 
  todos: [ 
    ...state.todos, 
    payload 
  ]
})
```

`actions/todos.js`
```js
import { reducers } from 'core/reducers' // read docs to understand what core folder means

export const addTodo = (text) => {
  reducers.todos.addTodo(text)
}
```

`App.js`
```
import actions from 'actions'
import { connect } from 'redaction' 

const App = ({ todos }) => (
  <div>
    {
      todos.map((text, index) => (
        <div key={index}>{text}</div>
      ))
    }
    <button onClick={() => actions.addTodo('new todo name')}>Add</button>
  </div>
)

export default connect({
  todos: 'todos'
})(App)
```

##### That's it! Nifty :) No constants! No dispatch!


### Usage

#### `actions/users.js`
```js
import reducers from 'core/reducers'

export const getAll = () => {
  fetch({
    endpoint: '/api/users',
    method: 'GET'
  })
    .then((result) => {
      reducers.users.put(result)
    })
}
```

#### `reducers/users.js`
```js
export const initialState = {
  list: [],
}

export const put = (state, payload) => ({
  ...state,
  list: [
    ...state.list,
    payload,
  ]
}) 
```

#### `core/store.js`

```js
import { createStore, combineReducers } from 'redaction'
import { reducer as form } from 'redux-form'
import reducers from 'reducers'

const initialState = {}

const store = createStore({
  reducers: {
    ...combineReducers(reducers),
    form,
  },
  initialState,
})

export default store
```

##### `core/reducers.js`

```js
import { wrapReducers } from 'redaction'
import reducers from 'reducers'

export default wrapReducers(reducers)
```

#### `components/Posts.js`

```js
import React from 'react'
import { users } from 'actions'

export default class Posts extends React.Component {
  componentWillMount() {
    users.getAll()
  }
}
```


### Features

#### Connect

There is sugar to connect state to components nifty:

```js
import React, { Component } from 'react'
import { connect } from 'redaction'

// option 1
@connect(state => ({
  todos: state.todos.list,
}))
// option 2
@connect({
  todos: 'todos.list',
})
// option 3
@connect({
  todos: (state) => state.todos.list,
})
export default class TodosList extends Component {}
```


### Examples

[Repo examples](https://github.com/pavelivanov/redaction/tree/master/examples/plain)


### Tests

To run tests:

```
npm test
```


### TODO

- [ ] Support React hooks
