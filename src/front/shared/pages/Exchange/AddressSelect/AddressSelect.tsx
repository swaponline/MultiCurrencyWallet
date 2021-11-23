import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import Link from 'local_modules/sw-valuelink'

import styles from './AddressSelect.scss'
import cssModules from 'react-css-modules'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Input from 'components/forms/Input/Input'
import DropDown from 'components/ui/DropDown'
import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'
import metamask from 'helpers/metamask'
import { Button } from 'components/controls'
import erc20Like from 'common/erc20Like'
import Option from './Option/Option'
import { links } from 'helpers'
import { isAllowedCurrency } from 'helpers/user'
import actions from 'redux/actions'
import feedback from 'shared/helpers/feedback'
import web3Icons from 'shared/images'
import { isMobile } from 'react-device-detect'
import QrReader from 'components/QrReader'
import iconInternal from 'images/logo/logo-black.svg'
import iconCustom from 'images/custom.svg'

import getCoinInfo from 'common/coins/getCoinInfo'
import config from 'helpers/externalConfig'


import { AddressType, AddressRole } from 'domain/address'
import { COIN_DATA, COIN_MODEL } from 'swap.app/constants/COINS'

const disableInternalWallet = (config?.opts?.ui?.disableInternalWallet) ? true : false
const langLabels = defineMessages({
  labelSpecifyAddress: {
    id: 'Exchange_SpecifyAddress',
    defaultMessage: 'Select...',
  },
  optionInternal: {
    id: 'Exchange_InternalAddressOption',
    defaultMessage: 'Internal',
  },
  optionInternalDisabled: {
    id: 'Exchange_InternalAddressOptionDisabled',
    defaultMessage: 'Internal (insufficient balance)',
  },
  optionInternalCreate: {
    id: 'Exchange_InternalCreate',
    defaultMessage: 'Create wallet',
  },
  optionConnect: {
    id: 'Exchange_ConnectAddressOption',
    defaultMessage: 'Connect Wallet',
  },
  optionCustom: {
    id: 'Exchange_CustomAddressOption',
    defaultMessage: 'External wallet',
  },
  placeholderAddress: {
    id: 'Exchange_PlaceholderEnterAddress',
    defaultMessage: 'Enter the receiving wallet address',
  },
  connectMetamask: {
    id: 'CommonTextConnect',
    defaultMessage: 'Connect',
  },
})

type AddressSelectProps = {
  role: string
  currency: string
  selectedType?: string
  placeholder?: string
  balance?: number
  hasError?: boolean
  onChange: ({}) => void
  history: IUniversalObj
  intl: IUniversalObj
  label: IUniversalObj
}

type DropDownOptions = {
  value: string
  disabled?: boolean
  reduceSelectedItemText?: boolean
  dontSelect?: boolean
  hidden?: boolean
  title: JSX.Element
  icon?: SVGElement
}

type AddressSelectState = {
  address: string
  currency: string
  selectedType: string
  metamaskAddress: string
  walletAddressFocused: boolean
  isMetamaskConnected: boolean
  isScanActive: boolean
  hasError: boolean
  dropDownOptions: Array<DropDownOptions>
}



@withRouter
@cssModules(styles, { allowMultiple: true })
class AddressSelect extends Component<AddressSelectProps, AddressSelectState> {
  constructor(props) {
    super(props)

    const { currency, hasError = false, selectedType = false } = props

    this.state = {
      currency,
      hasError,
      address: '',
      selectedType: selectedType || 'Internal',
      walletAddressFocused: false,
      isMetamaskConnected: metamask.isConnected(),
      metamaskAddress: metamask.getAddress()|| '',
      isScanActive: false,
      dropDownOptions: [],
    }
  }

  getTicker = () => {
    return this.props.currency.toUpperCase()
  }

  getInternalAddress = () => {
    const { currency } = this.props
    const currentWallet = actions.core.getWallet({
      currency,
      addressType: AddressType.Internal,
    })

    return currentWallet ? currentWallet.address : false
  }

  isCurrencyInInternalWallet = () => {
    const ticker = this.getTicker()
    const internalAddress = this.getInternalAddress()

    return !internalAddress
      ? false
      : isAllowedCurrency(ticker, internalAddress)
  }

  handleFocusAddress = () => {
    this.setState({
      walletAddressFocused: true,
    })
  }

  onWeb3Updated = () => {
    this.setState({
      isMetamaskConnected: metamask.isConnected(),
      metamaskAddress: metamask.getAddress() || '',
    })
  }

  componentDidMount() {
    metamask.web3connect.on('updated', this.onWeb3Updated)
    this.prepareDropDownOptions()
  }

