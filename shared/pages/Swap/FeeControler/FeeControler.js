import React, { Component, Fragment } from 'react'

import styles from './FeeControler.scss'
import cssModules from 'react-css-modules'

import CopyToClipboard from 'react-copy-to-clipboard'
import { FormattedMessage } from 'react-intl'

import Button from 'components/controls/Button/Button'


@cssModules(styles)
export default class FeeControler extends Component {

  state = {
    isAddressCopied: false,
  }

  handleCopy = () => {
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
    const { ethAddress } = this.props
    const { isAddressCopied } = this.state

    return (
      <div>
        <CopyToClipboard text={ethAddress} data-tut="reactour__address">
          <div styleName="main">
            <h3>
              <FormattedMessage
                id="FeeControler34"
                defaultMessage="Not enough ETH on your balance for miner fee.{br}Deposit 0.002 ETH to your account  {br}  {br} {address}"
                values={{ br: <br /> }}
              />
            </h3>
            <p styleName="address">
              {ethAddress}
            </p>
            <Button brand styleName="button" onClick={this.handleCopy}>
              {isAddressCopied
                ? <FormattedMessage id="FeeControler48" defaultMessage="Copied" />
                : <FormattedMessage id="FeeControler49" defaultMessage="Copy" />
              }
            </Button>
          </div>
        </CopyToClipboard>
      </div>
    )
  }
}
