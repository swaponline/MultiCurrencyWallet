import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './ConfirmOffer.scss'

import Row from 'components/Row/Row'
import Button from 'components/controls/Button/Button'
import Coins from 'components/Coins/Coins'

import Amounts from './Amounts/Amounts'
import ExchangeRate from './ExchangeRate/ExchangeRate'
import { FormattedMessage, injectIntl } from 'react-intl'
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
          <Button styleName="button" brand onClick={onBack}>
            <FormattedMessage id="back" defaultMessage="Back" />
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
