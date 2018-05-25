import React, { Fragment } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './App.scss'

import Header from 'components/Header/Header'
import Loader from 'components/loaders/Loader/Loader'
import RequestLoader from 'components/loaders/RequestLoader/RequestLoader'
import ModalConductor from 'components/modal/ModalConductor/ModalConductor'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


@withRouter
@connect({
  ethAddress: 'user.ethData.address',
  btcAddress: 'user.btcData.address',
  tokenAddress: 'user.tokenData.address',
  isVisible: 'loader.isVisible',
})
@CSSModules(styles)
export default class App extends React.Component {

  static propTypes = {
    children: PropTypes.element.isRequired,
  }

  componentWillMount() {
    actions.user.sign()
  }

  componentDidMount() {
    const { isVisible } = this.props
    if (!isVisible) {
      actions.modals.open(constants.modals.PrivateKeys)
    }
  }

  render() {
    const { children, ethAddress, btcAddress, tokenAddress } = this.props
    const isFetching = !ethAddress || !btcAddress || !tokenAddress
    if (isFetching) {
      return <Loader />
    }

    return (
      <Fragment>
        <Header />
        <main styleName="main" id="main">
          <WidthContainer>
            {children}
          </WidthContainer>
        </main>
        <RequestLoader />
        <ModalConductor />
      </Fragment>
    )
  }
}
