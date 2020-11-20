import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants, request } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './AddCustomERC20.scss'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'

import typeforce from 'swap.app/util/typeforce'
import Web3 from 'web3'

const serviceURLMainnet =
  'https://api.etherscan.io/api?apikey=87F9B9IH33JPVRM5ZVFEK1DQTM64FUZFMV&module=proxy&action=eth_call'
const serviceURLTestnet =
  'https://api-rinkeby.etherscan.io/api?apikey=87F9B9IH33JPVRM5ZVFEK1DQTM64FUZFMV&module=proxy&action=eth_call'
const serviceURL = process.env.MAINNET ? serviceURLMainnet : serviceURLTestnet

const nameSignature = '0x06fdde03'
const decimalsSignature = '0x313ce567'
const symbolSignature = '0x95d89b41'

@injectIntl
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
export default class AddCustomERC20 extends React.Component<any, any> {
  props: any

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(data) {
    //@ts-ignore
    super()
    //@ts-ignore
    this.state = {
      step: 'enterAddress',
      tokenAddress: '',
      tokenTitle: '',
      tokenSymbol: '',
      tokenDecimals: 0,
      notFound: false,
      isShipped: false,
    }
  }

  componentDidMount() {}

  async getName(address) {
    const response: any = await request.get(`${serviceURL}&to=${address}&data=${nameSignature}`)
    const hexSymbol = response.result
    const symbol = Web3.utils.toUtf8(hexSymbol)

    return symbol.replace(/\W/g, '')
  }

  async getSymbol(address) {
    const response: any = await request.get(`${serviceURL}&to=${address}&data=${symbolSignature}`)
    const hexSymbol = response.result
    const symbol = Web3.utils.toUtf8(hexSymbol)

    return symbol.replace(/\W/g, '')
  }

  async getDecimals(address) {
    const response: any = await request.get(`${serviceURL}&to=${address}&data=${decimalsSignature}`)
    const hexDecimals = response.result
    const decimals = Web3.utils.hexToNumber(hexDecimals)

    return decimals
  }

  handleSubmit = async () => {
    //@ts-ignore
    const { tokenAddress } = this.state
    //@ts-ignore
    this.setState({
      isShipped: true,
    })

    const tokenTitle = await this.getName(tokenAddress)
    const tokenSymbol = await this.getSymbol(tokenAddress)
    const tokenDecimals = await this.getDecimals(tokenAddress)

    if (tokenSymbol) {
      this.setState({
        tokenTitle,
        tokenSymbol,
        tokenDecimals,
        step: 'confirm',
        isShipped: false,
      })
    } else {
      this.setState({
        notFound: true,
        isShipped: false,
      })
      setTimeout(() => {
        this.setState({
          notFound: false,
        })
      }, 5000)
    }
  }

  handleConfirm = async () => {
    //@ts-ignore
    const { tokenAddress, tokenSymbol, tokenDecimals } = this.state
    actions.token.AddCustomERC20(tokenAddress, tokenSymbol, tokenDecimals)
    actions.core.markCoinAsVisible(tokenSymbol.toUpperCase(), true)
    //@ts-ignore
    this.setState({
      step: 'ready',
    })
  }

  handleReady = async () => {
    window.location.reload()
  }

  addressIsCorrect() {
    //@ts-ignore
    const { tokenAddress } = this.state
    return typeforce.isCoinAddress.ETH(tokenAddress)
  }

  handleError = (err) => {
    console.error(err)
  }

