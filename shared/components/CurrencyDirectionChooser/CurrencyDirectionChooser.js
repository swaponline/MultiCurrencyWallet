import React, { Component } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './CurrencyDirectionChooser.scss'

import Flip from 'components/controls/Flip/Flip'
import Button from 'components/controls/Button/Button'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'


@CSSModules(styles, { allowMultiple: true })
export default class CurrencyDirectionChooser extends Component {

  static propTypes = {
    flipCurrency: PropTypes.func,
    currencies: PropTypes.any,
    handleSellCurrencySelect: PropTypes.func,
    handleBuyCurrencySelect: PropTypes.func,
    handleSubmit: PropTypes.func,
    buyCurrency: PropTypes.string.isRequired,
    sellCurrency: PropTypes.string.isRequired,
  }

  createOffer = () => {
    const { buyCurrency, sellCurrency } = this.props

    // return if value equal undefined or null
    if (!sellCurrency || !buyCurrency) {
      return
    }

    actions.modals.open(constants.modals.Offer, {
      buyCurrency,
      sellCurrency,
    })

    actions.analytics.dataEvent('orderbook-click-createoffer-button')
  }

  render() {
    const { buyCurrency, sellCurrency,
      flipCurrency, handleBuyCurrencySelect, handleSellCurrencySelect, handleSubmit,
      currencies } = this.props

    return (
      <div styleName="choice">
        <div styleName="row title">
          <FormattedMessage id="CurrencyDirectionChooser54" defaultMessage=" Choose the direction of exchange">
            {message => <SubTitle>{message}</SubTitle>}
          </FormattedMessage>
        </div>
        <div styleName="row formRow">
          <div styleName="row">
            <div styleName="row">
              <FormattedMessage id="CurrencyDirectionChooser61" defaultMessage="You have">
                {message =>   <p styleName="text">{message}</p>}
              </FormattedMessage>
              <CurrencySelect
                styleName="currencySelect"
                selectedValue={sellCurrency}
                onSelect={handleSellCurrencySelect}
                currencies={currencies}
              />
            </div>
            <Flip onClick={flipCurrency} />
            <div styleName="row">
              <FormattedMessage id="CurrencyDirectionChooser74" defaultMessage="You geе">
                {message =>   <p styleName="text">{message}</p>}
              </FormattedMessage>
              <CurrencySelect
                styleName="currencySelect"
                selectedValue={buyCurrency}
                onSelect={handleBuyCurrencySelect}
                currencies={currencies}
              />
            </div>
          </div>

          <FormattedMessage id="CurrencyDirectionChooser86" defaultMessage="SHOW ORDERS ">
            {message =>   <Button styleName="button" brand onClick={handleSubmit}>{message}<Tooltip text="Offer list" /></Button>}
          </FormattedMessage>
        </div>
      </div>
    )
  }
}
