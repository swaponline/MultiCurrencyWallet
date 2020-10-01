import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'redaction'
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

import QrReader from "components/QrReader"
import iconHotwallet from 'components/Logo/images/base.svg'
import iconMetamask from './images/metamask.svg'
import iconCustom from './images/custom.svg'


export const AddressType = {
  Hotwallet: 'Hotwallet',
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
      allData,
      hiddenCoinsList
    } = props


    const ticker = currency.toUpperCase()

    let hotWalletAddress

    for (let i = 0; i < allData.length; i++) {
      const item = allData[i]
      if (ticker === item.currency && item.address) {
        hotWalletAddress = item.address
        break
      }
    }

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


    this.state = {
      currency,
      ticker,
      hotWalletAddress,
      isCurrencyInUserWallet,
      hasError,
      selectedType: null,
      walletAddressFocused: false,
      customAddress: '',
      metamaskConnected: metamask.isConnected(),
      metamaskAddress: metamask.getAddress(),
      isScanActive: false,
    }
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
        selectedType: null,
        customAddress: '',
      })
    }
  }

  handleBlurAddress(value) {
    this.setState({
      walletAddressFocused: false,
    })
    console.log('val =', value)
  }

  goToСreateWallet() {
    const {
      history,
      intl: { locale },
    } = this.props

    history.push(localisedUrl(locale, links.createWallet))
  }

  handleConnectMetamask() {
    metamask.connect().then((address) => {
      const { onChange } = this.props

      this.setState({
        metamaskConnected: true,
        metamaskAddress: metamask.getAddress(),
      }, () => {
        if (typeof onChange === 'function') {
          onChange({
            selected: true,
            isCustom: true,
            value: metamask.getAddress(),
          })
        }
      })

    }).catch((error) => {
      console.log('Metamask rejected', error)
    })
  }

  toggleScan = () => {
    const { isScanActive } = this.state
    this.setState(() => ({
      isScanActive: !isScanActive,
    }))
  }

  handleCustomAddressInputBlur() {

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

      let value = ''

      if (selectedType === AddressType.Hotwallet) {
        value = this.state.hotWalletAddress
      }

      if (selectedType === AddressType.Metamask) {
        value = metamask.getAddress()
      }

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
    const customWalletValueLink = this.props.valueLink

    const {
      currency,
      isDark,
      label,
      hiddenCoinsList,
      allData
    } = this.props

    const {
      ticker,
      hotWalletAddress,
      isCurrencyInUserWallet,
      selectedType,
      walletAddressFocused,
      metamaskConnected,
      metamaskAddress,
      isScanActive,
      hasError,
    } = this.state


    const isMetamaskOption = ethToken.isEthOrEthToken({ name: currency })
    const isMetamaskInstalled = metamask.isEnabled()

    // Forbid `Custom address` option when using ethereum/tokens
    // because you need to make a request to the contract
    const isCustomAddressOption = !ethToken.isEthOrEthToken({ name: currency })


    const options = [
      {
        value: 'placeholder',
        disabled: true,
        hidden: true,
        title: <FormattedMessage {...langLabels.labelSpecifyAddress} />,
      },
      ...(isCurrencyInUserWallet ? [{
          value: AddressType.Hotwallet,
          icon: iconHotwallet,
          title: <FormattedMessage {...langLabels.optionHotWallet} />,
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
            disabled: true,
            title: <FormattedMessage {...langLabels.optionMetamaskNotInstalled} />,
          }] : []),
      ...(isCustomAddressOption ? [{
        value: AddressType.Custom,
        icon: iconCustom,
        title: <FormattedMessage {...langLabels.optionCustom} />,
      }] : []),
    ]

    return (
      <div styleName={`addressSelect ${(hasError) ? 'addressSelect_error' : ''} ${isDark ? '--dark' : ''}`}>
        <div styleName="label">{label}</div>
        <DropDown
          styleName="dropDown"
          items={options}
          initialValue="placeholder"
          selectedValue="placeholder"
          disableSearch={true}
          dontScroll={true}
          arrowSide="left"
          itemRender={item => <Option {...item} />}
          onSelect={(value) => this.handleOptionSelect(value)}
        />
        {selectedType === AddressType.Hotwallet &&
          <div styleName="selectedInner">
            <div styleName="readonlyValue">
              <input value={hotWalletAddress} onChange={() => { }} />
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
        {selectedType === AddressType.Custom &&
          <div styleName="selectedInner">
            <div styleName={`customWallet ${(walletAddressFocused) ? 'customWallet_focus' : ''}`}>
              <div styleName="walletInput">
                <Input
                  inputCustomStyle={{ fontSize: "15px" }}
                  required
                  valueLink={customWalletValueLink}
                  pattern="0-9a-zA-Z"
                  onFocus={() => this.handleFocusAddress()}
                  onBlur={(e) => this.handleBlurAddress(e.target.value)}
                  placeholder="Enter address"
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
