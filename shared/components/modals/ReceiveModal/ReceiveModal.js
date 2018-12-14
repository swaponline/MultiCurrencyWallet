import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import cssModules from 'react-css-modules'
import styles from './ReceiveModal.scss'

import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'


const title = defineMessages({
  Receive: {
    id: 'Receive',
    defaultMessage: 'Receive',
  },
})

@injectIntl
@cssModules(styles)
export default class ReceiveModal extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isAddressCopied: false,
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
    const { props: { name, intl, data: { currency, address } }, state: { isAddressCopied } } = this

    return (
      <Modal name={name} title={intl.formatMessage(title.Receive)}>
        <div styleName="content" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 25 }}>
            <FormattedMessage id="ReceiveModal" defaultMessage="This is your address for receive" />
          </p>
          <CopyToClipboard
            text={address}
            onCopy={this.handleCopyAddress}
          >
            <p className={styles.qr} style={{ fontSize: 35 }}>
              <QR
                network={currency}
                address={address}
                size={500}
              />
              <div>
                {address}
              </div>
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
            </p>
          </CopyToClipboard>
        </div>
      </Modal>
    )
  }
}
