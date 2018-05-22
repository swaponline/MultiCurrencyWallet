import React from 'react'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './Root.scss'

import Header from 'components/Header/Header'
import Loader from 'components/Loader/Loader'
import ModalConductor from 'components/modal/ModalConductor/ModalConductor'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


@CSSModules(styles)
export default class Root extends React.Component {

  propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
  }

  componentWillMount() {
    actions.user.sign()

    setTimeout(() => {
      actions.loader.update()
    }, 3000)
  }

  render() {
    const { history, children, store } = this.props

    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div>
            <Header />
            <main styleName="main" id="main">
              <WidthContainer>
                {children}
              </WidthContainer>
            </main>
            <Loader />
            <ModalConductor />
          </div>
        </ConnectedRouter>
      </Provider>
    )
  }
}
