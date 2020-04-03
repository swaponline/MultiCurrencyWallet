import React, { Component, Fragment } from 'react'
import { connect } from 'redaction'
import styles from './CustomDestAddress.scss'
import cssModules from 'react-css-modules'
import config from 'helpers/externalConfig'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Input from "components/forms/Input/Input";
import DropDown from "components/ui/DropDown/DropDown"


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

    this.state = {
      selectedDestination: destinationType.none,
    }
  }


  handleDestinationSelect(item) {
    this.setState({
      selectedDestination: item.value,
    })
  }
  

  render() {
    const customWalletUse = true
    const customWalletValueLink = this.props.valueLink

    const {
      openScan,
    } = this.props

    const {
      selectedDestination,
    } = this.state

    let destinationOptions = [
      {
        value: destinationType.none,
        title: <FormattedMessage { ...langLabels.labelSpecifyAddress } />,
      },
      {
        value: destinationType.hotwallet,
        title: <FormattedMessage { ...langLabels.optionHotWallet } />,
      },
      {
        value: destinationType.metamask,
        title: <FormattedMessage { ...langLabels.optionMetamast } />,
      },
      {
        value: destinationType.custom,
        title: <FormattedMessage { ...langLabels.optionCustom } />,
      },
    ]

    return (
      <Fragment>
        <DropDown 
          items={destinationOptions}
          initialValue={destinationType.none}
          selectedValue={selectedDestination}
          onSelect={(value) => this.handleDestinationSelect(value)}
          />
        {(selectedDestination !== destinationType.none) && (
          <div styleName="walletToggle walletToggle_site">
          {/*
            <div styleName="walletOpenSide" className="data-tut-togle">
              <Toggle checked={!customWalletUse} onChange={this.handleCustomWalletUse} />
              <span styleName="specify">
                <FormattedMessage id="UseAnotherWallet" defaultMessage="Specify the receiving wallet address" />
              </span>
            </div>
          */}
            <div styleName="anotherRecepient">
              <div styleName="walletInput">
                <Input
                  inputCustomStyle={{ fontSize: "15px" }}
                  required
                  disabled={customWalletUse}
                  valueLink={customWalletValueLink}
                  pattern="0-9a-zA-Z"
                  placeholder="Enter the receiving wallet address"
                />
                <i styleName="qrCode" className="fas fa-qrcode" onClick={openScan} />
              </div>
            </div>
          </div>
        )}
      </Fragment>
    )
  }
}
