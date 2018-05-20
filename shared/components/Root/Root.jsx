import React from 'react'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './Root.scss'

import Header from 'components/Header/Header'
import Loader from 'components/Loader/Loader'

import Modals from 'components/Modals/Modals'

@connect({
  loader: 'loader.visible',
})
@CSSModules(styles)
export default class Root extends React.Component {

  componentWillMount() {
    actions.wallets.setWallets()
    actions.wallets.getHistory()
    setTimeout(() => {
      actions.loader.update()
    }, 3000)
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