  componentWillUnmount() {
    metamask.web3connect.off('updated', this.onWeb3Updated)
  }

  componentDidUpdate(prevProps) {
    const { currency: newCurrency, selectedType, hasError = false, balance } = this.props

    const {balance: oldBalance} = prevProps

    const {
      currency: oldCurrency,
      hasError: oldHasError = false,
    } = this.state

    if(!isNaN(Number(oldBalance)) && !isNaN(Number(balance)) && oldBalance !== balance){
      this.prepareDropDownOptions(selectedType)
    }

    if (newCurrency !== oldCurrency || hasError !== oldHasError) {
      this.setState({
        currency: newCurrency,
        hasError,
      }, () => {
        this.prepareDropDownOptions(selectedType)
      })
    }
  }

  handleBlurAddress = () => {
    this.setState({
      walletAddressFocused: false,
    })

    this.applyAddress({
      type: AddressType.Custom,
      value: this.state.address,
    })
  }

  goСreateWallet = () => {
    const {
      history,
    } = this.props
    const ticker = this.getTicker()

    feedback.exchangeForm.redirectedCreateWallet(ticker)

    history.push(`${links.createWallet}/${ticker}`)
  }

  handleConnectMetamask = () => {
    metamask
      .connect({
        dontRedirect: true,
      })
      .then((isConnected) => {
        if (!isConnected) {
          return
        }

        this.setState(
          {
            isMetamaskConnected: true,
            metamaskAddress: metamask.getAddress() || '',
          },
          () => {
            this.applyAddress({
              type: AddressType.Metamask,
              value: metamask.getAddress(),
            })
          }
        )
      }).catch((error) => {
        console.error('Metamask rejected', error)
      })
  }

  toggleScan = () => {
    const { isScanActive } = this.state
    this.setState(() => ({
      isScanActive: !isScanActive,
    }))
  }

  handleScanError = (err) => {
    console.error('Scan error', err)
  }

  handleScan = (data) => {
    if (data) {
      const address = data.includes(':') ? data.split(':')[1] : data
      this.toggleScan()
      this.applyAddress({
        type: AddressType.Custom,
        value: address,
      })
    }
  }

  handleOptionSelect = (option) => {
    const { selectedType: oldSelectedType } = this.state

    const { value: selectedType, dontSelect } = option

    if (selectedType === 'InternalAddressCreate') {
      this.goСreateWallet()
      return
    }

    this.setState(
      {
        selectedType: dontSelect ? oldSelectedType : selectedType,
      },
      () => {
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

        if (selectedType === AddressType.Metamask && !metamask.isConnected()) {
          this.handleConnectMetamask()
        } else {
          this.applyAddress({
            type: selectedType,
            value,
          })
        }
      }
    )
  }

  applyAddress = (addressObj) => {
    const { onChange, currency } = this.props
    const { type, value } = addressObj

    if (typeof onChange !== 'function') {
      return
    }

    onChange({
      currency,
      type,
      value,
    })
  }

