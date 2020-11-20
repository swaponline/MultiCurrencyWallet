import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { request, constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import dropDownStyles from 'components/ui/DropDown/DropDown.scss'
import ownStyle from './InvoiceModal.scss'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'
import QrReader from 'components/QrReader'

// import isCoinAddress from 'swap.app/util/typeforce'
import typeforce from 'swap.app/util/typeforce'
import minAmount from 'helpers/constants/minAmount'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import getCurrencyKey from 'helpers/getCurrencyKey'

import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import redirectTo from 'helpers/redirectTo'

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
    defaultMessage: 'Введите сумму',
  },
  contactPlaceholder: {
    id: 'invoiceModal_contactPlaceholder',
    defaultMessage: 'Обязательное поле',
  },
  labelPlaceholder: {
    id: 'invoiceModal_labelPlaceholder',
    defaultMessage: 'Укажите комментарий к счету',
  },
})

@injectIntl
@connect(
  ({
    currencies,
    user: {
      ethData,
      btcData,
      ghostData,
      nextData,
      btcMultisigSMSData,
      btcMultisigUserData,
      tokensData,
    },
  }) => ({
    currencies: currencies.items,
    items: [ethData, btcData, ghostData, nextData, btcMultisigSMSData, btcMultisigUserData],
    tokenItems: [...Object.keys(tokensData).map((k) => tokensData[k])],
  })
)
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
export default class InvoiceModal extends React.Component<any, any> {
  props: any

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(data) {
    //@ts-ignore
    super()

    const {
      data: { address, currency, toAddress },
      items,
      tokenItems,
      payerAddress = false,
    } = data
    let infoAboutCurrency

    items.map((item) => {
      if (item.currency === currency) {
        infoAboutCurrency = item.infoAboutCurrency
      }
    })

    const currentDecimals = constants.tokenDecimals[currency.toLowerCase()]

    const multiplier =
      infoAboutCurrency && infoAboutCurrency.price_fiat ? infoAboutCurrency.price_fiat : 1

    this.state = {
      isShipped: false,
      payerAddress,
      openScanCam: '',
      address: toAddress || '',
      toAddressEnabled: !!toAddress,
      destination: address,
      amount: '',
      minus: '',
      contact: '',
      label: '',
      selectedValue: 'BTC',
      currentDecimals,
      error: false,
      infoAboutCurrency,
      multiplier,
      rubRates: 62.34,
    }

    this.getRubRates()

    localStorage.setItem(constants.localStorage.invoicesEnabled, '1')
  }

  getRubRates() {
    request
      .get('https://www.cbr-xml-daily.ru/daily_json.js', {
        cacheResponse: 60 * 60 * 1000,
      })
      .then((rates) => {
        if (rates && rates.Valute && rates.Valute.USD) {
          const rubRates = rates.Valute.USD.Value
          this.setState({
            rubRates,
          })
        }
      })
  }

