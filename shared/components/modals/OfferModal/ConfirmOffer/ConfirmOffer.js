import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import { Link } from 'react-router-dom'
import helpers, { links } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './ConfirmOffer.scss'

import Row from 'components/Row/Row'
import Button from 'components/controls/Button/Button'
import Coins from 'components/Coins/Coins'

import Amounts from './Amounts/Amounts'
import ExchangeRate from './ExchangeRate/ExchangeRate'
import Fee from './Fee/Fee'
import { connect } from 'redaction'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import minAmountOffer from 'helpers/constants/minAmountOffer'
import coinsWithDynamicFee from 'helpers/constants/coinsWithDynamicFee'
import BigNumber from 'bignumber.js'


@injectIntl
@connect(({ currencies: { items: currencies }, user: { ethData: { address } } }) => ({
  currencies,
  address,
}))
@cssModules(styles)
export default class ConfirmOffer extends Component {

  state = {
    tokenFee: false,
    feeValue: 0,
  }

  componentDidMount() {
    this.isActualFee()
  }

  isActualFee = async () => {
    const { offer: { sellCurrency } } = this.props
    const { feeValue } = this.state

    if (helpers.ethToken.isEthToken({ name: sellCurrency.toLowerCase() })) {
      const feeValueDynamic = await helpers.ethToken.estimateFeeValue({ method: 'send' })
      this.setState(() => ({
        tokenFee: true,
        feeValue: feeValueDynamic,
      }))
    } else {
      const feeValueDynamic = await helpers[sellCurrency].estimateFeeValue({ method: 'swap', speed: 'fast' })
      const feeValue = coinsWithDynamicFee.includes(sellCurrency) ? feeValueDynamic : minAmountOffer[sellCurrency]
      this.setState(() => ({
        feeValue,
      }))
    }
  }

  handleConfirm = () => {
    const { intl: { locale }, offer: { buyCurrency, sellCurrency } } = this.props
    this.createOrder()
    actions.modals.close('OfferModal')
  }

  createOrder = () => {
    const { offer } = this.props

    // actions.analytics.dataEvent('orderbook-addoffer-click-confirm-button')
    actions.core.createOrder(offer, offer.isPartial)
    actions.core.updateCore()
  }

  render() {
    const { offer: { buyAmount, sellAmount, buyCurrency, sellCurrency, exchangeRate }, onBack, currencies, intl: { locale } } = this.props
    const { feeValue, tokenFee } = this.state
    return (
      <Fragment>
        <Coins styleName="coins" names={[ sellCurrency, buyCurrency ]} size={60} />
        <Amounts {...{ buyAmount, sellAmount, buyCurrency, sellCurrency }} />
        <ExchangeRate {...{ value: exchangeRate, buyCurrency, sellCurrency }} />
        <Fee amount={feeValue} currency={!tokenFee ? sellCurrency : 'ETH'} />
        <Row styleName="buttonsInRow">
          <Button styleName="button" gray onClick={onBack}>
            <FormattedMessage id="ConfirmOffer69" defaultMessage="Back" />
          </Button>
          <Button styleName="button" id="confirm" brand onClick={this.handleConfirm}>
            <FormattedMessage id="ConfirmOffer73" defaultMessage="Add" />
          </Button>
        </Row>
      </Fragment>
    )
  }
}
