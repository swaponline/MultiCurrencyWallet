import * as React from 'react'
import { Provider } from 'react-redux'
import store, { history } from 'redux/store'
import routes from 'shared/routes'
import { ConnectedRouter } from 'connected-react-router'

import App from 'containers/App/App'
import IntlProviderContainer from './IntlProviderContainer'

import reducers from 'redux/core/reducers'


type RootProps = {
  history: typeof history
  store: typeof store
  routes: typeof routes
}

export default class Root extends React.Component<RootProps, null> {
  constructor(props) {
    super(props)

    // reset dinamic reducers data
    reducers.user.setIsBalanceFetching({ isBalanceFetching: false })
  }

  render() {
    const { history, store, routes } = this.props

    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <>
            <IntlProviderContainer>
              <App history={history}>{routes}</App>
            </IntlProviderContainer>
          </>
        </ConnectedRouter>
      </Provider>
    )
  }
}
