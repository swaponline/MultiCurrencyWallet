import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'redaction'
import Link from 'sw-valuelink'

import styles from './AddressSelect.scss'
import cssModules from 'react-css-modules'
import config from 'helpers/externalConfig'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Input from 'components/forms/Input/Input';
import DropDown from 'components/ui/DropDown/DropDown'
import metamask from 'helpers/metamask'
import { Button } from 'components/controls'
import ethToken from 'helpers/ethToken'
import Option from './Option/Option'
import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import actions from 'redux/actions'

import QrReader from "components/QrReader"
import iconHotwallet from 'components/Logo/images/base.svg'
import iconMetamask from './images/metamask.svg'
import iconCustom from './images/custom.svg'


export const AddressType = {
  Hotwallet: 'Hotwallet', // or better 'systemWallet'?
  Metamask: 'Metamask',
  Custom: 'Custom',
}

export const AddressRole = {
  Send: 'Send',
  Receive: 'Receive',
}


const langLabels = defineMessages({
  labelSpecifyAddress: {
    id: 'Exchange_SpecifyAddress',
    defaultMessage: 'Select...',
  },
  optionHotWallet: {
    id: 'Exchange_HotWalletAddressOption',
    defaultMessage: 'My wallet',
  },
  optionHotWalletDisabled: {
    id: 'Exchange_HotWalletAddressOptionDisabled',
    defaultMessage: 'My wallet (not enough balance)',
  },
  optionHotWalletCreate: {
    id: 'Exchange_HotWalletCreate',
    defaultMessage: 'Create wallet',
  },
  optionMetamask: {
    id: 'Exchange_MetamaskAddressOption',
    defaultMessage: 'Metamask',
  },
  optionMetamaskNotInstalled: {
    id: 'Exchange_MetamaskNotInstalledOption',
    defaultMessage: 'Metamask (not installed)',
  },
  optionCustom: {
    id: 'Exchange_CustomAddressOption',
    defaultMessage: 'Custom address',
  },
  placeholderAddress: {
    id: 'Exchange_PlaceholderEnterAddress',
    defaultMessage: 'Enter the receiving wallet address',
  },
  connectMetamask: {
    id: 'Exchange_ConnectMetamask',
    defaultMessage: 'Connect',
  },
})

@connect(
  ({
    core: { hiddenCoinsList },
    user: {
      btcData,
      ethData,
      ghostData,
      nextData,
      tokensData
    }
  }) => {
    const allData = [
      btcData,
      ethData,
      ghostData,
      nextData,
      ...Object.keys(tokensData).map((k) => tokensData[k]),
    ].map(({ account, keyPair, ...data }) => ({
      ...data,
    }))

    return {
      allData,
      hiddenCoinsList,
    }
  }
)
@injectIntl
@withRouter
@cssModules(styles, { allowMultiple: true })
export default class AddressSelect extends Component {
  constructor(props) {
    super(props)

    const {
      currency,
      hasError = false,
    } = props

    this.state = {
      currency,
      hasError,
      selectedType: 'placeholder',
      walletAddressFocused: false,
      customAddress: '',
      metamaskConnected: metamask.isConnected(),
      metamaskAddress: metamask.getAddress(),
      isScanActive: false,
    }
  }

  getTicker() {
    return this.props.currency.toUpperCase()
  }

  getHotWalletAddress() {
    const { allData } =  this.props
    const ticker = this.getTicker()
    let hotWalletAddress
    for (let i = 0; i < allData.length; i++) {
      const item = allData[i]
      if (ticker === item.currency && item.address) {
        hotWalletAddress = item.address
        break
      }
    }
    return hotWalletAddress
  }

  isCurrencyInUserWallet() {
    const { hiddenCoinsList } = this.props
    const ticker = this.getTicker()
    const hotWalletAddress = this.getHotWalletAddress()

    let isCurrencyInUserWallet = true

    for (let i = 0; i < hiddenCoinsList.length; i++) {
      const hiddenCoin = hiddenCoinsList[i]
      if (
        hiddenCoin === ticker ||
        (hotWalletAddress && hiddenCoin.includes(`${ticker}:${hotWalletAddress}`))
      ) {
        isCurrencyInUserWallet = false
        break
      }
    }
    return isCurrencyInUserWallet
  }

