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
    actions.modals.open(constants.modals.Offer, {
      buyCurrency: this.props.buyCurrency,
      sellCurrency: this.props.sellCurrency,
    })
    actions.analytics.dataEvent('orderbook-click-createoffer-button')
  }

  render() {
    const {
      buyCurrency,
      sellCurrency,
      flipCurrency,
      handleBuyCurrencySelect,
      handleSellCurrencySelect,
      handleSubmit,
      currencies,
    } = this.props

    return (
      <div styleName="choice">
        <div styleName="row title">
          <SubTitle>Choose the direction of exchange</SubTitle>
        </div>
        <div styleName="row formRow">
          <div styleName="row">
            <div styleName="row">
              <p styleName="text">You have </p>
              <CurrencySelect
                styleName="currencySelect"
                selectedValue={sellCurrency}
                onSelect={handleSellCurrencySelect}
                currencies={currencies}
              />
            </div>
            <Flip onClick={flipCurrency} />
            <div styleName="row">
              <p styleName="text">You get</p>
              <CurrencySelect
                styleName="currencySelect"
                selectedValue={buyCurrency}
                onSelect={handleBuyCurrencySelect}
                currencies={currencies}
              />
            </div>
          </div>
          <Button styleName="button" brand onClick={handleSubmit}>SHOW ORDERS</Button>
        </div>
        <div styleName="videoContainer row">
          <SubTitle>What is atomic swap?</SubTitle>

          <iframe
            title="What is atomic swap?"
            width="700"
            height="480"
            src="https://www.youtube.com/embed/Jhrb7xOT_7s"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    )
  }
}