  handleSubmit = async () => {
    const { name, data } = this.props
    const { address, amount, destination, contact, label, isShipped } = this.state

    if (isShipped) return

    this.setState({
      isShipped: true,
    })

    let currency = getCurrencyKey(data.currency, true).toUpperCase()

    try {
      const message = `${contact}\r\n${label}`
      const result = await actions.invoices.addInvoice({
        currency,
        toAddress: address,
        fromAddress: data.address,
        amount,
        contact,
        label: message,
        destination,
      })
      if (result && result.answer && result.answer === 'ok') {
        this.handleGoToInvoice(result.invoiceId)
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

  handleGoToInvoice = (invoiceId) => {
    redirectTo(`${links.invoice}/${invoiceId}/share`)
  }

  addressIsCorrect(otherAddress) {
    const {
      data: { currency },
    } = this.props
    const { address, isEthToken } = this.state
    const checkAddress = otherAddress ? otherAddress : address

    if (isEthToken) {
      return typeforce.isCoinAddress.ETH(checkAddress)
    }
    let checkCurrency = getCurrencyKey(currency, true).toUpperCase()

    return typeforce.isCoinAddress[checkCurrency](checkAddress)
  }

  openScan = () => {
    const { openScanCam } = this.state

    this.setState(() => ({
      openScanCam: !openScanCam,
    }))
  }

  handleDollarValue = (value) => {
    const { rubRates, currentDecimals, multiplier } = this.state

    this.setState({
      amountUSD: value,
      amountRUB: value ? (value * rubRates).toFixed(0) : '',
      amount: value ? (value / multiplier).toFixed(currentDecimals) : '',
    })
  }

  handleRubValue = (value) => {
    const { rubRates, currentDecimals, multiplier } = this.state

    this.setState({
      amountRUB: value,
      amountUSD: value ? (value / rubRates).toFixed(2) : '',
      amount: value ? (value / multiplier / rubRates).toFixed(currentDecimals) : '',
    })
  }

  handleAmount = (value) => {
    const { rubRates, multiplier } = this.state

    this.setState({
      amountRUB: value ? (value * multiplier * rubRates).toFixed(0) : '',
      amountUSD: value ? (value * multiplier).toFixed(2) : '',
      amount: value,
    })
  }

  handleError = (err) => {
    console.error(err)
  }

  handleScan = (data) => {
    if (data) {
      this.setState(() => ({
        address: data.includes(':') ? data.split(':')[1] : data,
      }))
      this.openScan()
    }
  }

  handleBuyCurrencySelect = (value) => {
    this.setState({
      selectedValue: value.name,
    })
  }

  render() {
    const {
      address,
      destination,
      amount,
      amountRUB,
      amountUSD,
      contact,
      label,
      isShipped,
      minus,
      openScanCam,
      error,
      infoAboutCurrency,
      selectedValue,
      toAddressEnabled,
    } = this.state

    const {
      name,
      data: { currency },
      intl,
    } = this.props

    const linked = Link.all(
      this,
      'address',
      'destination',
      'amountUSD',
      'amountRUB',
      'amount',
      'contact',
      'label'
    )

    const isDisabled =
      //@ts-ignore
      !amount || isShipped || !destination || !contact || (address && !this.addressIsCorrect())

    return (
      <Modal
        name={name}
        title={`${intl.formatMessage(localeLabel.title)}${' '}${currency.toUpperCase()}`}
        disableClose={this.props.data.disableClose}
      >
        {openScanCam && (
          <QrReader
            openScan={this.openScan}
            handleError={this.handleError}
            handleScan={this.handleScan}
          />
        )}
        <div styleName="invoiceModalHolder">
          {toAddressEnabled && (
            <div styleName="highLevel">
              <FieldLabel>
                <FormattedMessage
                  id="invoiceModal_Address"
                  defaultMessage="Адрес, на который выставляем счет"
                />
              </FieldLabel>
              <Input
                smallFontSize
                withMargin
                valueLink={linked.address}
                focusOnInit
                pattern="0-9a-zA-Z:"
                placeholder={intl.formatMessage(localeLabel.addressPlaceholder, {
                  currency: currency.toUpperCase(),
                })}
                qr
                openScan={this.openScan}
              />
              {/*
              //@ts-ignore */}
              {address && !this.addressIsCorrect() && (
                <div styleName="rednote">
                  <FormattedMessage
                    id="invoiceModal_IncorrectAddress"
                    defaultMessage="Вы ввели не коректный адрес"
                  />
                </div>
              )}
            </div>
          )}
          <div styleName="highLevel">
            <FieldLabel>
              <FormattedMessage
                id="invoiceModal_destiAddress"
                defaultMessage="Адрес, куда будет произведена оплата"
              />
            </FieldLabel>
            <Input
              valueLink={linked.destination}
              focusOnInit
              smallFontSize
              withMargin
              pattern="0-9a-zA-Z:"
              placeholder={intl.formatMessage(localeLabel.destiAddressPlaceholder, {
                currency: currency.toUpperCase(),
              })}
              qr
              openScan={this.openScan}
            />
            {destination && !this.addressIsCorrect(destination) && (
              <div styleName="rednote">
                <FormattedMessage
                  id="invoiceModal_IncorrectDestiAddress"
                  defaultMessage="Вы ввели не коректный адрес"
                />
              </div>
            )}
          </div>
          <div styleName="highLevel">
            <FieldLabel>
              <span>
                <FormattedMessage id="invoiceModal_Amount" defaultMessage="Сумма" />
              </span>
            </FieldLabel>
            <span styleName="amountTooltip">{amount > 0 ? `~ ${amount} BTC` : ''}</span>
            {this.state.selectedValue === 'BTC' ? (
              <Input
                withMargin
                className={ownStyle.input}
                valueLink={linked.amount.pipe(this.handleAmount)}
                pattern="0-9\."
                placeholder={intl.formatMessage(localeLabel.amountPlaceholder)}
                onKeyDown={inputReplaceCommaWithDot}
              />
            ) : (
              ''
            )}

            {this.state.selectedValue === 'RUB' ? (
              <Input
                withMargin
                className={ownStyle.input}
                valueLink={linked.amountRUB.pipe(this.handleRubValue)}
                pattern="0-9\."
                placeholder={intl.formatMessage(localeLabel.amountPlaceholder)}
                onKeyDown={inputReplaceCommaWithDot}
              />
            ) : (
              ''
            )}

            {this.state.selectedValue === 'USD' ? (
              <Input
                withMargin
                className={ownStyle.input}
                valueLink={linked.amountUSD.pipe(this.handleDollarValue)}
                pattern="0-9\."
                placeholder={intl.formatMessage(localeLabel.amountPlaceholder)}
                onKeyDown={inputReplaceCommaWithDot}
              />
            ) : (
              ''
            )}

            {/*
            //@ts-ignore */}
            <CurrencySelect
              label="fdsfssf"
              tooltip="dsfss"
              id="fdsfs"
              className={dropDownStyles.simpleDropdown}
              selectedValue={selectedValue}
              onSelect={this.handleBuyCurrencySelect}
              selectedItemRender={(item) => item.fullTitle}
              //@ts-ignore
              isToggleActive
              currencies={[
                {
                  fullTitle: 'rub',
                  icon: 'rub',
                  name: 'RUB',
                  title: 'RUB',
                  value: 'RUB',
                },
                {
                  fullTitle: 'bitcoin',
                  icon: 'btc',
                  name: 'BTC',
                  title: 'BTC',
                  value: 'BTC',
                },
                {
                  fullTitle: 'USD',
                  icon: 'usd',
                  name: 'USD',
                  title: 'USD',
                  value: 'USD',
                },
              ]}
            />
          </div>
          <div styleName="highLevel">
            <FieldLabel>
              <span>
                <FormattedMessage
                  id="invoiceModal_Contact"
                  defaultMessage="Ваш контакт (емейл или @никнейм)"
                />
              </span>
            </FieldLabel>
            <Input
              valueLink={linked.contact}
              withMargin
              placeholder={intl.formatMessage(localeLabel.contactPlaceholder)}
            />
          </div>
          <div styleName="lowLevel">
            <FieldLabel>
              <span>
                <FormattedMessage id="invoiceModal_Label" defaultMessage="Комментарий" />
              </span>
            </FieldLabel>
            <div styleName="group" style={{ marginBottom: '25px' }}>
              <Input
                srollingForm={true}
                valueLink={linked.label}
                multiline="true"
                placeholder={intl.formatMessage(localeLabel.labelPlaceholder)}
              />
            </div>
          </div>
          <Button fullWidth blue big disabled={isDisabled} onClick={this.handleSubmit}>
            {isShipped ? (
              <Fragment>
                <FormattedMessage id="invoiceModal_Processing" defaultMessage="Обработка ..." />
              </Fragment>
            ) : (
              <Fragment>
                <FormattedMessage id="invoiceModal_Submit" defaultMessage="Выставить счет" />
              </Fragment>
            )}
          </Button>
          {error && (
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
          )}
        </div>
      </Modal>
    )
  }
}