  prepareDropDownOptions = (newSelectedType?) => {
    const {
      currency,
      balance,
      role,
    } = this.props

    const {
      selectedType: oldSelectedType,
      isMetamaskConnected,
      metamaskAddress,
    } = this.state

    let selectedType = (newSelectedType && oldSelectedType !== newSelectedType)
      ? newSelectedType
      : oldSelectedType

    const ticker = this.getTicker()

    let { balance: internalBalance } = actions.core.getWallet({
      currency,
      addressType: AddressType.Internal,
    })

    if (
      (selectedType === AddressType.Internal
      || (selectedType === AddressType.Metamask && !metamask.isConnected()))
      && !!balance) {
      internalBalance = balance
    }

    const isInternalOptionDisabled =
      role === AddressRole.Send && (!internalBalance || internalBalance === 0)

    const isMetamaskOption = erc20Like.isToken({ name: currency }) || ['ETH', 'BNB', 'MATIC'].includes(ticker) // ToDo: replace at constant

    // Forbid `Custom address` option when using ethereum/tokens
    // because you need to make a request to the contract
    const isCustomAddressOption = !erc20Like.isToken({ name: currency })
      && !['ETH', 'BNB', 'MATIC'].includes(ticker) // ToDo: replace at constant

    const isUTXOModel = COIN_DATA[ticker] && COIN_DATA[ticker].model === COIN_MODEL.UTXO
    const isCustomOptionInputHidden = role === AddressRole.Send && isUTXOModel

    const web3Icon = metamask.isConnected()
      ? web3Icons[metamask.web3connect.getProviderType()] || false
      : web3Icons[metamask.web3connect.getInjectedType()] || false

    const dropDownOptions: DropDownOptions[] = []

    const isCurrencyInInternalWallet = this.isCurrencyInInternalWallet()

    if (!disableInternalWallet) {
      if (isCurrencyInInternalWallet) {
        dropDownOptions.push(
          {
            value: AddressType.Internal,
            icon: iconInternal,
            title: !isInternalOptionDisabled ? (
              <Fragment>
                <FormattedMessage {...langLabels.optionInternal} />
                <Address
                  address={this.getInternalAddress()}
                  format={AddressFormat.Short}
                  type={AddressType.Internal}
                />
              </Fragment>
            ) : (
              <FormattedMessage {...langLabels.optionInternalDisabled} />
            ),
            disabled: isInternalOptionDisabled,
          },
        )
      } else if (isUTXOModel || !isMetamaskConnected) {
        dropDownOptions.push(
          {
            value: 'InternalAddressCreate',
            icon: iconInternal,
            title: <FormattedMessage {...langLabels.optionInternalCreate} />,
          },
        )
      }
    }

    if (isMetamaskOption) {
      if (isMetamaskConnected) {
        dropDownOptions.push(
          {
            value: AddressType.Metamask,
            icon: web3Icon,
            title: (
              <Fragment>
                {metamask.web3connect.getProviderTitle()}
                <Address
                  address={metamaskAddress}
                  format={AddressFormat.Short}
                  type={AddressType.Metamask}
                />
              </Fragment>
            ),
          },
        )
      } else {
        dropDownOptions.push(
          {
            value: AddressType.Metamask,
            icon: web3Icon,
            title: <FormattedMessage {...langLabels.optionConnect} />,
            dontSelect: true,
          },
        )
      }
    }

    if ((role === AddressRole.Receive || !isCurrencyInInternalWallet) && isCustomAddressOption) {
      dropDownOptions.push(
        {
          value: AddressType.Custom,
          icon: iconCustom,
          title: <FormattedMessage {...langLabels.optionCustom} />,
          reduceSelectedItemText: !isCustomOptionInputHidden,
        },
      )
    }

    const hasSelectedType = dropDownOptions.filter(({ value }) => value === selectedType)
    if (!hasSelectedType.length && dropDownOptions.length) selectedType = dropDownOptions[0].value

    this.setState({
      dropDownOptions,
      selectedType,
    })
  }

  render() {
    const {
      label,
      role,
      placeholder = 'Enter address',
    } = this.props

    const {
      selectedType,
      walletAddressFocused,
      isMetamaskConnected,
      isScanActive,
      hasError,
      dropDownOptions,
    } = this.state

    const ticker = this.getTicker()

    const isUTXOModel = COIN_DATA[ticker] && COIN_DATA[ticker].model === COIN_MODEL.UTXO
    const isCustomOptionInputHidden = role === AddressRole.Send && isUTXOModel


    // =======================================================

    const valueLink = Link.all(this, 'address')
    const customInputStyles = {
      fontSize: '15px',
      textOverflow: 'ellipsis',
    }

    return (
      <div styleName={`addressSelect ${hasError ? 'addressSelect_error' : ''}`}>
        <div styleName="label">{label}</div>
        <DropDown
          styleName="dropDown"
          items={dropDownOptions}
          selectedValue={selectedType}
          disableSearch={true}
          dontScroll={true}
          arrowSide="left"
          role={role}
          itemRender={(item) => <Option {...item} />}
          onSelect={this.handleOptionSelect}
        />
        {selectedType === AddressType.Metamask && metamask.isEnabled() && !isMetamaskConnected && (
          <div styleName="selectedInner connectWrapper">
            <Button
              blue
              styleName="button"
              onClick={this.handleConnectMetamask}
            >
              <FormattedMessage {...langLabels.connectMetamask} />
            </Button>
          </div>
        )}
        {!isCustomOptionInputHidden && selectedType === AddressType.Custom && (
          <div styleName="selectedInner">
            <div styleName={`customWallet ${walletAddressFocused ? 'customWallet_focus' : ''}`}>
              <div styleName="customAddressInput">
                <Input
                  inputCustomStyle={customInputStyles}
                  pattern="0-9a-zA-Z"
                  onFocus={this.handleFocusAddress}
                  onBlur={this.handleBlurAddress}
                  placeholder={placeholder}
                  valueLink={valueLink.address}
                  openScan={this.toggleScan}
                  qr={isMobile}
                  required
                />
              </div>
            </div>
          </div>
        )}
        {isScanActive && (
          <QrReader
            openScan={this.toggleScan}
            handleError={this.handleScanError}
            handleScan={this.handleScan}
          />
        )}
      </div>
    )
  }
}

export default injectIntl(AddressSelect)
