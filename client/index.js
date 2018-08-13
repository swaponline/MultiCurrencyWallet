import React from 'react'
import { render } from 'react-dom'
import routes from 'routes'
import store, { history } from 'redux/store'

import Root from 'containers/Root/Root'


render(
  <Root
    history={history}
    store={store}
    routes={routes}
  />, document.getElementById('root')
)
