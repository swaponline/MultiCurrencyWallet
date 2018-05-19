import React from 'react'
import { render } from 'react-dom'
import routes from '../shared/routes/routes'
import store, { history } from '../shared/redux/store'
import Root from '../shared/components/Root/Root'
import './scss/app.scss'

render(
  <Root history={history} store={store}>
    { routes }
  </Root>,
  document.getElementById('root')
)
