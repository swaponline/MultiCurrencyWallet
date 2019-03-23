import React, { Component } from 'react'

import styles from '../PartialClosure.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'
import Tour from 'reactour'


@CSSModules(styles)
export default class TourPartial extends Component {

  constructor({ isTourOpen }) {
    super()
    this.state = {
      shouldTourOpen: isTourOpen,
    }
  }

  closeTour = () => {
    this.setState({ shouldTourOpen: false })
  }

  render() {
    const { shouldTourOpen } = this.state
    const accentColor = '#510ed8'

    return (
      <Tour
        steps={tourSteps}
        onRequestClose={this.closeTour}
        isOpen={shouldTourOpen}
        maskClassName="mask"
        className="helper"
        accentColor={accentColor}
      />
    )
  }
}
const tourSteps = [
  {
    selector: '[data-tut="partal"]', //have currency
    content: <FormattedMessage id="tourPartial62" defaultMessage="This page is designed for easier and faster search for offers for exchange. Here you can choose a currency receipt purse, start an exchange with partial closure or go to the page with all available offers." />,
  },
  {
    selector: '[data-tut="have"]', //have currency
    content: <FormattedMessage id="tourPartial94" defaultMessage="In this field you enter the amount you want to sell and select the currency to sell." />,
  },
  {
    selector: '[data-tut="get"]',
    content: <FormattedMessage id="tourPartial99" defaultMessage="In this field you enter the amount you want to buy and select the currency to buy." />,
  },
  {
    selector: '[data-tut="available"]',
    content: <FormattedMessage id="tourPartial111" defaultMessage="This amount is the amount available for sale from your internal wallet swap.online, minus the miners' fee. By selling this amount, you can not worry about additional payments." />,
  },
  {
    selector: '[data-tut="status"]',
    content: <FormattedMessage
      id="tourPartial103"
      defaultMessage="In this place you can see the status of the search for exchange offers,  during loading there will be an inscription “Searching orders...” at this place, when the order is found in this place, the exchange rate will be written" />,
  },
  {
    selector: '[data-tut="togle"]',
    content: <FormattedMessage id="tourPartial107" defaultMessage="With this switch, you can choose to receive funds after exchanging for an internal wallet swap.online or for another wallet" />,
  },
  {
    selector: '[data-tut="Exchange"]',
    content: <FormattedMessage
      id="tourPartial116"
      defaultMessage="By clicking on this button you can link to the exchange from this page. This will be possible if the button changes its color to pink." />,
  },
  {
    selector: '[data-tut="Orderbook"]',
    content: <FormattedMessage
      id="tourPartial128"
      defaultMessage="By clicking on this button takes you to the page with offers for exchange, offers will be presented depending on the selected currencies. Also on the offer page you can create your own offer." />,
  },
]
