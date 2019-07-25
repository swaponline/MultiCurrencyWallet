import React, { Component } from 'react'

import { FormattedMessage } from 'react-intl'
import Tour from 'reactour'


export default class TourPartial extends Component {
  constructor(props) {
    super(props)

    this.state = {
      shouldTourOpen: true,
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
/* eslint-disable */
const tourSteps = [
  {
    selector: '[data-tut="have"]', //have currency
    content: <FormattedMessage id="tourPartial94" defaultMessage="Please enter the amount you would like to sell and select the currency to sell. You can also sell currency from an external wallet." />,
  },
  {
    selector: '[data-tut="get"]',
    content: <FormattedMessage id="tourPartial99" defaultMessage="Please enter the amount you would like to buy and select the currency to buy." />,
  },
  {
    selector: '[data-tut="status"]',
    content: <FormattedMessage
      id="tourPartial103"
      defaultMessage="Here you can see the status of the search for exchange offers. When loading there will be `Searching orders...` shown. When the order is found, check the exchange rate here" />,
  },
  {
    selector: '[data-tut="togle"]',
    content: <FormattedMessage id="tourPartial107" defaultMessage="Switch this button to receive funds after exchanging to the internal wallet on Swap.online or to another wallet" />,
  },
  {
    selector: '[data-tut="Exchange"]',
    content: <FormattedMessage
      id="tourPartial116"
      defaultMessage="Switch this button to see the direct URL of the exchange operation. This is possible when the button is pink." />,
  },
  {
    selector: '[data-tut="Orderbook"]',
    content: <FormattedMessage
      id="tourPartial128"
      defaultMessage="Click on this button to see the page with offers for exchange. Offers will be presented for the particular currencies. Also you can create your own offer on the offer page." />,
  },
]

/* eslint-enable */
