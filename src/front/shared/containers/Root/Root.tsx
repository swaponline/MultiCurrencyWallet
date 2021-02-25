import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import App from 'containers/App/App'
import IntlProviderContainer from './IntlProviderContainer'

type RootProps = {
  history: any
  store: IUniversalObj
  routes: IUniversalObj
}

export default class Root extends React.Component<RootProps, null> {
  constructor(props) {
    super(props)
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
