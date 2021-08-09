import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Joyride, { STATUS } from 'react-joyride'
import Tooltip from 'components/TourWindow'

export class QuickSwapFormTour extends Component<any, any> {
  constructor(props) {
    super(props)

    this.state = {
      run: true,
      steps: [
        {
          content: (
            <FormattedMessage id="bankCardButtonDescription" defaultMessage="Some description" />
          ),
          spotlightPadding: 0,
          target: '.buyViaBankCardButton',
        },
      ],
    }
  }

  handleJoyrideCallback = (data) => {
    const { status } = data
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      this.setState({ run: false })
    }
  }

  render() {
    const { run, steps } = this.state
    const { closeTour, isTourOpen } = this.props

    return (
      <div className="demo-wrapper">
        {isTourOpen && (
          <Joyride
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
                width: 300,
              },
            }}
          />
        )}
      </div>
    )
  }
}
