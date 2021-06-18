import React from 'react'
import ReactDOM from 'react-dom'
import routes from 'shared/routes'
import store, { history } from 'redux/store'
import * as Sentry from '@sentry/react';
import { Integrations } from "@sentry/tracing";

import Root from 'shared/containers/Root/Root'
import { migrate } from 'helpers'
import ErrorPageNoSSL from 'shared/components/ErrorPageNoSSL/ErrorPageNoSSL'
import config from 'app-config'
import isLocalIP from 'is-local-ip'
import feedback from 'shared/helpers/feedback'


// eslint-disable-next-line camelcase
const __webpack_public_path__ = `${config.publicPath}images/` // It makes webpack-require-from plugin works. So dont delete it.
// All references is in swap.reace/webpack/rules/images.js


const rootEl = document.getElementById('root')

if (
  !window?.STATISTIC_DISABLED &&
  process.env.NODE_ENV !== 'development'
) {
  Sentry.init({
    dsn: 'https://d35a56c4518c4a6987b0c36b9b0bf123@sentry.wpmix.net/2',
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

if (
  window.location.protocol === 'http:' &&
  window.location.hostname !== 'localhost' &&
  !isLocalIP(window.location.hostname)
) {
  ReactDOM.render(
    <Sentry.ErrorBoundary>
      <ErrorPageNoSSL />
    </Sentry.ErrorBoundary>
    ,
    rootEl
  )
} else {
  migrate().finally(() => setTimeout(() => {
    ReactDOM.render(
      <Sentry.ErrorBoundary>
        {/* @ts-ignore: strictNullChecks */}
        <Root history={history} store={store} routes={routes} />
      </Sentry.ErrorBoundary>,
      rootEl
    )
    console.log('(index.tsx) render root, finished')
  }, 1000))
}

feedback.app.started()
