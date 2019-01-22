import React, { Component, Fragment } from 'react'

import styles from './FeeNotify.scss'
import cssModules from 'react-css-modules'

import { connect } from 'redaction'
import actions from 'redux/actions'
import helpers from 'helpers'
import constants from 'constants'

import CopyToClipboard from 'react-copy-to-clipboard'
import { FormattedMessage } from 'react-intl'

import Button from 'components/controls/Button/Button'


@connect(({
  user: { ethData, btcData, /* bchData, */ tokensData, eosData, telosData, nimData, usdtData, ltcData },
}) => ({
  items: [ ethData, btcData, eosData, telosData, /* bchData, */ ltcData, usdtData /* nimData */ ],
  tokenItems: [ ...Object.keys(tokensData).map(k => (tokensData[k])) ],
}))

@cssModules(styles)
export default class FeeNotify extends Component {

  static getDerivedStateFromProps({ items, tokenItems }) {
    const ethData = items.filter(item => item.currency === 'ETH')


    // const currencyData = items.concat(tokenItems).filter(item => item.currency === swap.sellCurrency.toUpperCase())[0]

    // console.log(items)

    // return {
    //   ethAddress: ethData[0].address,
    // }
  }

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
                defaultMessage="Not enough ETH on your balance for miner fee.{br}Deposit 0.001 ETH to your account  {br}  {br} {address}"
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
