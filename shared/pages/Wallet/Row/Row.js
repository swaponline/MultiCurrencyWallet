import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { constants, links } from 'helpers'
import config from 'app-config'
import { isMobile } from 'react-device-detect'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'

import Coin from 'components/Coin/Coin'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import BtnTooltip from 'components/controls/WithdrawButton/BtnTooltip'

import LinkAccount from '../LinkAccount/LinkAcount'
import { withRouter } from 'react-router'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from 'react-intl'


@injectIntl
@withRouter
@connect(
  ({
    user: { ethData, btcData, bchData, tokensData, eosData, telosData, nimData, usdtData, ltcData },
    currencies: { items: currencies },
  }, { currency }) => ({
    currencies,
    item: [
      btcData,
      ethData,
      eosData,
      telosData,
      bchData,
      ltcData,
      usdtData,
      ...Object.keys(tokensData).map(k => (tokensData[k])),
    ].map(({ account, keyPair, ...data }) => ({
      ...data,
    })).find((item) => item.currency === currency),
  })
)

@cssModules(styles, { allowMultiple: true })
export default class Row extends Component {

  state = {
    isBalanceFetching: false,
    viewText: false,
    tradeAllowed: false,
    isAddressCopied: false,
    isTouch: false,
    isBalanceEmpty: true,
  }

