import React, { Component, Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './ConfirmOffer.scss'

import ButtonsInRow from 'components/controls/ButtonsInRow/ButtonsInRow'
import Button from 'components/controls/Button/Button'

import Coins from './Coins/Coins'
import Amounts from './Amounts/Amounts'
import ExchangeRate from './ExchangeRate/ExchangeRate'
import Fee from './Fee/Fee'


@cssModules(styles)
export default class ConfirmOffer extends Component {

  handleConfirm = () => {
    alert('This functionality will be available soon! :)')
  }

  render() {
    const { offer: { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency }, onBack } = this.props

    return (
      <Fragment>
        <Coins {...{ buyCurrency, sellCurrency }} />
        <Amounts {...{ buyAmount, sellAmount, buyCurrency, sellCurrency }} />
        <ExchangeRate {...{ value: exchangeRate, buyCurrency, sellCurrency }} />
        <Fee amount={0.0001} currency={sellCurrency} />
        <ButtonsInRow styleName="buttonsInRow">
          <Button styleName="button" gray onClick={onBack}>Back</Button>
          <Button styleName="button" brand onClick={this.handleConfirm}>Confirm</Button>
        </ButtonsInRow>
      </Fragment>
    )
  }
}
