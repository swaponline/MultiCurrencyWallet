import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import request from 'common/utils/request'
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
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
export default class InvoiceModal extends React.Component<any, any> {
  props: any

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    const {
      data: {
        address,
        currency,
        toAddress,
      },
      tokenItems,
      payerAddress = false,
    } = props

    const walletData = actions.core.getWallet({ currency })

    const {
      infoAboutCurrency,
      decimals: currentDecimals,
    } = walletData

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
      selectedValue: currency,
      currentDecimals,
      error: false,
      infoAboutCurrency,
      multiplier,
      walletData,
    }

    localStorage.setItem(constants.localStorage.invoicesEnabled, '1')
  }

  handleSubmit = () => {
    const { name, data } = this.props
    const {
      address,
      amount,
      destination,
      contact,
      label,
      isShipped,
      walletData: {
        currency,
      },
    } = this.state

    if (isShipped) return

    this.setState({
      isShipped: true,
    }, async () => {
      try {
        const message = `${contact}\r\n${label}`
        const result: any = await actions.invoices.addInvoice({
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
    })
  }

  handleGoToInvoice = (invoiceId) => {
    redirectTo(`${links.invoice}/${invoiceId}/share`)
  }

  addressIsCorrect(otherAddress) {
    const {
      address,
      walletData: {
        currency,
        isERC20: isEthToken,
      },
    } = this.state
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
    const { currentDecimals, multiplier } = this.state

    this.setState({
      amountUSD: value,
      amount: value ? (value / multiplier).toFixed(currentDecimals) : '',
    })
  }

  handleAmount = (value) => {
    const { multiplier } = this.state

    this.setState({
      amountUSD: value ? (value * multiplier).toFixed(2) : '',
      amount: value,
    })
  }

  handleError = (err) => {
    console.error(err)
  }

  handleScan = (data) => {
    if (data) {
      this.setState({
        address: data.includes(':') ? data.split(':')[1] : data,
      }, () => {
        this.openScan()
      })
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
      walletData: {
        currency,
      },
      walletData,
    } = this.state

    const {
      name,
      intl,
    } = this.props

    const linked = Link.all(
      this,
      'address',
      'destination',
      'amountUSD',
      'amount',
      'contact',
      'label'
    )

    let curList = [
      {
        fullTitle: walletData.fullName,
        icon: currency.toLowerCase(),
        name: currency,
        title: currency,
        value: currency,
      },
      {
        fullTitle: 'USD',
        icon: 'usd',
        name: 'USD',
        title: 'USD',
        value: 'USD',
      },
    ]

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
                qr={isMobile}
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
              qr={isMobile}
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
            {selectedValue === currency ? (
              <>
                <span styleName="amountTooltip">{amount > 0 ? `~ ${amountUSD} USD` : ''}</span>
                <Input
                  withMargin
                  className={ownStyle.input}
                  valueLink={linked.amount.pipe(this.handleAmount)}
                  pattern="0-9\."
                  placeholder={intl.formatMessage(localeLabel.amountPlaceholder)}
                  onKeyDown={inputReplaceCommaWithDot}
                />
              </>
            ) : (
              ''
            )}

            {selectedValue === 'USD' ? (
              <>
                <span styleName="amountTooltip">{amount > 0 ? `~ ${amount} ${currency}` : ''}</span>
                <Input
                  withMargin
                  className={ownStyle.input}
                  valueLink={linked.amountUSD.pipe(this.handleDollarValue)}
                  pattern="0-9\."
                  placeholder={intl.formatMessage(localeLabel.amountPlaceholder)}
                  onKeyDown={inputReplaceCommaWithDot}
                />
              </>
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
              currencies={curList}
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
