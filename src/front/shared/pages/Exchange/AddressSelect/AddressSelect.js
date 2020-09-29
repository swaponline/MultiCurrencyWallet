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
  optionMetamast: {
    id: 'Exchange_MetamaskAddressOption',
    defaultMessage: 'Metamask',
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

const destinationType = {
  none: `none`,
  hotwalletcreate: `hotwalletcreate`,
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
      selectedDestination: destinationType.none,
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
        selectedDestination: destinationType.none,
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

  handleDestinationSelect(item) {
    const { onChange } = this.props
    const {
      value: selectedDestination,
    } = item

    if (selectedDestination === 'hotwalletcreate') {
      this.goToСreateWallet()
    }

    this.setState({
      selectedDestination,
    }, () => {
      if (typeof onChange === 'function') {
        const selected = (selectedDestination !== destinationType.none)
        const isCustom = ((selectedDestination === destinationType.custom) || selectedDestination === destinationType.metamask)

        let value = ''
        if (selectedDestination === destinationType.metamask) {
          value = metamask.getAddress()
        }

        onChange({
          selected,
          isCustom,
          value,
        })
      }
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
      hiddenCoinsList
    } = this.props

    let {
      selectedDestination,
    } = this.state

    const {
      walletAddressFocused,
      metamaskConnected,
      metamaskAddress,
      hasError,
    } = this.state

    if (!ethToken.isEthOrEthToken({ name: currency }) && selectedDestination === 'metamask') {
      selectedDestination = 'none'
    }


    const ticker = currency.toUpperCase()

    let isCurrencyInUserWallet = true

    for (let i = 0; i < hiddenCoinsList.length; i++) {
      const hiddenCoin = hiddenCoinsList[i]
      if (hiddenCoin === ticker || hiddenCoin.includes(`${ticker}:`)) {
        isCurrencyInUserWallet = false
        break
      }
    }

    const options = [
      {
        value: destinationType.none,
        smalltext: true,
        disabled: true,
        title: <FormattedMessage {...langLabels.labelSpecifyAddress} />,
      },
      ...(isCurrencyInUserWallet
        ?
        [{
            value: destinationType.hotwallet,
            icon: iconHotwallet,
            title: <FormattedMessage {...langLabels.optionHotWallet} />,
        }]
        :
        [{
          value: destinationType.hotwalletcreate,
          icon: iconHotwallet,
          title: <FormattedMessage {...langLabels.optionHotWalletCreate} />,
        }]
      ),
      ...((metamask.isEnabled() && ethToken.isEthOrEthToken({ name: currency }))
        ?
        [{
            value: destinationType.metamask,
            icon: iconMetamask,
            title: <FormattedMessage {...langLabels.optionMetamast} />,
        }] : []),
      {
        value: destinationType.custom,
        icon: iconCustom,
        title: <FormattedMessage {...langLabels.optionCustom} />,
      },
    ]

    return (
      <div styleName={`customDestination ${(hasError) ? 'customDestination_error' : ''} ${isDark ? '--dark' : ''}`}>
        <div styleName="label">{label}</div>
        <DropDown
          styleName="dropDown"
          items={options}
          initialValue={destinationType.none}
          selectedValue={selectedDestination}
          disableSearch={true}
          dontScroll={true}
          arrowSide="left"
          itemRender={item => <Option {...item} />}
          onSelect={(value) => this.handleDestinationSelect(value)}
        />
        {selectedDestination === destinationType.hotwallet &&
          <div styleName="selectedInner">
            <div styleName="readonlyValue">
              <input value={customWallet} onChange={() => { }} />
            </div>
          </div>
        }
        {selectedDestination === destinationType.metamask && metamask.isEnabled() &&
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
        {selectedDestination === destinationType.custom &&
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