  render() {
    const {
      step,
      tokenAddress,
      tokenTitle,
      tokenSymbol,
      tokenDecimals,
      isShipped,
      notFound,
      //@ts-ignore
    } = this.state

    const {
      name,
      data: { currency },
      intl,
      //@ts-ignore
    } = this.props

    const linked = Link.all(this, 'tokenAddress')

    const isDisabled = !tokenAddress || isShipped || !this.addressIsCorrect()

    const localeLabel = defineMessages({
      title: {
        id: 'customERC20_Title',
        defaultMessage: 'Добавление токена ERC20',
      },
      addressPlaceholder: {
        id: 'customERC20_addressPlaceholder',
        defaultMessage: 'Введите адрес токена',
      },
    })

    return (
      /*
      //@ts-ignore*/
      <Modal
        name={name}
        title={`${intl.formatMessage(localeLabel.title)}`}
        disableClose={this.props.data.disableClose}
      >
        <div styleName="erc20ModalHolder">
          {step === 'enterAddress' && (
            <Fragment>
              <div styleName="highLevel">
                <FieldLabel inRow>
                  <span style={{ fontSize: '16px' }}>
                    <FormattedMessage id="customERC20_Address" defaultMessage="Адрес контракта" />
                  </span>
                </FieldLabel>
                <Input
                  valueLink={linked.tokenAddress}
                  focusOnInit
                  pattern="0-9a-zA-Z:"
                  placeholder={intl.formatMessage(localeLabel.addressPlaceholder)}
                />
                {notFound && (
                  <div styleName="rednote">
                    <FormattedMessage
                      id="customERC20_NotFound"
                      defaultMessage="По указаному адресу не найден токен ERC20"
                    />
                  </div>
                )}
                {tokenAddress && !this.addressIsCorrect() && (
                  <div styleName="rednote">
                    <FormattedMessage
                      id="customERC20_IncorrectAddress"
                      defaultMessage="Вы ввели не коректный адрес"
                    />
                  </div>
                )}
              </div>
              <Button
                styleName="buttonFullMargin"
                brand
                fullWidth
                disabled={isDisabled}
                onClick={this.handleSubmit}
              >
                {isShipped ? (
                  <Fragment>
                    <FormattedMessage id="customERC20_Processing" defaultMessage="Обработка ..." />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage id="customERC20_NextStep" defaultMessage="Далее" />
                  </Fragment>
                )}
              </Button>
            </Fragment>
          )}
          {step === 'confirm' && (
            <Fragment>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span style={{ fontSize: '16px' }}>
                    <FormattedMessage id="customERC20_Address" defaultMessage="Адрес контракта" />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenAddress}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span style={{ fontSize: '16px' }}>
                    <FormattedMessage
                      id="customERC20_TokenTitle"
                      defaultMessage="Название токена"
                    />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenTitle}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span style={{ fontSize: '16px' }}>
                    <FormattedMessage id="customERC20_TokenSymbol" defaultMessage="Символ токена" />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenSymbol}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span style={{ fontSize: '16px' }}>
                    <FormattedMessage
                      id="customERC20_TokenDecimals"
                      defaultMessage="Знаков после запятой"
                    />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenDecimals}</div>
              </div>
              <Button
                styleName="buttonFullMargin"
                brand
                fullWidth
                disabled={isDisabled}
                onClick={this.handleConfirm}
              >
                {isShipped ? (
                  <Fragment>
                    <FormattedMessage id="customERC20_Processing" defaultMessage="Обработка ..." />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage
                      id="customERC20_ConfirmStep"
                      defaultMessage="Добавить этот токен"
                    />
                  </Fragment>
                )}
              </Button>
            </Fragment>
          )}
          {step === 'ready' && (
            <Fragment>
              <h4 styleName="readyTitle">
                <FormattedMessage
                  id="customERC20_ReadyMessage"
                  defaultMessage="Токен успешно добавлен"
                />
              </h4>
              <Button
                styleName="buttonFullMargin"
                brand
                fullWidth
                disabled={isDisabled}
                onClick={this.handleReady}
              >
                <Fragment>
                  <FormattedMessage id="customERC20_Ready" defaultMessage="Готово" />
                </Fragment>
              </Button>
            </Fragment>
          )}
        </div>
      </Modal>
    )
  }
}
