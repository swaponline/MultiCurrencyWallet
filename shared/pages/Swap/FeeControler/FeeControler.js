import React, { Component, Fragment } from 'react'

import styles from './FeeControler.scss'
import cssModules from 'react-css-modules'

import CopyToClipboard from 'react-copy-to-clipboard'
import { FormattedMessage } from 'react-intl'


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
      <Fragment>
      <img src={icon} />
        <CopyToClipboard text={ethAddress} data-tut="reactour__address">
          <h3 styleName="main" onClick={this.handleCopy}>
            <FormattedMessage
              id="FeeControler34"
              defaultMessage="Not enough ETH on your balance for miner fee.{br}Deposit 0.001 ETH to your account  {br} {address}"
              values={{ address: `${ethAddress}`, br: <br /> }}
            />
          </h3>
        </CopyToClipboard>
      {isAddressCopied &&
        (<p>
          <FormattedMessage id="FeeControler42" defaultMessage="Address copied to clipboard" />
        </p>)
      }
      </Fragment>
    )
  }
}
