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
    const { tokenAddress } = this.state

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
    const { tokenAddress, tokenSymbol, tokenDecimals } = this.state
    actions.token.AddCustomERC20(tokenAddress, tokenSymbol, tokenDecimals)
    actions.core.markCoinAsVisible(tokenSymbol.toUpperCase(), true)

    this.setState({
      step: 'ready',
    })
  }

  handleReady = async () => {
    window.location.reload()
  }

  addressIsCorrect() {
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
    } = this.state

    const {
      name,
      intl,
    } = this.props

    const linked = Link.all(this, 'tokenAddress')

    const isDisabled = !tokenAddress || isShipped || !this.addressIsCorrect()

    const localeLabel = defineMessages({
      title: {
        id: 'customERC20_Title',
        defaultMessage: 'Add new ERC20',
      },
      addressPlaceholder: {
        id: 'customERC20_addressPlaceholder',
        defaultMessage: 'Enter token address',
      },
    })

    return (
      /*
      //@ts-ignore*/
      <Modal
        name={name}
        title={`${intl.formatMessage(localeLabel.title)}`}
      >
        <div styleName="erc20ModalHolder">
          {step === 'enterAddress' && (
            <Fragment>
              <div styleName="highLevel">
                <FieldLabel inRow>
                  <span style={{ fontSize: '16px' }}>
                    <FormattedMessage id="customERC20_Address" defaultMessage="erc20 address" />
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
                      defaultMessage="This is not ERC20 address"
                    />
                  </div>
                )}
                {tokenAddress && !this.addressIsCorrect() && (
                  <div styleName="rednote">
                    <FormattedMessage
                      id="customERC20_IncorrectAddress"
                      defaultMessage="Invalid erc20 address"
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
                    <FormattedMessage id="customERC20_Processing" defaultMessage="Processing ..." />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage id="customERC20_NextStep" defaultMessage="Nеxt" />
                  </Fragment>
                )}
              </Button>
            </Fragment>
          )}
          {step === 'confirm' && (
            <Fragment>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage id="customERC20_Address" defaultMessage="erc20 address" />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenAddress}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage
                      id="customERC20_TokenTitle"
                      defaultMessage="Title"
                    />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenTitle}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage id="customERC20_TokenSymbol" defaultMessage="Symbol" />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenSymbol}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage
                      id="customERC20_TokenDecimals"
                      defaultMessage="Decimals"
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
                    <FormattedMessage id="customERC20_Processing" defaultMessage="Processing ..." />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage
                      id="customERC20_ConfirmStep"
                      defaultMessage="Add this token"
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
                  <FormattedMessage id="customERC20_Ready" defaultMessage="Done" />
                </Fragment>
              </Button>
            </Fragment>
          )}
        </div>
      </Modal>
    )
  }
}
