import React from 'react'
import ReactDOM from 'react-dom'
import routes from 'routes'
import store, { history } from 'redux/store'

import Root from 'components/Root/Root'

import './scss/app.scss'


ReactDOM.render(
  <Root history={history} store={store}>
    {routes}
  </Root>,
  document.getElementById('root')
)
