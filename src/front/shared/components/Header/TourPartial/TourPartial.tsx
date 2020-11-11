import React, { Component } from 'react'

import Joyride, { STATUS } from 'react-joyride'

import { FormattedMessage } from 'react-intl'
import Tooltip from 'components/TourWindow'


export default class TourPartial extends Component<any, any> {

  constructor(props) {
    super(props)

    /* eslint-disable */
    this.state = {
      run: true,
      steps: [
        {
          content: <FormattedMessage id="partial-tour-2" defaultMessage="В данное поле, введите сумму, которую вы хотите продать, выберите валюту для продажи. Вы также можете продать валюту с внешнего кошелька." />,
          target: '.data-tut-have',
        },
        {
          content: <FormattedMessage id="partial-tour-3" defaultMessage="В данное поле, введите сумму, которую вы хотели бы купить, выберите валюту для покупки." />,
          floaterProps: {
            disableAnimation: true,
          },
          spotlightPadding: 20,
          target: '.data-tut-get',
        },
        {
          content: <FormattedMessage id="partial-tour-4" defaultMessage="Здесь вы можете увидеть статус поиска предложений по обмену. При загрузке будет отображаться «Поиск заказов ...». Когда заказ найден, проверьте курс обмена здесь" />,
          floaterProps: {
            disableAnimation: true,
          },
          spotlightPadding: 20,
          target: '.data-tut-status',
        },
        {
          content: <FormattedMessage id="partial-tour-5" defaultMessage="Переключите эту кнопку, чтобы получать средства после обмена на внутренний кошелек на Swap.online или на другой кошелек" />,
          floaterProps: {
            disableAnimation: true,
          },
          spotlightPadding: 20,
          target: '.data-tut-togle',
        },
        {
          content: <FormattedMessage
            id="partial-tour-6"
            defaultMessage="Переключите эту кнопку, чтобы увидеть прямой URL операции обмена. Это возможно, когда кнопка розовая." />,
          floaterProps: {
            disableAnimation: true,
          },
          spotlightPadding: 20,
          target: '.data-tut-Exchange',
        },
        {
          content: <FormattedMessage
            id="partial-tour-7"
            defaultMessage="Нажмите на эту кнопку, чтобы увидеть страницу с предложениями для обмена. Предложения будут представлены для конкретных валют. Также вы можете создать собственное предложение на странице предложений." />,
          floaterProps: {
            disableAnimation: true,
          },
          spotlightPadding: 20,
          target: '.data-tut-Orderbook',
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
            },
          }}
        />}
      </div>
    )
  }
}
