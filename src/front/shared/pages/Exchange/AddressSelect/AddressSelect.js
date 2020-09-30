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

import iconHotwallet from 'components/Logo/images/base.svg'
import iconMetamask from './images/metamask.svg'
import iconCustom from './images/custom.svg'


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

const addressType = {
  none: `none`,
  hotwallet: `hotwallet`,
  metamask: `metamask`,
  custom: `custom`,
}

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
      initialValue,
      currency,
      hasError = false,
    } = props

    this.state = {
      currency,
      hasError,
      selectedType: addressType.none,
      walletAddress: initialValue,
      walletAddressFocused: false,
      customAddress: '',
      metamaskConnected: metamask.isConnected(),
      metamaskAddress: metamask.getAddress(),
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
      initialValue,
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
        selectedType: addressType.none,
        walletAddress: initialValue,
        customAddress: '',
      })
    }
  }

  handleBlurAddress() {
    this.setState({
      walletAddressFocused: false,
    })
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

  handleAddressSelect(option) {
    const selectedType = option.value

    if (selectedType === 'hotwalletcreate') {
      this.goToСreateWallet()
    }

    const { onChange } = this.props

    this.setState({
      selectedType,
    }, () => {
      if (typeof onChange !== 'function') {
        return
      }

      const selected = (selectedType !== addressType.none)
      const isCustom = ((selectedType === addressType.custom) || selectedType === addressType.metamask)

      let value = ''
      if (selectedType === addressType.metamask) {
        value = metamask.getAddress()
      }

      onChange({
        selected,
        isCustom,
        value,
      })
    })
  }

  render() {
    const customWalletValueLink = this.props.valueLink

    const {
      openScan,
      value: customWallet,
      currency,
      isDark,
      label,
      hiddenCoinsList,
      allData
    } = this.props

    const {
      selectedType,
      walletAddressFocused,
      metamaskConnected,
      metamaskAddress,
      hasError,
    } = this.state


    const ticker = currency.toUpperCase()

    let hotWalletAddress

    for (let i = 0; i < allData; i++) {
      const allDataItem = allData[i]
      if (ticker === allDataItem.currency && allDataItem.address) {
        hotWalletAddress = allDataItem.address
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


    const isMetamaskOption = ethToken.isEthOrEthToken({ name: currency })
    const isMetamaskInstalled = metamask.isEnabled()

    // Forbid `Custom address` option when using ethereum/tokens
    // because you need to make a request to the contract
    const isCustomAddressOption = !ethToken.isEthOrEthToken({ name: currency })


    const options = [
      {
        value: addressType.none,
        disabled: true,
        hidden: true,
        title: <FormattedMessage {...langLabels.labelSpecifyAddress} />,
      },
      ...(isCurrencyInUserWallet ? [{
          value: addressType.hotwallet,
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
            value: addressType.metamask,
            icon: iconMetamask,
            title: <FormattedMessage {...langLabels.optionMetamask} />,
          }] : [{
            value: addressType.none,
            icon: iconMetamask,
            disabled: true,
            title: <FormattedMessage {...langLabels.optionMetamaskNotInstalled} />,
          }] : []),
      ...(isCustomAddressOption ? [{
        value: addressType.custom,
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
          initialValue={addressType.none}
          selectedValue={selectedType}
          disableSearch={true}
          dontScroll={true}
          arrowSide="left"
          itemRender={item => <Option {...item} />}
          onSelect={(value) => this.handleAddressSelect(value)}
        />
        {selectedType === addressType.hotwallet &&
          <div styleName="selectedInner">
            <div styleName="readonlyValue">
              <input value={customWallet} onChange={() => { }} />
            </div>
          </div>
        }
        {selectedType === addressType.metamask && metamask.isEnabled() &&
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
        {selectedType === addressType.custom &&
          <div styleName="selectedInner">
            <div styleName={`customWallet ${(walletAddressFocused) ? 'customWallet_focus' : ''}`}>
              <div styleName="walletInput">
                <Input
                  inputCustomStyle={{ fontSize: "15px" }}
                  required
                  valueLink={customWalletValueLink}
                  pattern="0-9a-zA-Z"
                  onBlur={() => { this.handleBlurAddress() }}
                  onFocus={() => { this.handleFocusAddress() }}
                  placeholder="Enter address"
                />
              </div>
              <i styleName="qrCode" className="fas fa-qrcode" onClick={openScan} />
            </div>
          </div>
        }
      </div>
    )
  }
}
