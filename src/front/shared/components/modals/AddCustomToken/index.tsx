import React, { Fragment } from 'react'
import request from 'common/utils/request'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './index.scss'

import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import { constants } from 'helpers'
import typeforce from 'swap.app/util/typeforce'
import Web3 from 'web3'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type CustomTokenProps = {
  name: string
  style: IUniversalObj
  intl: IUniversalObj
  data: {
    api: string
    apiKey: string
    standard: string
  }
}

type CustomTokenState = {
  explorerApi: string
  explorerApiKey: string
  step: string
  tokenStandard: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  tokenDecimals: number
  baseCurrency: string
  notFound: boolean
  isPending: boolean
}

const nameSignature = '0x06fdde03'
const decimalsSignature = '0x313ce567'
const symbolSignature = '0x95d89b41'

@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class AddCustomToken extends React.Component<CustomTokenProps, CustomTokenState> {
  constructor(props) {
    super(props)

    const { data } = props

    this.state = {
      step: 'enterAddress',
      explorerApi: data.api,
      explorerApiKey: data.apiKey,
      tokenStandard: data.standard.toLowerCase(),
      baseCurrency: data.baseCurrency,
      tokenAddress: '',
      tokenName: '',
      tokenSymbol: '',
      tokenDecimals: 0,
      notFound: false,
      isPending: false,
    }
  }

  getExplorerApiUrl = (params) => {
    const { explorerApi, explorerApiKey } = this.state
    const { address, signature } = params

    return ''.concat(
      `${explorerApi}?module=proxy&action=eth_call`,
      `&to=${address}`,
      `&data=${signature}&tag=latest`,
      `&apikey=${explorerApiKey}`,
    )
  }

  async getName(address) {
    const response: any = await request.get(this.getExplorerApiUrl({
      signature: nameSignature,
      address,
    }))
    const hexSymbol = response.result
    const symbol = Web3.utils.toUtf8(hexSymbol)

    return symbol.replace(/\W/g, '')
  }

  async getSymbol(address) {
    const response: any = await request.get(this.getExplorerApiUrl({
      signature: symbolSignature,
      address,
    }))
    const hexSymbol = response.result
    const symbol = Web3.utils.toUtf8(hexSymbol)

    return symbol.replace(/\W/g, '')
  }

  async getDecimals(address) {
    const response: any = await request.get(this.getExplorerApiUrl({
      signature: decimalsSignature,
      address,
    }))
    const hexDecimals = response.result
    const decimals = Web3.utils.hexToNumber(hexDecimals)

    return decimals
  }

  handleSubmit = async () => {
    const { tokenAddress } = this.state

    this.setState({
      isPending: true,
    })

    const tokenName = await this.getName(tokenAddress)
    const tokenSymbol = await this.getSymbol(tokenAddress)
    const tokenDecimals = await this.getDecimals(tokenAddress)

    if (tokenSymbol) {
      this.setState({
        tokenName,
        tokenSymbol,
        tokenDecimals,
        step: 'confirm',
        isPending: false,
      })
    } else {
      this.setState({
        notFound: true,
        isPending: false,
      })
      setTimeout(() => {
        this.setState({
          notFound: false,
        })
      }, 4000)
    }
  }

  handleConfirm = async () => {
    const { tokenStandard, tokenAddress, tokenSymbol, tokenDecimals, baseCurrency } = this.state
    actions[tokenStandard].addToken({
      standard: tokenStandard,
      contractAddr: tokenAddress,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      baseCurrency: baseCurrency.toLowerCase(),
    })
    actions.core.markCoinAsVisible(`{${baseCurrency.toUpperCase()}}${tokenSymbol.toUpperCase()}`, true)

    this.setState({
      step: 'ready',
    })
  }

  handleReady = async () => {
    window.location.reload()
  }

  addressIsCorrect() {
    const { tokenAddress, baseCurrency } = this.state

    return typeforce.isCoinAddress[baseCurrency.toUpperCase()](tokenAddress)
  }

  handleError = (err) => {
    console.error(err)
  }

  render() {
    const {
      step,
      tokenStandard,
      tokenAddress,
      tokenName,
      tokenSymbol,
      tokenDecimals,
      isPending,
      notFound,
    } = this.state

    const {
      name,
      intl,
    } = this.props

    const linked = Link.all(this, 'tokenAddress')

    const isDisabled = !tokenAddress || isPending || !this.addressIsCorrect()

    const localeLabel = defineMessages({
      title: {
        id: 'customERC20_Title',
        defaultMessage: 'Add a new token',
      },
      addressPlaceholder: {
        id: 'customERC20_addressPlaceholder',
        defaultMessage: 'Enter token address',
      },
    })

    return (
      //@ts-ignore: strictNullChecks
      <Modal
        name={name}
        title={`${intl.formatMessage(localeLabel.title)}`}
      >
        <div styleName={`stepsWrapper ${isDark ? 'dark' : ''}`}>
          {step === 'enterAddress' && (
            <Fragment>
              <div styleName="highLevel">
                <FieldLabel inRow>
                  <span style={{ fontSize: '16px' }}>
                    <FormattedMessage
                      id="customTokenAddress"
                      defaultMessage="Token address"
                    />
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
                      id="customTokenNotFound"
                      defaultMessage="This is not {standard} address"
                      values={{
                        standard: tokenStandard
                      }}
                    />
                  </div>
                )}
                {tokenAddress && !this.addressIsCorrect() && (
                  <div styleName="rednote">
                    <FormattedMessage
                      id="customTokenIncorrectAddress"
                      defaultMessage="Invalid address"
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
                pending={isPending}
              >
                <FormattedMessage id="NextId" defaultMessage="Nеxt" />
              </Button>
            </Fragment>
          )}
          {step === 'confirm' && (
            <Fragment>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage
                      id="customTokenAddress"
                      defaultMessage="Token address"
                    />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenAddress}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage id="TitleId" defaultMessage="Title" />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenName}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage id="SymbolId" defaultMessage="Symbol" />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenSymbol}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage id="DecimalsId" defaultMessage="Decimals" />
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
                pending={isPending}
              >
                <FormattedMessage
                  id="customTokenConfirm"
                  defaultMessage="Add this token"
                />
              </Button>
            </Fragment>
          )}
          {step === 'ready' && (
            <Fragment>
              <h4 styleName="readyTitle">
                <FormattedMessage
                  id="customTokenAdded"
                  defaultMessage="Token added successfully"
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
                  <FormattedMessage id="SweepBannerButton" defaultMessage="Done" />
                </Fragment>
              </Button>
            </Fragment>
          )}
        </div>
      </Modal>
    )
  }
}

export default injectIntl(AddCustomToken)
