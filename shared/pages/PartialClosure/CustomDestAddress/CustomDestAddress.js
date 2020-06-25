import React, { Component, Fragment } from 'react'
import { connect } from 'redaction'
import styles from './CustomDestAddress.scss'
import cssModules from 'react-css-modules'
import config from 'helpers/externalConfig'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Input from "components/forms/Input/Input";
import DropDown from "components/ui/DropDown/DropDown"
import metamask from "helpers/metamask"
import { Button } from "components/controls"
import ethToken from 'helpers/ethToken'
import Option from './Option/Option'

import iconHotwallet from 'components/Logo/images/base.svg'
import iconMetamask from './images/metamask.svg'
import iconCustom from './images/custom.svg'



const langPrefix = `Partial_DestinationAddress`
const langLabels = defineMessages({
  labelSpecifyAddress: {
    id: `${langPrefix}_SpecifyAddress`,
    defaultMessage: `Specify the receiving wallet address`,
  },
  optionHotWallet: {
    id: `${langPrefix}_HotWalletAddressOption`,
    defaultMessage: `My Wallet`,
  },
  optionMetamast: {
    id: `${langPrefix}_MetamaskAddressOption`,
    defaultMessage: `Metamask's address`,
  },
  optionCustom: {
    id: `${langPrefix}_CustomAddressOption`,
    defaultMessage: `Custom address`,
  },
  placeholderAddress: {
    id: `${langPrefix}_PlaceholderEnterAddress`,
    defaultMessage: `Enter the receiving wallet address`,
  },
  connectMetamask: {
    id: `${langPrefix}_ConnectMetamask`,
    defaultMessage: `Connect Metamask`,
  },
})

const destinationType = {
  none: `none`,
  hotwallet: `hotwallet`,
  metamask: `metamask`,
  custom: `custom`,
}

@cssModules(styles, { allowMultiple: true })
export default class CustomDestAddress extends Component {
  constructor(props) {
    super(props)
    const {
      initialValue,
      type,
      hasError = false,
    } = props

    this.state = {
      type,
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
      type: newType,
      initialValue,
      hasError = false,
    } = this.props
    const {
      type: oldType,
      hasError: oldHasError = false,
    } = this.state

    if ((newType !== oldType) || (hasError !== oldHasError)) {
      this.setState({
        type: newType,
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
      type,
      isDark
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

    if (!ethToken.isEthOrEthToken({ name: type }) && selectedDestination === 'metamask') {
      selectedDestination = 'none'
    }

    let destinationOptions = [
      {
        value: destinationType.none,
        smalltext: true,
        title: <FormattedMessage {...langLabels.labelSpecifyAddress} />,
      },
      {
        value: destinationType.hotwallet,
        icon: iconHotwallet,
        title: <FormattedMessage {...langLabels.optionHotWallet} />,
      },
      ...(
        (metamask.isEnabled() && ethToken.isEthOrEthToken({ name: type })) ? [
          {
            value: destinationType.metamask,
            icon: iconMetamask,
            title: <FormattedMessage {...langLabels.optionMetamast} />,
          }
        ] : []
      ),
      {
        value: destinationType.custom,
        icon: iconCustom,
        title: <FormattedMessage {...langLabels.optionCustom} />,
      },
    ]

    return (
      <div styleName={`customDestination ${(hasError) ? 'customDestination_error' : ''} ${isDark ? '--dark' : ''}`}>
        <DropDown
          styleName="dropDown"
          items={destinationOptions}
          initialValue={destinationType.none}
          selectedValue={selectedDestination}
          disableSearch={true}
          dontScroll={true}
          itemRender={item => <Option {...item} />}
          onSelect={(value) => this.handleDestinationSelect(value)}
        />
        {selectedDestination === destinationType.hotwallet && (
          <div styleName="readonlyValue">
            <input value={customWallet} onChange={() => { }} />
          </div>
        )}
        {selectedDestination === destinationType.metamask && metamask.isEnabled() && (
          <Fragment>
            {(metamaskConnected) ? (
              <div styleName="readonlyValue">
                <input value={metamaskAddress} onChange={() => { }} />
              </div>
            ) : (
                <Button
                  styleName="button"
                  blue
                  onClick={() => { this.handleConnectMetamask() }}
                >
                  <FormattedMessage {...langLabels.connectMetamask} />
                </Button>
              )}
          </Fragment>
        )}
        {selectedDestination === destinationType.custom && (
          <div styleName={`customWallet ${(walletAddressFocused) ? 'customWallet_focus' : ''}`}>
            <div styleName="anotherRecepient">
              <div styleName="walletInput">
                <Input
                  inputCustomStyle={{ fontSize: "15px" }}
                  required
                  valueLink={customWalletValueLink}
                  pattern="0-9a-zA-Z"
                  onBlur={() => { this.handleBlurAddress() }}
                  onFocus={() => { this.handleFocusAddress() }}
                  placeholder="Enter the receiving wallet address"
                />
                <i styleName="qrCode" className="fas fa-qrcode" onClick={openScan} />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
