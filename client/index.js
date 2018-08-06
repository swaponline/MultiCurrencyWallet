import React from 'react'
import ReactDOM from 'react-dom'
import routes from 'routes'
import store, { history } from 'redux/store'

import Root from 'containers/Root/Root'


ReactDOM.render(
  <Root history={history} store={store} routes={routes} />, document.getElementById('root')
)

