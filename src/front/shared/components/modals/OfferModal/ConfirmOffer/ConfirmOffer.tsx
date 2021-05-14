import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import erc20Like from 'common/erc20Like'
import helpers from 'helpers'

import cssModules from 'react-css-modules'
import styles from './ConfirmOffer.scss'

import Row from 'components/Row/Row'
import Button from 'components/controls/Button/Button'
import Coins from 'components/Coins/Coins'

import Amounts from './Amounts/Amounts'
import ExchangeRate from './ExchangeRate/ExchangeRate'
import { connect } from 'redaction'
import { FormattedMessage, injectIntl } from 'react-intl'
import MIN_AMOUNT_OFFER from 'common/helpers/constants/MIN_AMOUNT'
import COINS_WITH_DYNAMIC_FEE from 'common/helpers/constants/COINS_WITH_DYNAMIC_FEE'
import feedback from 'shared/helpers/feedback'


@connect(({ currencies: { items: currencies }, user: { ethData: { address } } }) => ({
  currencies,
  address,
}))
@cssModules(styles)
class ConfirmOffer extends Component<any, any> {

  state = {
    tokenFee: false,
    feeValue: 0,
  }

  componentDidMount() {
    this.isActualFee()
  }

  isActualFee = async () => {
    const { offer: { sellCurrency } } = this.props

    if ( erc20Like.erc20.isToken({ name: sellCurrency }) ) {
      const feeValueDynamic = await erc20Like.erc20.estimateFeeValue({ method: 'send', speed: 'fast' })

      this.setState(() => ({
        tokenFee: true,
        feeValue: feeValueDynamic,
      }))
    } else if ( erc20Like.bep20.isToken({ name: sellCurrency }) ) {
      const feeValueDynamic = await erc20Like.bep20.estimateFeeValue({ method: 'send', speed: 'fast' })

      this.setState(() => ({
        tokenFee: true,
        feeValue: feeValueDynamic,
      }))
    } else {
      const feeValueDynamic = await helpers[sellCurrency].estimateFeeValue({ method: 'swap', speed: 'fast' })
      const feeValue = COINS_WITH_DYNAMIC_FEE.includes(sellCurrency)
        ? feeValueDynamic
        : MIN_AMOUNT_OFFER[sellCurrency]
      this.setState(() => ({
        feeValue,
      }))
    }
  }

  handleConfirm = () => {
    const { intl: { locale }, offer: { buyCurrency, sellCurrency } } = this.props

    feedback.createOffer.finished(`${sellCurrency}->${buyCurrency}`)
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
        <ExchangeRate {...{ sellCurrency, buyCurrency, exchangeRate }} />
        {/*<Fee amount={feeValue} currency={!tokenFee ? sellCurrency : 'ETH'} />*/}

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

export default injectIntl(ConfirmOffer)
