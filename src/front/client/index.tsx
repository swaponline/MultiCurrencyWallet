import { createRoot } from 'react-dom/client'
import routes from 'shared/routes'
import store, { history } from 'redux/store'

import Root from 'shared/containers/Root/Root'
import { migrate } from 'helpers'
import ErrorPageNoSSL from 'shared/components/ErrorPageNoSSL/ErrorPageNoSSL'
import config from 'app-config'
import isLocalIP from 'is-local-ip'
import feedback from 'shared/helpers/feedback'

// eslint-disable-next-line camelcase
const __webpack_public_path__ = `${config.publicPath}images/` // It makes webpack-require-from plugin works. So dont delete it.
// All references is in swap.reace/webpack/rules/images.js

const rootEl = document.getElementById('root')!
const root = createRoot(rootEl)

if (
  window.location.protocol === 'http:'
  && window.location.hostname !== 'localhost'
  && !isLocalIP(window.location.hostname)
) {
  root.render(<ErrorPageNoSSL />)
} else {
  migrate().finally(() => setTimeout(() => {
    root.render(<Root history={history} store={store} routes={routes} />)
    console.log('(index.tsx) render root, finished')
  }, 1000))
}

feedback.app.started()
