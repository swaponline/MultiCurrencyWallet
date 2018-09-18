import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import cssModules from 'react-css-modules'
import styles from './ReceiveModal.scss'

import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'


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
    const { props: { name, data: { currency, address } }, state: { isAddressCopied } } = this

    return (
      <Modal name={name} title="Receive">
        <div styleName="content">
          <p>This is your address for receive {currency}</p>
          <CopyToClipboard
            text={address}
            onCopy={this.handleCopyAddress}
          >
            <p className={styles.qr}>
              <QR
                network={currency}
                address={address}
                size={500}
              />
              {address}
              <Button
                styleName="button"
                brand
                onClick={() => {}}
                disabled={isAddressCopied}
                fullWidth
              >
                { isAddressCopied ? 'Address copied to clipboard' : 'Copy to clipboard' }
              </Button>
            </p>
          </CopyToClipboard>
        </div>
      </Modal>
    )
  }
}