  handleFocusAddress() {
    this.setState({
      walletAddressFocused: true,
    })
  }

  componentDidUpdate() {
    const {
      currency: newCurrency,
      hasError = false,
    } = this.props

    const {
      currency: oldCurrency,
      hasError: oldHasError = false,
    } = this.state

    if ((newCurrency !== oldCurrency) || (hasError !== oldHasError)) {
      this.setState({
        currency: newCurrency,
        hasError,
        selectedType: 'placeholder',
        customAddress: '',
      })
    }
  }

  handleBlurAddress(value) {
    this.setState({
      walletAddressFocused: false,
    })
    // todo: validate value
    /*
    if (getCurrency === "btc") {
      return util.typeforce.isCoinAddress.BTC(customWallet)
    }
    return util.typeforce.isCoinAddress.ETH(customWallet);
    */
    this.applyAddress({
      type: AddressType.Custom,
      value,
    })
  }

  goToСreateWallet() {
    const {
      history,
      intl: { locale },
    } = this.props
    const ticker = this.getTicker()
    history.push(localisedUrl(locale, `${links.createWallet}/${ticker}`))
  }

  handleConnectMetamask() {
    metamask.connect().then((isConnected) => {
      if (!isConnected) {
        return
      }

      this.setState({
        metamaskConnected: true,
        metamaskAddress: metamask.getAddress(),
      }, () => {
        this.applyAddress({
          type: AddressType.Metamask,
          value: metamask.getAddress(),
        })
      })
    })/*.catch((error) => {
      console.log('Metamask rejected', error)
    })*/
  }

  toggleScan = () => {
    const { isScanActive } = this.state
    this.setState(() => ({
      isScanActive: !isScanActive,
    }))
  }

  handleScanError(err) {
    console.error('Scan error', err)
  }

  handleScan(data) {
    if (data) {
      const address = data.includes(':') ? data.split(':')[1] : data
      this.toggleScan()
      this.applyAddress({
        type: AddressType.Custom,
        value: address,
      })
    }
  }

  handleOptionSelect(option) {
    const selectedType = option.value

    if (selectedType === 'hotwalletcreate') {
      this.goToСreateWallet()
    }

    this.setState({
      selectedType,
    }, () => {

      if (!selectedType) {
        return
      }

      let value

      if (selectedType === AddressType.Hotwallet) {
        value = this.getHotWalletAddress()
      }

      if (selectedType === AddressType.Metamask) {
        value = metamask.getAddress()
      }

      /*if (selectedType === AddressType.Custom) {
        // apply address input blur / qrScan
        return
      }*/

      this.applyAddress({
        type: selectedType,
        value,
      })

    })
  }

  applyAddress(address) {
    const { onChange } = this.props
    const { type, value } = address

    if (typeof onChange !== 'function') {
      return
    }

    onChange({
      type,
      value,
    })
  }

