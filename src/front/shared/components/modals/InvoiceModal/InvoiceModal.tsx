/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { constants, feedback, links, routing } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import BigNumber from 'bignumber.js'
import cssModules from 'react-css-modules'
import dropDownStyles from 'components/ui/DropDown/index.scss'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import { isMobile } from 'react-device-detect'
import QrReader from 'components/QrReader'
import erc20Like from 'common/erc20Like'
import typeforce from 'swap.app/util/typeforce'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import getCurrencyKey from 'helpers/getCurrencyKey'
import ownStyle from './InvoiceModal.scss'
import styles from '../Styles/default.scss'

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

type InvoiceModalProps = {
  name: string
  intl: IUniversalObj
  data: IUniversalObj
}

type InvoiceModalState = {
  toAddressEnabled: boolean
  openScanCam: boolean
  isToken: boolean
  isShipped: boolean
  selectedValue: string
  payerAddress: string
  destination: string
  address: string
  contact: string
  fiatAmount: string
  amount: string
  label: string
  currentDecimals: number
  multiplier: BigNumber
  error: IError | null
  infoAboutCurrency: IUniversalObj
  walletData: IUniversalObj
}

@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class InvoiceModal extends React.Component<InvoiceModalProps, InvoiceModalState> {
  constructor(props) {
    super(props)

    const {
      data: {
        address,
        currency,
        toAddress,
      },
      payerAddress = false,
    } = props

    const isToken = erc20Like.isToken({ name: currency })
    const walletData = actions.core.getWallet({ currency })
    const currentDecimals = walletData.decimals
    const { infoAboutCurrency } = walletData
    const multiplier = infoAboutCurrency && infoAboutCurrency.price_fiat
      ? infoAboutCurrency.price_fiat
      : 0

    this.state = {
      isToken,
      isShipped: false,
      openScanCam: false,
      toAddressEnabled: !!toAddress,
      address: toAddress || '',
      destination: address || '',
      payerAddress,
      contact: '',
      label: '',
      selectedValue: currency,
      fiatAmount: '',
      amount: '',
      multiplier: new BigNumber(multiplier),
      currentDecimals,
      error: null,
      infoAboutCurrency,
      walletData,
    }

    localStorage.setItem(constants.localStorage.invoicesEnabled, '1')
  }

  handleSubmit = () => {
    const { data } = this.props
    const {
      address,
      amount,
      destination,
      contact,
      label,
      isShipped,
      walletData: {
        currency: currencyOriginal,
        tokenKey,
      },
    } = this.state

    const currency = ((tokenKey) || currencyOriginal).toUpperCase()
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
      } catch (error) {
        this.reportError(error)
      }

      this.setState({
        isShipped: false,
      })
    })
  }

  reportError = (error) => {
    feedback.createInvoice.failed(error)
    console.error(error)
  }

  handleGoToInvoice = (invoiceId) => {
    routing.redirectTo(`${links.invoice}/${invoiceId}/share`)
  }

  addressIsCorrect(otherAddress = '') {
    const {
      isToken,
      address,
      walletData: {
        currency,
      },
    } = this.state
    const checkAddress = otherAddress || address

    if (isToken) {
      return typeforce.isCoinAddress.ETH(checkAddress)
    }

    const checkCurrency = getCurrencyKey(currency, true).toUpperCase()

    return typeforce.isCoinAddress[checkCurrency](checkAddress)
  }

  openScan = () => {
    const { openScanCam } = this.state

    this.setState(() => ({
      openScanCam: !openScanCam,
    }))
  }

  handleAmount = (value): any => {
    const {
      multiplier,
      currentDecimals,
      selectedValue,
      walletData: {
        currency: currencyOriginal,
        tokenKey,
      },
    } = this.state

    const currency = ((tokenKey) || currencyOriginal).toUpperCase()

    if (!value) {
      this.setState({
        fiatAmount: '',
        amount: '',
      })
    } else if (selectedValue === currency) {
      this.setState({
        fiatAmount: new BigNumber(value)
          .times(multiplier)
          .dp(2, BigNumber.ROUND_CEIL)
          .toString(),
        amount: value,
      })
    } else {
      this.setState({
        fiatAmount: value,
        amount: new BigNumber(value)
          .div(multiplier)
          .dp(currentDecimals, BigNumber.ROUND_CEIL)
          .toString(),
      })
    }
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
      fiatAmount,
      contact,
      isShipped,
      openScanCam,
      error,
      selectedValue,
      toAddressEnabled,
      walletData: {
        currency: currencyOriginal,
        tokenKey,
      },
      walletData,
      multiplier,
    } = this.state
    const currency = ((tokenKey) || currencyOriginal).toUpperCase()

    const {
      name,
      data: {
        disableClose,
      },
      intl,
    } = this.props

    const linked = Link.all(
      this,
      'address',
      'destination',
      'fiatAmount',
      'amount',
      'contact',
      'label',
    )

    const curList = [
      {
        fullTitle: walletData.fullName,
        icon: currencyOriginal.toLowerCase(),
        name: currencyOriginal,
        title: currencyOriginal,
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

    const isDisabled = !amount || isShipped || !destination || !contact || (!!address && !this.addressIsCorrect())

    return (
      <Modal
        name={name}
        title={`${intl.formatMessage(localeLabel.title)}${' '}${currency.toUpperCase()}`}
        disableClose={disableClose}
      >
        <>
          {openScanCam && (
            <QrReader
              openScan={this.openScan}
              handleError={this.reportError}
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
                {address && !this.addressIsCorrect() && (
                  <div styleName="rednote">
                    <FormattedMessage
                      id="invoiceModal_IncorrectAddress"
                      defaultMessage="Incorrect address"
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
                    id="invoiceModal_IncorrectAddress"
                    defaultMessage="Incorrect address"
                  />
                </div>
              )}
            </div>
            <div styleName="highLevel">
              <FieldLabel>
                <span>
                  <FormattedMessage id="orders102" defaultMessage="Amount" />
                </span>
              </FieldLabel>
              {!multiplier.isEqualTo(0) && (
                <span styleName="amountTooltip">
                  {
                    new BigNumber(amount).isGreaterThan(0)
                      ? selectedValue === currency
                        ? `~ ${fiatAmount} USD`
                        : `~ ${amount} ${currency}`
                      : ''
                  }
                </span>
              )}
              <Input
                className={ownStyle.input}
                placeholder={intl.formatMessage(localeLabel.amountPlaceholder)}
                onKeyDown={inputReplaceCommaWithDot}
                pattern="0-9\."
                withMargin
                valueLink={selectedValue === currency
                  ? linked.amount.pipe(this.handleAmount)
                  : linked.fiatAmount.pipe(this.handleAmount)}
              />
              <CurrencySelect
                className={dropDownStyles.simpleDropdown}
                selectedValue={selectedValue}
                onSelect={this.handleBuyCurrencySelect}
                selectedItemRender={(item) => item.fullTitle}
                currencies={curList}
                disabled={multiplier.isEqualTo(0)}
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
                  srollingForm
                  valueLink={linked.label}
                  multiline
                  placeholder={intl.formatMessage(localeLabel.labelPlaceholder)}
                />
              </div>
            </div>
            <Button fullWidth blue big disabled={isDisabled} onClick={this.handleSubmit}>
              {isShipped ? (
                <FormattedMessage id="invoiceModal_Processing" defaultMessage="Обработка ..." />
              ) : (
                <FormattedMessage id="invoiceModal_Submit" defaultMessage="Выставить счет" />
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
        </>
      </Modal>
    )
  }
}

export default injectIntl(InvoiceModal)
