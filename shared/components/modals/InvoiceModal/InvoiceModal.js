import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './InvoiceModal.scss'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'
import QrReader from 'components/QrReader'

// import isCoinAddress from 'swap.app/util/typeforce'
import typeforce from 'swap.app/util/typeforce'
import minAmount from 'helpers/constants/minAmount'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'


@injectIntl
@connect(
  ({
    currencies,
    user: {
      ethData,
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      bchData,
      tokensData,
      nimData,
      ltcData,
      // usdtOmniData,
      // nimData,
    },
  }) => ({
    currencies: currencies.items,
    items: [
      ethData,
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      bchData,
      ltcData,
      // usdtOmniData,
      // nimData,
    ],
    tokenItems: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  })
)
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
export default class InvoiceModal extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(data) {
    super()

    const { data: { address, currency, toAddress }, items, tokenItems } = data

    const currentDecimals = constants.tokenDecimals[currency.toLowerCase()]

    this.state = {
      isShipped: false,
      openScanCam: '',
      address: (toAddress) ? toAddress : '',
      destination: address,
      amount: '',
      minus: '',
      label: '',
      currentDecimals,
      error: false,
    }
  }

  componentDidMount() { }

  componentWillUpdate(nextProps, nextState) { }

  handleSubmit = async () => {
    const { name, data } = this.props
    const { address, amount, destination, label, isShipped } = this.state

    if (isShipped) return

    this.setState({
      isShipped: true,
    })

    let currency = data.currency.toUpperCase()
    switch (data.currency) {
      case 'BTC (SMS-Protected)':
      case 'BTC (Multisig)':
        currency = 'BTC'
        break;
    }

    try {
      const result = await actions.invoices.addInvoice({
        currency,
        toAddress: address,
        fromAddress: data.address,
        amount,
        label,
        destination,
      })
      if (result && result.answer && result.answer === 'ok') {
        actions.modals.close(name)
      }
      if (data.onReady instanceof Function) {
        data.onReady()
      }
    } catch (e) {
      console.log('error', e)
    }

    this.setState({
      isShipped: false,
    })
  }

  addressIsCorrect(otherAddress) {
    const { data: { currency } } = this.props
    const { address, isEthToken } = this.state
    const checkAddress = (otherAddress) ? otherAddress : address

    if (isEthToken) {
      return typeforce.isCoinAddress.ETH(checkAddress)
    }
    let checkCurrency = currency.toUpperCase()
    switch (currency) {
      case 'BTC (SMS-Protected)':
      case 'BTC (Multisig)':
        checkCurrency = 'BTC'
        break;
    }

    return typeforce.isCoinAddress[checkCurrency](checkAddress)
  }

  openScan = () => {
    const { openScanCam } = this.state

    this.setState(() => ({
      openScanCam: !openScanCam,
    }))
  }

  handleError = err => {
    console.error(err)
  }

  handleScan = data => {
    if (data) {
      this.setState(() => ({
        address: data.includes(':') ? data.split(':')[1] : data,
      }))
      this.openScan()
    }
  }

  render() {
    const {
      address,
      destination,
      amount,
      label,
      isShipped,
      minus,
      openScanCam,
      currentDecimals,
      error,
    } = this.state

    const {
      name,
      data: {
        currency,
      },
      intl,
    } = this.props

    const linked = Link.all(this, 'address', 'destination', 'amount', 'label')

    const isDisabled =
      !address || !amount || isShipped || !destination
      || !this.addressIsCorrect()
      || BigNumber(amount).dp() > currentDecimals

    if (this.state.amount < 0) {
      this.setState({
        amount: '',
        minus: true,
      })
    }

    const localeLabel = defineMessages({
      title: {
        id: 'invoiceModal_Title',
        defaultMessage: 'Выставление счета на пополнение',
      },
      addressPlaceholder: {
        id: 'invoiceModal_addressPlaceholder',
        defaultMessage: 'Введите адрес {currency} кошелька',
      },
      destiAddressPlaceholder: {
        id: 'invoiceModal_destiAddressPlaceholder',
        defaultMessage: 'Введите адрес {currency} кошелька',
      },
      amountPlaceholder: {
        id: 'invoiceModal_amountPlaceholder',
        defaultMessage: 'Введите сумму'
      },
      labelPlaceholder: {
        id: 'invoiceModal_labelPlaceholder',
        defaultMessage: 'Укажите комментарий к счету',
      },
    })

    return (
      <Modal name={name} title={`${intl.formatMessage(localeLabel.title)}${' '}${currency.toUpperCase()}`} disableClose={this.props.data.disableClose}>
        {openScanCam &&
          <QrReader
            openScan={this.openScan}
            handleError={this.handleError}
            handleScan={this.handleScan}
          />
        }
        <div styleName="invoiceModalHolder">
          <div styleName="highLevel">
            <FieldLabel inRow>
              <span style={{ fontSize: '16px' }}>
                <FormattedMessage id="invoiceModal_Address" defaultMessage="Адрес, на который выставляем счет" />
              </span>
            </FieldLabel>
            <Input
              valueLink={linked.address}
              focusOnInit pattern="0-9a-zA-Z:"
              placeholder={intl.formatMessage(localeLabel.addressPlaceholder, { currency: currency.toUpperCase() })}
              qr
              openScan={this.openScan}
            />
            {address && !this.addressIsCorrect() && (
              <div styleName="rednote">
                <FormattedMessage
                  id="invoiceModal_IncorrectAddress"
                  defaultMessage="Вы ввели не коректный адрес" />
              </div>
            )}
          </div>
          <div styleName="highLevel">
            <FieldLabel inRow>
              <span style={{ fontSize: '16px' }}>
                <FormattedMessage id="invoiceModal_destiAddress" defaultMessage="Адрес, куда будет произведена оплата" />
              </span>
            </FieldLabel>
            <Input
              valueLink={linked.destination}
              focusOnInit pattern="0-9a-zA-Z:"
              placeholder={intl.formatMessage(localeLabel.destiAddressPlaceholder, { currency: currency.toUpperCase() })}
              qr
              openScan={this.openScan}
            />
            {destination && !this.addressIsCorrect(destination) && (
              <div styleName="rednote">
                <FormattedMessage
                  id="invoiceModal_IncorrectDestiAddress"
                  defaultMessage="Вы ввели не коректный адрес" />
              </div>
            )}
          </div>
          <div styleName="lowLevel">
            <div styleName="groupField">
              <div styleName="downLabel">
                <FieldLabel inRow>
                  <span styleName="mobileFont">
                    <FormattedMessage id="invoiceModal_Amount" defaultMessage="Сумма " />
                  </span>
                </FieldLabel>
              </div>
            </div>
            <div styleName="group">
              <Input
                styleName="input"
                valueLink={linked.amount}
                pattern="0-9\."
                placeholder={intl.formatMessage(localeLabel.amountPlaceholder)}
                onKeyDown={inputReplaceCommaWithDot}
              />
            </div>
          </div>
          <div styleName="lowLevel">
            <div styleName="groupField">
              <div styleName="downLabel">
                <FieldLabel inRow>
                  <span styleName="mobileFont">
                    <FormattedMessage id="invoiceModal_Label" defaultMessage="Комментарий" />
                  </span>
                </FieldLabel>
              </div>
            </div>
            <div styleName="group">
              <Input
                styleName="input"
                valueLink={linked.label}
                pattern="0-9\."
                multiline="true"
                placeholder={intl.formatMessage(localeLabel.labelPlaceholder)}
              />
            </div>
          </div>
          <Button styleName="buttonFull" brand fullWidth disabled={isDisabled} onClick={this.handleSubmit}>
            {isShipped
              ? (
                <Fragment>
                  <FormattedMessage id="invoiceModal_Processing" defaultMessage="Обработка ..." />
                </Fragment>
              )
              : (
                <Fragment>
                  <FormattedMessage id="invoiceModal_Submit" defaultMessage="Выставить счет" />
                </Fragment>
              )
            }
          </Button>
          {
            error && (
              <div styleName="rednote">
                <FormattedMessage
                  id="invoiceModal_Error"
                  defaultMessage="{errorName} {currency}:{br}{errorMessage}"
                  values={{
                    errorName: intl.formatMessage(error.name),
                    errorMessage: intl.formatMessage(error.message),
                    br: <br />,
                    currency: `${currency}`,
                  }}
                />
              </div>
            )
          }
        </div>
      </Modal>
    )
  }
}
