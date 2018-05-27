import React, { Fragment } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { constants } from 'helpers'
import moment from 'moment'

import CSSModules from 'react-css-modules'
import styles from './App.scss'
import 'scss/app.scss'

import Header from 'components/Header/Header'
import Loader from 'components/loaders/Loader/Loader'
import RequestLoader from 'components/loaders/RequestLoader/RequestLoader'
import ModalConductor from 'components/modal/ModalConductor/ModalConductor'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


moment.locale('en-gb')

@withRouter
@connect({
  isPrivateKeysSaved: () => localStorage.getItem(constants.localStorage.privateKeysSaved),
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

  componentDidMount() {
    const { isPrivateKeysSaved } = this.props

    actions.user.sign()

    if (!isPrivateKeysSaved) {
      // actions.modals.open(constants.modals.PrivateKeys)
    }
  }

  render() {
    const { children, ethAddress, btcAddress, tokenAddress } = this.props
    const isFetching = !ethAddress || !btcAddress || !tokenAddress

    if (isFetching) {
      return (
        <Loader />
      )
    }

    return (
      <Fragment>
        <Header />
        <WidthContainer styleName="main">
          {children}
        </WidthContainer>
        <RequestLoader />
        <ModalConductor />
      </Fragment>
    )
  }
}
