import React, { Component } from 'react'

import Joyride, { STATUS } from 'react-joyride'

import { FormattedMessage } from 'react-intl'
import Tooltip from 'components/TourWindow'


export class WidgetWalletTour extends Component<any, any> {

  constructor(props) {
    super(props)

    /* eslint-disable */
    this.state = {
      run: true,
      steps: [
        {
          content: <FormattedMessage
            id="widget-tour-step-1"
            defaultMessage="Welcome to {widgetName}. Take the tour?"
            values={{ widgetName: window.widgetName }}
          />,
          placement: 'center',
          target: '.data-tut-start-widget-tour',
        },
        {
          content: <FormattedMessage
            id="widget-tour-step-2"
            defaultMessage="This is your wallet balance." />,
          spotlightPadding: 0,
          target: '.data-tut-widget-balance',
        },
        {
          content: <FormattedMessage
            id="widget-tour-step-3"
            defaultMessage="Use these buttons to transfer Cryptocurrencies in and out of your wallet." />,
          spotlightPadding: 0,
          target: '.data-tut-withdraw-buttons',
        },
        {
          content: <FormattedMessage
            id="widget-tour-step-4"
            defaultMessage="Scroll through this menu to find products, services and useful information."
          />,
          target: '.data-tut-banners',
        },
        {
          content: <FormattedMessage
            id="widget-tour-step-5"
            defaultMessage="Click these three dots to find your wallet address, private keys and more."
          />,
          spotlightPadding: 0,
          placement: 'left',
          target: '.data-tut-row-menu',
        },
        {
          content: <FormattedMessage
            id="widget-tour-step-6"
            defaultMessage="Click this button to review a list of your recent transactions."
          />,
          spotlightPadding: 0,
          target: '.data-tut-recent',
        },
        {
          content: <FormattedMessage
            id="widget-tour-step-7"
            defaultMessage="Click this button to exchange your cryptocurrencies."
          />,
          spotlightPadding: 0,
          target: '.data-tut-widget-exchange',
        },
        {
          content: <FormattedMessage
            id="widget-tour-finishStep"
            defaultMessage="That's it! Lets get started."
          />,
          placement: 'center',
          target: '.data-tut-widget-tourFinish',
        },
      ],
    }
    /* eslint-enable */
  }

  handleJoyrideCallback = (data) => {
    const { status } = data
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      this.setState({ run: false })
    }
  };

  render() {
    const { run, steps } = this.state
    const { closeTour, isTourOpen } = this.props
    return (
      <div className="demo-wrapper">
        {isTourOpen && <Joyride
          callback={this.handleJoyrideCallback}
          continuous
          run={run}
          scrollToFirstStep
          tooltipComponent={(props) => <Tooltip closeTour={closeTour} {...props} />}
          showProgress
          showSkipButton
          steps={steps}
          styles={{
            options: {
              zIndex: 10000,
              arrowColor: '#302272',
              width: 300
            },
          }}
        />}
      </div>
    );
  }
}
