import React, { Component } from 'react'

import Joyride, { STATUS } from 'react-joyride'

import { FormattedMessage } from 'react-intl'
import Tooltip from 'components/TourWindow'


export default class WalletTour extends Component<any, any> {

  constructor(props) {
    super(props)

    /* eslint-disable */
    this.state = {
      run: true,
      steps: [
        {
          content: <FormattedMessage
            id="tour-step-1.1"
            defaultMessage="Ваш совокупный баланс" />,
          target: '.data-tut-all-balance',
        },
        {
          content: <FormattedMessage
            id="tour-step-1.2"
            defaultMessage="Нажав на кнопку, вы сможете пополнить баланс" />,
          target: '.data-tut-all-deposit',
        },
        {
          content: <FormattedMessage
            id="tour-step-1"
            defaultMessage="Баланс по выбранной валюте показывается в конце строки, напротив валюты. Вы можете закрыть браузер, перезагрузить компьютер. Ваш баланс не изменится, только не забудте сохранить ключи" />,
          target: '.data-tut-address',
        },
        {
          content: <FormattedMessage id="tour-step-3" defaultMessage="Наша уникальная функция peer-to-peer обмена доступна в нашем кольке, основанном на технологии Atomic Swap. Вы можете разместить вашу криптовалюту в нашем кошельке." />,
          floaterProps: {
            disableAnimation: true,
          },
          spotlightPadding: 20,
          target: '.reactour-exchange',
        },
        {
          content: <FormattedMessage id="tour-step-2" defaultMessage="Вы можете хранить валюты разных блокчейнов, таких как: Bitcoin, Ethereum, Bitcoin Cash, Litecoin и различные токены" />,
          placement: 'center',
          target: '.data-tut-store',
        },
        {
          content: <FormattedMessage
            id="tour-step-4"
            defaultMessage="Вы будете получать уведомления об обновлениях с вашей учетной записью (заказы, транзакции) и ежемесячные обновления о нашем проекте" />,
          floaterProps: {
            disableAnimation: true,
          },
          spotlightPadding: 20,
          target: '.data-tut-sign-up',
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
