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


@cssModules(styles)
class ConfirmOffer extends Component<any, any> {
  handleConfirm = () => {
    const { offer: { buyCurrency, sellCurrency } } = this.props

    feedback.createOffer.finished(`${sellCurrency}->${buyCurrency}`)
    this.createOrder()
    actions.modals.close('OfferModal')
  }

  createOrder = () => {
    const { offer } = this.props

    actions.core.createOrder(offer, offer.isPartial)
    actions.core.updateCore()
  }

  render() {
    const { offer: { buyAmount, sellAmount, buyCurrency, sellCurrency, exchangeRate }, onBack } = this.props

    return (
      <Fragment>
        <Coins styleName="coins" names={[ sellCurrency, buyCurrency ]} size={60} />
        <Amounts {...{ buyAmount, sellAmount, buyCurrency, sellCurrency }} />
        <ExchangeRate {...{ sellCurrency, buyCurrency, exchangeRate }} />

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
