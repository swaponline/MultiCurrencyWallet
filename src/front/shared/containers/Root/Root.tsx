import * as React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import App from 'containers/App/App'

import IntlProviderContainer from './IntlProviderContainer'

export default class Root extends React.Component<any, any> {
  props: any

  /*  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    routes: PropTypes.element.isRequired,
  }*/

  constructor(props) {
    super(props)
    console.log('>>>>>>>>>>>>>>>>>>>>>>>> Construction - Root', props)
  }

  render() {
    const { history, store, routes } = this.props

    console.log('>>>>>>>>>>>>>>>>>>>>>>>> Construction - Root - render', history)
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