  render() {

    const {
      currency,
      isDark,
      label,
      hiddenCoinsList,
      allData,
      role,
    } = this.props

    const {
      selectedType,
      walletAddressFocused,
      metamaskConnected,
      metamaskAddress,
      isScanActive,
      hasError,
    } = this.state

    const ticker = this.getTicker()
    const { balance } = actions.core.getWallet({ currency })

    const isMetamaskOption = ethToken.isEthOrEthToken({ name: currency })
    const isMetamaskInstalled = metamask.isEnabled()

    // Forbid `Custom address` option when using ethereum/tokens
    // because you need to make a request to the contract
    const isCustomAddressOption = !ethToken.isEthOrEthToken({ name: currency })


    let isHotWalletOptionDisabled = false
    if (role === AddressRole.Send && (!balance || balance === 0)) {
      isHotWalletOptionDisabled = true
    }

    // todo: fix flow and remove...
    let isCustomOptionDisabled = false
    if (role === AddressRole.Send && ticker === 'BTC') {
      if (balance > 0) {
        isCustomOptionDisabled = true
      }
    }
    // ...this conditions ^

    const isCustomOptionInputHidden = role === AddressRole.Send && ticker === 'BTC' // todo: any utxo

    const options = [
      {
        value: 'placeholder',
        title: <FormattedMessage {...langLabels.labelSpecifyAddress} />,
        disabled: true,
        hidden: true,
      },
      ...(this.isCurrencyInUserWallet() ? [{
          value: AddressType.Hotwallet,
          icon: iconHotwallet,
          title: !isHotWalletOptionDisabled ?
            <FormattedMessage {...langLabels.optionHotWallet} />
            :
            <FormattedMessage {...langLabels.optionHotWalletDisabled} />,
          disabled: isHotWalletOptionDisabled,
        }] : [{
          value: 'hotwalletcreate',
          icon: iconHotwallet,
          title: <FormattedMessage {...langLabels.optionHotWalletCreate} />,
        }]
      ),
      ...((isMetamaskOption) ?
          isMetamaskInstalled ? [{
            value: AddressType.Metamask,
            icon: iconMetamask,
            title: <FormattedMessage {...langLabels.optionMetamask} />,
          }] : [{
            value: 'disabled',
            icon: iconMetamask,
            title: <FormattedMessage {...langLabels.optionMetamaskNotInstalled} />,
            disabled: true,
          }] : []),
      ...(isCustomAddressOption ? [{
        value: AddressType.Custom,
        icon: iconCustom,
        title: <FormattedMessage {...langLabels.optionCustom} />,
        disabled: isCustomOptionDisabled
      }] : []),
    ]

    return (
      <div styleName={`addressSelect ${(hasError) ? 'addressSelect_error' : ''} ${isDark ? '--dark' : ''}`}>
        <div styleName="label">{label}</div>
        <DropDown
          styleName="dropDown"
          items={options}
          initialValue="placeholder"
          selectedValue={selectedType}
          disableSearch={true}
          dontScroll={true}
          arrowSide="left"
          itemRender={item => <Option {...item} />}
          onSelect={(value) => this.handleOptionSelect(value)}
        />
        {selectedType === AddressType.Hotwallet &&
          <div styleName="selectedInner">
            <div styleName="readonlyValue">
              <input value={this.getHotWalletAddress()} onChange={() => { }} />
            </div>
          </div>
        }
        {selectedType === AddressType.Metamask && metamask.isEnabled() &&
          <div styleName="selectedInner">
            {(metamaskConnected) ? (
              <div styleName="readonlyValue">
                <input value={metamaskAddress} onChange={() => { }} />
              </div>
            ) : (
              <div styleName="buttonContainer">
                <Button
                  styleName="button"
                  blue
                  onClick={() => { this.handleConnectMetamask() }}
                >
                  <FormattedMessage {...langLabels.connectMetamask} />
                </Button>
              </div>
            )}
          </div>
        }
        {selectedType === AddressType.Custom && !isCustomOptionInputHidden &&
          <div styleName="selectedInner">
            <div styleName={`customWallet ${(walletAddressFocused) ? 'customWallet_focus' : ''}`}>
              <div styleName="customAddressInput">
                <Input
                  inputCustomStyle={{
                    fontSize: '15px',
                    textOverflow: "ellipsis",
                  }}
                  required
                  pattern="0-9a-zA-Z"
                  onFocus={() => this.handleFocusAddress()}
                  onBlur={(e) => this.handleBlurAddress(e.target.value)}
                  placeholder="Enter address"
                  valueLink={Link.all(this, '_')._} // required
                />
              </div>
              <i styleName="qrCode" className="fas fa-qrcode" onClick={this.toggleScan} />
            </div>
          </div>
        }
        {isScanActive && (
          <QrReader
            openScan={this.openScan}
            handleError={this.handleScanError}
            handleScan={this.handleScan}
          />
        )}
      </div>
    )
  }
}
