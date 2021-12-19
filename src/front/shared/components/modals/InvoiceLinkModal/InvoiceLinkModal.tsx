import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import cssModules from 'react-css-modules'
import styles from './InvoiceLinkModal.scss'

import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { links } from 'helpers'
import { getFullOrigin } from 'helpers/links'


const labels = defineMessages({
  Title: {
    id: 'InvoiceLinkModal_Title',
    defaultMessage: 'Ссылка для выставления счета',
  },
})

@cssModules(styles)
class InvoiceLinkModal extends React.Component<any, any> {
  constructor(props) {
    super(props)
    this.state = {
      isLinkCopied: false,
    }
  }

  handleCopyLink = () => {
    this.setState({
      isLinkCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isLinkCopied: false,
        })
      }, 500)
    })
  }

  render() {
    const { props: { name, intl, data: { currency, address, tokenKey } }, state: { isLinkCopied } } = this

    let type = (tokenKey) ? tokenKey.toLowerCase() : currency.toLowerCase()
    switch (currency) {
      case 'BTC (SMS-Protected)':
      case 'BTC (PIN-Protected)':
      case 'BTC (Multisig)':
        type = 'btc'
        break;
    }
    const invoiceLink = `${getFullOrigin()}${links.createInvoice}/${type}/${address}`

    return (
      <Modal name={name} title={intl.formatMessage(labels.Title)}>
        <div styleName="content">
          <p style={{ fontSize: 25 }}>
            <FormattedMessage id="InvoiceLinkModalInfo" defaultMessage="Это ссылка для выставления счета." />
          </p>
          <CopyToClipboard
            text={invoiceLink}
            onCopy={this.handleCopyLink}
          >
            <div>
              <p>
                {invoiceLink}
              </p>
              <Button
                styleName="button"
                brand
                onClick={() => {}}
                disabled={isLinkCopied}
                fullWidth
              >
                { isLinkCopied ?
                  <FormattedMessage id="InvoiceLinkCopied" defaultMessage="Link copied" />
                  :
                  <FormattedMessage id="InvoiceLinkCopy" defaultMessage="Copy this link" />
                }
              </Button>
            </div>
          </CopyToClipboard>
        </div>
      </Modal>
    )
  }
}

export default injectIntl(InvoiceLinkModal)
