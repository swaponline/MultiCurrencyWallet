import React from 'react'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './Root.scss'

import Header from '../Header/Header'
import Loader from '../Loader/Loader'

import Modals from '../Modals/Modals'

@CSSModules(styles)
export default class Root extends React.Component {

  componentWillMount() {
    actions.wallets.setWallets()
    actions.wallets.getHistory()
  }

  render() {
    const { history, children, store, loader } = this.props
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          { loader === true ?
            <Loader />
            :
            <main styleName="main" id="main">
              <Header />
              { children }
              <Modals />
            </main>
          }
        </ConnectedRouter>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired,
}

