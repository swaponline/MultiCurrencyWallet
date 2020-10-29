import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'redaction'
import Link from 'sw-valuelink'

import styles from './AddressSelect.scss'
import cssModules from 'react-css-modules'
import config from 'helpers/externalConfig'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Input from 'components/forms/Input/Input';
import DropDown from 'components/ui/DropDown/DropDown'
import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'
import metamask from 'helpers/metamask'
import { Button } from 'components/controls'
import ethToken from 'helpers/ethToken'
import Option from './Option/Option'
import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import actions from 'redux/actions'
import feedback from 'shared/helpers/feedback'

import QrReader from "components/QrReader"
import iconInternal from 'components/Logo/images/base.svg'
import iconMetamask from './images/metamask.svg'
import iconCustom from './images/custom.svg'

import { AddressType, AddressRole } from 'domain/address'


const langLabels = defineMessages({
  labelSpecifyAddress: {
    id: 'Exchange_SpecifyAddress',
    defaultMessage: 'Select...',
  },
  optionInternal: {
    id: 'Exchange_InternalAddressOption',
    defaultMessage: 'My wallet',
  },
  optionInternalDisabled: {
    id: 'Exchange_InternalAddressOptionDisabled',
    defaultMessage: 'My wallet (not enough balance)',
  },
  optionInternalCreate: {
    id: 'Exchange_InternalCreate',
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
    defaultMessage: 'External wallet or exchange',
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

@injectIntl
@withRouter
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
      isMetamaskConnected: metamask.isConnected(),
      metamaskAddress: metamask.getAddress(),
      isScanActive: false,
    }
  }

  getTicker() {
    return this.props.currency.toUpperCase()
  }

  getInternalAddress() {
    const { allData } =  this.props
    const ticker = this.getTicker()
    let internalAddress
    for (let i = 0; i < allData.length; i++) {
      const item = allData[i]
      if (ticker === item.currency && item.address) {
        internalAddress = item.address
        break
      }
    }
    return internalAddress
  }

  isCurrencyInInternalWallet() {
    const { hiddenCoinsList } = this.props
    const ticker = this.getTicker()
    const internalAddress = this.getInternalAddress()

    let result = true

    for (let i = 0; i < hiddenCoinsList.length; i++) {
      const hiddenCoin = hiddenCoinsList[i]
      if (
        hiddenCoin === ticker ||
        (internalAddress && hiddenCoin.includes(`${ticker}:${internalAddress}`))
      ) {
        result = false
        break
      }
    }
    return result
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

  goСreateWallet() {
    const {
      history,
      intl: { locale },
    } = this.props
    const ticker = this.getTicker()

    feedback.exchangeForm.redirectedCreateWallet(ticker)

    const url = localisedUrl(locale, `${links.createWallet}/${ticker}`)
    history.push(url)
  }

  handleConnectMetamask() {
    metamask.connect().then((isConnected) => {
      if (!isConnected) {
        return
      }

      this.setState({
        isMetamaskConnected: true,
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

    if (selectedType === 'InternalAddressCreate') {
      this.goСreateWallet()
      return
    }

    this.setState({
      selectedType,
    }, () => {

      if (!selectedType) {
        return
      }

      let value

      if (selectedType === AddressType.Internal) {
        value = this.getInternalAddress()
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
    const { onChange, currency } = this.props
    const { type, value } = address

    if (typeof onChange !== 'function') {
      return
    }

    onChange({
      currency,
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
      isMetamaskConnected,
      metamaskAddress,
      isScanActive,
      hasError,
    } = this.state

    const ticker = this.getTicker()

    const { internalBalance } = actions.core.getWallet({
      currency,
      addressType: AddressType.Internal
    })
    const isInternalOptionDisabled = role === AddressRole.Send && (!internalBalance || internalBalance === 0)

    const isMetamaskOption = ethToken.isEthOrEthToken({ name: currency })
    const isMetamaskInstalled = metamask.isEnabled()

    // Forbid `Custom address` option when using ethereum/tokens
    // because you need to make a request to the contract
    const isCustomAddressOption = !ethToken.isEthOrEthToken({ name: currency })
    const isCustomOptionInputHidden = role === AddressRole.Send && ticker === 'BTC' // todo: any utxo


    const options = [
      {
        value: 'placeholder',
        title: <FormattedMessage {...langLabels.labelSpecifyAddress} />,
        disabled: true,
        hidden: true,
      },
      ...(this.isCurrencyInInternalWallet() ? [{
          value: AddressType.Internal,
          icon: iconInternal,
          title: !isInternalOptionDisabled ?
            <Fragment>
              <FormattedMessage {...langLabels.optionInternal} />
              <Address
                address={this.getInternalAddress()}
                format={AddressFormat.Short}
                type={AddressType.Internal}
              />
            </Fragment>
            :
            <FormattedMessage {...langLabels.optionInternalDisabled} />,
          disabled: isInternalOptionDisabled,
        }] : [{
          value: 'InternalAddressCreate',
          icon: iconInternal,
          title: <FormattedMessage {...langLabels.optionInternalCreate} />,
        }]
      ),
      ...(isMetamaskOption ?
        isMetamaskInstalled ?
          isMetamaskConnected ?
            [{
              value: AddressType.Metamask,
              icon: iconMetamask,
              title: <Fragment>
                <FormattedMessage {...langLabels.optionMetamask} />
                <Address
                  address={metamaskAddress}
                  format={AddressFormat.Short}
                  type={AddressType.Metamask}
                />
              </Fragment>
            }]
            :
            [{
              value: AddressType.Metamask,
              icon: iconMetamask,
              title: <FormattedMessage {...langLabels.optionMetamask} />,
            }]
          :
          [{
            value: 'disabled',
            icon: iconMetamask,
            title: <FormattedMessage {...langLabels.optionMetamaskNotInstalled} />,
            disabled: true,
          }]
        :
        []
      ),
      ...(isCustomAddressOption ? [{
        value: AddressType.Custom,
        icon: iconCustom,
        title: <FormattedMessage {...langLabels.optionCustom} />,
        reduceSelectedItemText: !isCustomOptionInputHidden,
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
        {selectedType === AddressType.Metamask && metamask.isEnabled() && !isMetamaskConnected &&
          <div styleName="selectedInner">
            <div styleName="buttonContainer">
              <Button
                styleName="button"
                blue
                onClick={() => { this.handleConnectMetamask() }}
              >
                <FormattedMessage {...langLabels.connectMetamask} />
              </Button>
            </div>
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
