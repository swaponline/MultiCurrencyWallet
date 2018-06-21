import React from 'react'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'

import App from 'containers/App/App'


export default class Root extends React.PureComponent {

  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    routes: PropTypes.element.isRequired,
  }

  render() {
    const { history, store, routes } = this.props
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App>
            {routes}
          </App>
        </ConnectedRouter>
      </Provider>
    )
  }
}
