import React, { Component, Fragment } from 'react'

import styles from './FeeControler.scss'
import cssModules from 'react-css-modules'

import CopyToClipboard from 'react-copy-to-clipboard'
import { FormattedMessage } from 'react-intl'

import Button from 'components/controls/Button/Button'

@cssModules(styles, { allowMultiple: true })
export default class FeeControler extends Component<any, any> {

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
    const { ethAddress, gasAmountNeeded } = this.props
    const { isAddressCopied } = this.state

    return (
      <div styleName="FeeController">
        <CopyToClipboard text={ethAddress}>
          <div>
            <div styleName="warning">
              <i className="fas fa-exclamation-triangle" />
            </div>
            <Fragment>
              <h3 styleName="feeHeading">
                <FormattedMessage
                  id="FeeControler68"
                  defaultMessage="Not enough ETH on your balance for miner fee.{br}{br}Deposit {gasAmountNeeded} ETH to your account"
                  values={{
                    br: <br />,
                    gasAmountNeeded: <strong>{gasAmountNeeded * 5}</strong>, // 1 for approving, 4 for creating swap
                  }}
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
            </Fragment>
          </div>
        </CopyToClipboard>
      </div>
    )
  }
}
