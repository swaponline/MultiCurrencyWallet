import React from 'react'
import ReactDOM from 'react-dom'
import routes from 'routes'
import store, { history } from 'redux/store'

import Root from 'containers/Root/Root'
import Loader from 'components/loaders/Loader/Loader'
import { migrate } from 'helpers'
import ErrorPageNoSSL from 'components/ErrorPageNoSSL/ErrorPageNoSSL'
import config from 'app-config'
import isLocalIP from 'is-local-ip'
import feedback from 'shared/helpers/feedback'


// eslint-disable-next-line camelcase
const __webpack_public_path__ = `${config.publicPath}images/` // It makes webpack-require-from plugin works. So dont delete it.
// All references is in swap.reace/webpack/rules/images.js


const rootEl = document.getElementById('root')

if (
  window.location.protocol === 'http:' &&
  window.location.hostname !== 'localhost' &&
  !isLocalIP(window.location.hostname)
) {
  ReactDOM.render(<ErrorPageNoSSL />, rootEl)
} else {
  migrate().finally(() => setTimeout(() => {
    ReactDOM.render(<Root history={history} store={store} routes={routes} />, rootEl)
  }, 1000))
}

feedback.app.started()
