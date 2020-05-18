import React from 'react'
import { withRouter } from 'react-router'
import CopyToClipboard from 'react-copy-to-clipboard'

import cssModules from 'react-css-modules'
import styles from './ReceiveModal.scss'

import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { links } from 'helpers'

import config from 'helpers/externalConfig'


const title = defineMessages({
  Receive: {
    id: 'Receive',
    defaultMessage: 'Receive',
  },
})

@injectIntl
@withRouter
@cssModules(styles, { allowMultiple: true })
export default class ReceiveModal extends React.Component {

  constructor(props) {
    super(props)
    const {
      data: {
        address,
        currency,
      },
    } = props

    let howToDeposit = ''
    if (config
      && config.erc20
      && config.erc20[currency.toLowerCase()]
      && config.erc20[currency.toLowerCase()].howToDeposit
    ) howToDeposit = config.erc20[currency.toLowerCase()].howToDeposit

    howToDeposit = howToDeposit.replace(/{userAddress}/g, address);

    props.history.push(`/${currency}/${address}/receive`)

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

  handleClose = () => {
    const { name, history: { location: { pathname }, goBack } } = this.props

    if (pathname.includes('receive')) {
      goBack()
    }
    actions.modals.close(name)
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

    console.log(this.props)
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

              <div styleName="sendBtnsWrapper">
                <div styleName="actionBtn">
                  <Button
                    brand
                    onClick={() => { }}
                    disabled={isAddressCopied}
                    fill
                  >
                    {isAddressCopied ?
                      <FormattedMessage id="recieved65" defaultMessage="Address copied to clipboard" />
                      :
                      <FormattedMessage id="recieved67" defaultMessage="Copy to clipboard" />
                    }
                  </Button>
                </div>
                <div styleName="actionBtn">
                  <Button big fill gray onClick={this.handleClose}>
                    <FormattedMessage id="WithdrawModalCancelBtn" defaultMessage="Cancel" />
                  </Button>
                </div>
              </div>
            </div>
          </CopyToClipboard>
          {currency.includes("BTC") && <div styleName="fiatDepositRow">
            <Link to={`${links.creditCardDeposit}/${address}`} >
              <FormattedMessage
                id="buyByCreditCard"
                defaultMessage="buy using credit card"
              />
            </Link>
          </div>}
        </div>
      </Modal>
    )
  }
}
