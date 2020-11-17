import * as React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'

import App from 'containers/App/App'

import IntlProviderContainer from './IntlProviderContainer'


/*type Props = {
  history: any
  store: any
  routes: any
}*/

export default class Root extends React.Component<any, any> {

  props: any

/*  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    routes: PropTypes.element.isRequired,
  }*/

  constructor(props) {
    super(props)
  }

  render() {
    const { history, store, routes } = this.props

    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <IntlProviderContainer>
            <App>
              {routes}
            </App>
          </IntlProviderContainer>
        </ConnectedRouter>
      </Provider>
    )
  }
}
