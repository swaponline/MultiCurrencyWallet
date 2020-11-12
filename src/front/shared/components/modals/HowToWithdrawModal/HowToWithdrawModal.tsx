import React from 'react'

import cssModules from 'react-css-modules'
import styles from './HowToWithdrawModal.scss'

import { Modal } from 'components/modal'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import config from 'helpers/externalConfig'


const langLabels = defineMessages({
  title: {
    id: 'HowToWithdrawModal_Title',
    defaultMessage: 'How to withdraw',
  },
})

@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class HowToWithdrawModal extends React.Component<any, any> {

  constructor(props) {
    super(props)
    const {
      data: {
        currency,
      },
    } = props

    let howToWithdraw = ''
    if (config
      && config.erc20
      && config.erc20[currency.toLowerCase()]
      && config.erc20[currency.toLowerCase()].howToWithdraw
    ) howToWithdraw = config.erc20[currency.toLowerCase()].howToWithdraw

    this.state = {
      howToWithdraw,
    }
  }

  render() {
    const {
      props: {
        name,
        intl,
      },
      state: {
        howToWithdraw,
      },
    } = this

    return (
      <Modal name={name} title={intl.formatMessage(langLabels.title)}>
        <div dangerouslySetInnerHTML={{ __html: howToWithdraw }} />
      </Modal>
    )
  }
}