  static getDerivedStateFromProps({ item: { balance } }) {
    return {
      isBalanceEmpty: balance === 0,
    }
  }
  constructor(props) {
    super(props)
    const { currency, currencies } = this.props

    this.state.tradeAllowed = !!currencies.find(c => c.value === currency.toLowerCase())
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleSliceAddress)
  }

  componentDidMount() {
    const { hiddenCoinsList } = this.props

    window.addEventListener('resize', this.handleSliceAddress)

    Object.keys(config.erc20)
      .forEach(name => {
        if (!hiddenCoinsList.includes(name.toUpperCase())) {
          actions.core.markCoinAsVisible(name.toUpperCase())
        }
      })
  }
  componentDidUpdate() {
    const { item } = this.props
    if (item.balance > 0) {
      actions.analytics.balanceEvent(item.currency, item.balance)
    }
  }
  handleReloadBalance = async () => {
    const { isBalanceFetching } = this.state

    if (isBalanceFetching) {
      return null
    }

    this.setState({
      isBalanceFetching: true,
    })

    const { item: { currency } } = this.props

    await actions[currency.toLowerCase()].getBalance(currency.toLowerCase())

    this.setState(() => ({
      isBalanceFetching: false,
    }))
  }
  shouldComponentUpdate(nextProps, nextState) {
    const getComparableProps = ({ item, index, selectId }) => ({
      item,
      index,
      selectId,
    })
    return JSON.stringify({
      ...getComparableProps(nextProps),
      ...nextState,
    }) !== JSON.stringify({
      ...getComparableProps(this.props),
      ...this.state,
    })
  }
  handleTouch = (e) => {
    this.setState({
      isTouch: true,
    })
  }
  handleSliceAddress = () => {
    const {
      item: {
        address,
      },
    } = this.props
    let firstPart = address.substr(0, 6)
    let secondPart = address.substr(address.length - 2)
    return (window.innerWidth < 1120 || isMobile) ? `${firstPart}...${secondPart}` : address
  }

  handleTouchClear = (e) => {
    this.setState({
      isTouch: false,
    })
  }

  handleCopyAddress = () => {
    this.setState({
      isAddressCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isAddressCopied: false,
        })
      }, 500)
    })
  }

  handleEosRegister = () => {
    actions.modals.open(constants.modals.EosRegister, {})
  }

  handleTelosRegister = () => {
    actions.modals.open(constants.modals.TelosRegister, {})
  }

  handleEosBuyAccount = async () => {
    actions.modals.open(constants.modals.EosBuyAccount)
  }

  handleWithdraw = () => {
    const {
      item: {
        decimals,
        token,
        contractAddress,
        unconfirmedBalance,
        currency,
        address,
        balance,
      },
    } = this.props

    actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    actions.modals.open(constants.modals.Withdraw, {
      currency,
      address,
      contractAddress,
      decimals,
      token,
      balance,
      unconfirmedBalance,
    })
  }

  handleReceive = () => {
    const { currency, address } = this.props

    actions.modals.open(constants.modals.ReceiveModal, {
      currency,
      address,
    })
  }

  handleShowOptions = () => {
    this.setState({
      showMobileButtons: true,
    })
  }

  handleGoTrade = (currency) => {
    const { intl: { locale } } = this.props
    this.props.history.push(`/${locale}/${currency.toLowerCase()}`)
  }

  handleMarkCoinAsHidden = (coin) => {
    actions.core.markCoinAsHidden(coin)
  }

  render() {
    const {
      isBalanceFetching,
      tradeAllowed,
      isAddressCopied,
      isTouch,
      isBalanceEmpty,
    } = this.state
    const {
      item: {
        currency,
        balance,
        isBalanceFetched,
        address,
        fullName,
        unconfirmedBalance,
        contractAddress,
      },
    } = this.props

    const eosAccountActivated = localStorage.getItem(constants.localStorage.eosAccountActivated) === "true"
    const telosAccountActivated = localStorage.getItem(constants.localStorage.telosAccountActivated) === "true"

    return (
      <tr
        styleName={this.props.index === this.props.selectId || !isMobile ? 'showButtons' : 'hidden'}
        onClick={() => { this.props.handleSelectId(this.props.index) }}
        onTouchEnd={this.handleTouchClear}
        onTouchMove={this.handleTouch}
        style={isTouch && this.props.index !== this.props.selectId ?  { background: '#f5f5f5' } : { background: '#fff' }}
      >
        <td>
          <Link to={`/${locale}/${fullName}-wallet`} title={`Online ${fullName} wallet`}>
            <Coin name={currency} />
          </Link>
        </td>
        <td>
          <Link to={`/${locale}/${fullName}-wallet`} title={`Online ${fullName} wallet`}>
            {fullName}
          </Link>
        </td>
        <td styleName="table_balance-cell">
          {
            !isBalanceFetched || isBalanceFetching ? (
              <InlineLoader />
            ) : (
              <div styleName="no-select-inline" onClick={this.handleReloadBalance} >
                <i className="fas fa-sync-alt" styleName="icon" />
                <span>{String(balance).length > 4 ? balance.toFixed(4) : balance}{' '}{currency}</span>
                { currency === 'BTC' && unconfirmedBalance !== 0 && (
                  <Fragment>
                    <br />
                    <span styleName="unconfirmedBalance">
                      <FormattedMessage id="RowWallet181" defaultMessage="Unconfirmed" />
                      {unconfirmedBalance} {' '}
                    </span>
                  </Fragment>
                ) }
                { currency === 'LTC' && unconfirmedBalance !== 0 && (
                  <Fragment>
                    <br />
                    <span styleName="unconfirmedBalance">
                      <FormattedMessage id="RowWallet189" defaultMessage="Unconfirmed" />
                      {unconfirmedBalance}
                    </span>
                  </Fragment>
                ) }
                { currency === 'USDT' && unconfirmedBalance !== 0 && (
                  <Fragment>
                    <br />
                    <span styleName="unconfirmedBalance">
                      <FormattedMessage id="RowWallet197" defaultMessage="Unconfirmed" />
                      {unconfirmedBalance}
                    </span>
                  </Fragment>
                ) }
              </div>
            )
          }
          <span styleName="mobileName">{fullName}</span>
        </td>
        <Fragment>
          <CopyToClipboard text={address} onCopy={this.handleCopyAddress}>
            <td styleName={currency === 'EOS' && !eosAccountActivated ? 'yourAddressWithOptions' : 'yourAddress'}>
              {
                !contractAddress ? (
                  <div styleName="notContractAddress">
                    {
                      address !== '' && <i className="far fa-copy" styleName="icon" data-tip data-for="Copy" style={{ width: '14px' }} />
                    }
                    <LinkAccount type={currency} address={address}>{this.handleSliceAddress()}</LinkAccount>
                    <ReactTooltip id="Copy" type="light" effect="solid">
                      <span>
                        <FormattedMessage id="Row235" defaultMessage="Copy" />
                      </span>
                    </ReactTooltip>
                    { currency === 'EOS' && !eosAccountActivated && (
                      <Fragment>
                        <br />
                        <span styleName="notActiveLink">
                          <FormattedMessage id="Row268" defaultMessage="not activated" />
                        </span>
                      </Fragment>
                    )
                    }
                    { currency === 'TLOS' && !telosAccountActivated && (
                      <Fragment>
                        <br />
                        <span styleName="notActiveLink">
                          <FormattedMessage id="Row277" defaultMessage="not activated" />
                        </span>
                      </Fragment>
                    )
                    }
                  </div>
                ) : (
                  <Fragment>
                    <i className="far fa-copy" styleName="icon" data-tip data-for="Copy" style={{ width: '14px' }} />
                    <LinkAccount type={currency} contractAddress={contractAddress} address={address} >{this.handleSliceAddress()}</LinkAccount>
                  </Fragment>
                )
              }
              <ReactTooltip id="Use" type="light" effect="solid">
                <span>
                  <FormattedMessage id="Row268" defaultMessage="Login with your existing eos account" />
                </span>
              </ReactTooltip>
              { isAddressCopied &&
                <p styleName="copied" >
                  <FormattedMessage id="Row293" defaultMessage="Address copied to clipboard" />
                </p>
              }
              <div styleName="activeControlButtons">
                <div styleName="actButton">
                  {currency === 'EOS' && !eosAccountActivated &&
                    <button styleName="button buttonActivate" onClick={this.handleEosBuyAccount} data-tip data-for="Activate">
                      <FormattedMessage id="Row293" defaultMessage="Activate" />
                    </button>
                  }
                </div>
                <ReactTooltip id="Activate" type="light" effect="solid">
                  <span>
                    <FormattedMessage id="Row256" defaultMessage="Buy this account" />
                  </span>
                </ReactTooltip>
                <div styleName="useButton">
                  {
                    currency === 'EOS' &&
                    <button styleName="button buttonUseAnother" onClick={this.handleEosRegister} data-tip data-for="Use">
                      <FormattedMessage id="Row263" defaultMessage="Use another" />
                    </button>
                  }
                </div>
                <ReactTooltip id="Use" type="light" effect="solid">
                  <span>
                    <FormattedMessage id="Row268" defaultMessage="Login with your existing eos account" />
                  </span>
                </ReactTooltip>
              </div>
            </td>
          </CopyToClipboard>
        </Fragment>
        <td>
          <div styleName={currency === 'EOS' && !eosAccountActivated ? 'notActivated' : ''}>
            <button onClick={this.handleReceive} styleName="button" data-tip data-for={`deposit${currency}`}>
              <i className="fas fa-qrcode" />
              <span>
                <FormattedMessage id="Row313" defaultMessage="Deposit" />
              </span>
            </button>
            <ReactTooltip id={`deposit${currency}`} type="light" effect="solid">
              <FormattedMessage id="WithdrawButton29" defaultMessage="Deposit funds to this address of currency wallet" />
            </ReactTooltip>
            <BtnTooltip onClick={this.handleWithdraw} disable={isBalanceEmpty} id={currency} >
              <i className="fas fa-arrow-alt-circle-right" />
              <FormattedMessage id="Row328" defaultMessage="Send" />
            </BtnTooltip>
            {
              tradeAllowed && (
                <BtnTooltip onClick={() => this.handleGoTrade(currency)} disable={isBalanceEmpty} id={currency} >
                  <i className="fas fa-exchange-alt" />
                  <FormattedMessage id="Row334" defaultMessage="Exchane" />
                </BtnTooltip>
              )
            }
          </div>
        </td>
      </tr>
    )
  }
}
