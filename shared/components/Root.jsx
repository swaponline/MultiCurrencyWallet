import React from 'react'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'

import Header from './Header/Header'
import Loader from './Loader/Loader'

import ModalsContainer from '../containers/ModalsContainer'
import user from '../instances/user'

export default class Root extends React.Component {

  componentWillMount() {

    this.props.addWallet()
    this.props.getHistory()

    setTimeout(() => {
      this.props.updateLoader(false)
    }, 2000)
  }

  render() {
    const { history, children, store, loader } = this.props
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          { loader === true ?
            <Loader />
            :
            <main className="main" id="main">
              <Header />
              { children }
              <ModalsContainer />
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
  addWallet: PropTypes.func.isRequired,
  updateLoader: PropTypes.func.isRequired,
  getHistory: PropTypes.func.isRequired,
  loader: PropTypes.bool.isRequired,
}

