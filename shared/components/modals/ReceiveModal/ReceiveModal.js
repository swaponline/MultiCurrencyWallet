import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import cssModules from 'react-css-modules'
import styles from './ReceiveModal.scss'

import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import config from 'helpers/externalConfig'


const title = defineMessages({
  Receive: {
    id: 'Receive',
    defaultMessage: 'Receive',
  },
})

@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class ReceiveModal extends React.Component {

  constructor(props) {
    super(props)
    const {
      data: {
        currency,
      },
    } = props

    let howToDeposit = ''
    if (config
      && config.erc20
      && config.erc20[currency.toLowerCase()]
      && config.erc20[currency.toLowerCase()].howToDeposit
    ) howToDeposit = config.erc20[currency.toLowerCase()].howToDeposit

    this.state = {
      isAddressCopied: false,
      howToDeposit,
    }
  }

  handleCopyAddress = () => {
    this.setState({
      isAddressCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isAddressCopied: false,
        })
      }, 500)
    })
  }

  render() {
    const {
      props: {
        name,
        intl,
        data: {
          currency,
          address,
        },
      },
      state: {
        isAddressCopied,
        howToDeposit,
      },
    } = this

    if (howToDeposit) {
      return (
        <Modal name={name} title={intl.formatMessage(title.Receive)}>
          <div dangerouslySetInnerHTML={{ __html: howToDeposit }} />
        </Modal>
      )
    }
    return (
      <Modal name={name} title={intl.formatMessage(title.Receive)}>
        <div styleName="content">
          <p style={{ fontSize: 25 }}>
            <FormattedMessage id="ReceiveModal50" defaultMessage="This is your {currency} address" values={{ currency: `${currency}` }} />
          </p>
          <CopyToClipboard
            text={address}
            onCopy={this.handleCopyAddress}
          >
            <div styleName="qr">
              <QR
                network={currency}
                address={address}
                size={500}
              />
              <p>
                {address}
              </p>
              <Button
                styleName="button"
                brand
                onClick={() => {}}
                disabled={isAddressCopied}
                fullWidth
              >
                { isAddressCopied ?
                  <FormattedMessage id="recieved65" defaultMessage="Address copied to clipboard" />
                  :
                  <FormattedMessage id="recieved67" defaultMessage="Copy to clipboard" />
                }
              </Button>
            </div>
          </CopyToClipboard>
        </div>
      </Modal>
    )
  }
}
