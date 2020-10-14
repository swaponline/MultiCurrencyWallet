import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import helpers, { links, constants } from 'helpers'
import { Link } from 'react-router-dom'
import SwapApp from 'swap.app'

import Avatar from 'components/Avatar/Avatar'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { RemoveButton } from 'components/controls'

import Pair from './../../Pair'
import PAIR_TYPES from 'helpers/constants/PAIR_TYPES'
import RequestButton from '../RequestButton/RequestButton'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import { BigNumber } from 'bignumber.js'


@injectIntl
@connect(({
  pubsubRoom: { peer },
  user,
}) => ({
  currenciesData: user,
  peer,
}))

@cssModules(styles)
export default class Row extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      balance: 0,
      windowWidth: 0,
      isFetching: false,
      enterButton: false,
      estimatedFeeValues: {},
    }

    constants.coinsWithDynamicFee
      .forEach(item => this.state.estimatedFeeValues[item] = constants.minAmountOffer[item])
  }

  componentDidMount() {
    const { estimatedFeeValues } = this.state
    window.addEventListener('resize', this.renderContent)
    this.renderContent()
    this.getEstimateFee(estimatedFeeValues)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.renderContent)
    actions.modals.close(constants.modals.Confirm)
  }

  componentWillMount() {
    const { row: { sellCurrency, isMy, buyCurrency } } = this.props
    if (isMy) {
      this.checkBalance(sellCurrency)
    } else {
      this.checkBalance(buyCurrency)
    }
  }

  getEstimateFee = async (estimatedFeeValues) => {
    const fee = await helpers.estimateFeeValue.setEstimatedFeeValues({ estimatedFeeValues })
    this.setState(() => ({ estimatedFeeValues: fee }))
  }

  checkBalance = async (currency) => {
    currency = currency.toLowerCase()

    let balance

    const isCurrencyEthOrEthToken = helpers.ethToken.isEthOrEthToken({ name: currency })
    const isCurrencyEthToken = helpers.ethToken.isEthToken({ name: currency })

    if (isCurrencyEthOrEthToken) {
      if (isCurrencyEthToken) {
        balance = await actions.token.getBalance(currency)
      } else {
        balance = await actions.eth.getBalance(currency)
      }
    } else {
      const { currenciesData } = this.props

      const unspents = await actions[currency].fetchUnspents(currenciesData[`${currency}Data`].address)
      const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
      balance = BigNumber(totalUnspent).dividedBy(1e8)
    }

    this.setState({
      balance,
    })
  }

  checkDeclineOrders = (orderId, currency) => {
    const { decline } = this.props

    if (decline.length === 0) {
      this.sendRequest(orderId, currency)
    } else {
      const getDeclinedExistedSwapIndex = helpers.handleGoTrade.getDeclinedExistedSwapIndex({ currency, decline })
      if (getDeclinedExistedSwapIndex !== false) {
        this.handleDeclineOrdersModalOpen(getDeclinedExistedSwapIndex)
      } else {
        this.sendRequest(orderId, currency)
      }
    }
  }

  getDecimals = (amount, currency) => {
    const decimalPlaces = constants.tokenDecimals[currency.toLowerCase()] || 8
    console.log('>> getDecimals', amount, currency, decimalPlaces)
    console.log('<<', String(new BigNumber(amount).dp(decimalPlaces, BigNumber.ROUND_CEIL)))
    return String(new BigNumber(amount).dp(decimalPlaces, BigNumber.ROUND_CEIL))
  }

  handleDeclineOrdersModalOpen = (indexOfDecline) => {
    const orders = SwapApp.shared().services.orders.items
    const declineSwap = actions.core.getSwapById(this.props.decline[indexOfDecline])

    if (declineSwap !== undefined) {
      actions.modals.open(constants.modals.DeclineOrdersModal, {
        declineSwap,
      })
    }
  }

  handleGoTrade = async (currency) => {
    const balance = await actions.eth.getBalance()
    return (balance >= 0.005)
  }

  sendRequest = async (orderId, currency) => {
    const {
      row: {
        id,
        buyAmount,
        buyCurrency,
        sellCurrency,
      },
      row,
      intl,
      history,
    } = this.props

    const pair = Pair.fromOrder(row)
    const { price, amount, total, main, base, type } = pair

    const { address, balance } = actions.core.getWallet({ currency: buyCurrency })

    let checkAmount = buyAmount

    const ethFee = BigNumber(
      await helpers.eth.estimateFeeValue({ method: 'swap' })
    ).toNumber()

    const btcFee = BigNumber(
      await helpers.btc.estimateFeeValue({ method: 'swap' })
    ).toNumber()

    if (buyCurrency === 'ETH') {
      checkAmount = BigNumber(checkAmount).plus(ethFee).toNumber()
    }

    let ethBalanceOk = true

    const isSellToken = helpers.ethToken.isEthToken( { name: sellCurrency } )
    const { balance: ethBalance }  = actions.core.getWallet({ currency: 'ETH' })

    let balanceIsOk = true
    if (
      isSellToken
      && (
        balance < checkAmount
        || ethBalance < ethFee
      )
    ) balanceIsOk = false


    if (sellCurrency === 'BTC'
      && !isSellToken
      && balance < checkAmount
    ) balanceIsOk = false

    if (!balanceIsOk) {
      const alertMessage = (
        <Fragment>
          <FormattedMessage
            id="AlertOrderNonEnoughtBalance"
            defaultMessage="Please top up your balance before you start the swap."
          />
          <br />
          {isSellToken && (
            <FormattedMessage
              id="Swap_NeedEthFee"
              defaultMessage="На вашем балансе должно быть не менее {ethFee} ETH и {btcFee} BTC для оплаты коммисии майнера"
              values={{
                ethFee,
                btcFee,
              }}
            />
          )}
          {!isSellToken && (
            <FormattedMessage
              id="Swap_NeedMoreAmount"
              defaultMessage="На вашем балансе должно быть не менее {amount} {currency}. {br}Коммисия майнера {ethFee} ETH и {btcFee} BTC"
              values={{
                amount: checkAmount,
                currency: buyCurrency,
                ethFee,
                btcFee,
                br: <br />,
              }}
            />
          )}
        </Fragment>
      )
      actions.modals.open(constants.modals.AlertWindow, {
        title: <FormattedMessage
          id="AlertOrderNonEnoughtBalanceTitle"
          defaultMessage="Not enough balance."
        />,
        message: alertMessage,
        canClose: true,
        currency: buyCurrency,
        address,
        actionType: 'deposit',
      })
      return
    }

    const exchangeRates = new BigNumber(price).dp(6, BigNumber.ROUND_CEIL)

    const messages = defineMessages({
      sell: {
        id: 'ordersRow97',
        defaultMessage: 'sell',
      },
      buy: {
        id: 'ordersRow101',
        defaultMessage: 'buy',
      },
    })

    actions.modals.open(constants.modals.ConfirmBeginSwap, {
      order: this.props.row,
      onAccept: async (customWallet) => {
        const check = await this.handleGoTrade(currency)

        this.setState({ isFetching: true })

        setTimeout(() => {
          this.setState(() => ({ isFetching: false }))
        }, 15 * 1000)

        const destination = {}
        if (customWallet !== null) {
          destination.address = customWallet
        }

        actions.core.sendRequest(orderId, destination, (isAccepted) => {
          console.log(`user has ${isAccepted ? 'accepted' : 'declined'} your request`)

          if (isAccepted) {
            this.setState({ isFetching: false }, () => {
              history.push(localisedUrl(intl.locale, `${links.swap}/${buyCurrency}-${sellCurrency}/${id}`))
            })
          } else {
            this.setState({ isFetching: false })
          }
        })
        actions.core.updateCore()
      },
      message: (
        <FormattedMessage
          id="ordersRow134"
          defaultMessage="Do you want to {action} {amount} {main} for {total} {base} at price {price} {main}/{base}?"
          values={{
            action: `${type === PAIR_TYPES.BID
              ? intl.formatMessage(messages.sell)
              : intl.formatMessage(messages.buy)
            }`,
            amount: `${this.getDecimals(amount, main)}`,
            main: `${main}`,
            total: `${this.getDecimals(total, base)}`,
            base: `${base}`,
            price: `${exchangeRates}`,
          }}
        />
      ),
    })
  }

  renderWebContent() {
    const { balance, isFetching, estimatedFeeValues } = this.state
    const {
      peer,
      orderId,
      row: {
        id,
        isMy,
        buyAmount,
        buyCurrency,
        isRequested,
        isProcessing,
        sellCurrency,
        owner: { peer: ownerPeer },
      },
      removeOrder,
      intl: { locale },
    } = this.props

    const pair = Pair.fromOrder(this.props.row)
    const { price, amount, total, main, base, type } = pair

    const amountOnWatch = BigNumber(estimatedFeeValues[buyCurrency.toLowerCase()]).isGreaterThan(0) ?
      BigNumber(balance).minus(estimatedFeeValues[buyCurrency.toLowerCase()]).minus(0.00000600).toString()
      : balance

    return (
      <tr style={orderId === id ? { background: 'rgba(0, 236, 0, 0.1)' } : {}}>
        <td>
          <Avatar
            value={ownerPeer}
            size={30}
          />
        </td>
        <td>
          <span style={{ color: 'gray' }}>
            {type === PAIR_TYPES.BID ? 'buys' : 'sells'}
          </span>
          {' '}
          {
            `${this.getDecimals(amount, main)} ${main}`
          }
        </td>
        <td>
          <span style={{ color: 'gray' }}>
            <FormattedMessage
              id="Row1511"
              defaultMessage={`at price {price}`}
              values={{
                price: `${this.getDecimals(price, base)} ${base}`,
              }} />
          </span>
        </td>
        <td>
          <span style={{ color: 'gray' }}>
            <FormattedMessage
              id="Row159"
              defaultMessage={`for {total}`}
              values={{
                total: `${this.getDecimals(total, base)} ${base}`,
              }}
            />
          </span>
        </td>
        <td>
          {peer === ownerPeer
            ?
            <RemoveButton onClick={() => removeOrder(id)} />
            :
            <Fragment>
              {
                isRequested ? (
                  <Fragment>
                    <div style={{ color: 'red' }}>
                      <FormattedMessage id="Row148" defaultMessage="REQUESTING" />
                    </div>
                    <Link to={`${localisedUrl(locale, links.swap)}/${buyCurrency}-${sellCurrency}/${id}`}>
                      <FormattedMessage id="Row151" defaultMessage="Go to the swap" />
                    </Link>
                  </Fragment>
                ) : (
                  isProcessing ? (
                    <span>
                      <FormattedMessage id="Row157" defaultMessage="This order is in execution" />
                    </span>
                  ) : (
                    isFetching ? (
                      <Fragment>
                        <InlineLoader />
                        <br />
                        <span>
                          <FormattedMessage id="Row165" defaultMessage="Please wait while we confirm your request" />
                        </span>
                      </Fragment>
                    ) : (
                      <RequestButton
                        disabled={BigNumber(amountOnWatch).isGreaterThanOrEqualTo(buyAmount)}
                        onClick={() => this.checkDeclineOrders(id, isMy ? sellCurrency : buyCurrency)}
                        data={{ type, amount, main, total, base }}
                      >
                        <FormattedMessage id="RowM166" defaultMessage="Start" />
                      </RequestButton>
                    )
                  )
                )
              }
            </Fragment>
          }
        </td>
      </tr>
    )
  }
  renderMobileContent() {
    const { balance, isFetching } = this.state
    const {
      orderId,
      row: {
        id,
        buyCurrency,
        sellCurrency,
        isMy,
        buyAmount,
        sellAmount,
        isRequested,
        isProcessing,
        owner: { peer: ownerPeer },
      },
      removeOrder,
      peer,
    } = this.props

    const pair = Pair.fromOrder(this.props.row)

    const { amount, total, main, base, type } = pair

    const formatCrypto = (value, currency) => {
      if (currency === 'USDT' || currency == 'EUR') {
        return String(value.toFixed(2))
      } else {
        if (Number(value) > 10) {
          return String(value.toFixed(5))
        } else {
          return String(value.toFixed(8))
        }
      }t
    }

    return (
      <tr
        styleName={peer === ownerPeer ? 'mobileRowRemove' : 'mobileRowStart'}
        style={orderId === id ? { background: 'rgba(0, 236, 0, 0.1)' } : {}}
      >
        <td>
          <div styleName="bigContainer">
            <div styleName="tdContainer-1">
              <span styleName="firstType">
                {type === PAIR_TYPES.BID
                  ? (<FormattedMessage id="RowMobileFirstTypeYouHave" defaultMessage="You have" />)
                  : (<FormattedMessage id="RowMobileFirstTypeYouGet" defaultMessage="You get" />)}
              </span>
              <span>{`${formatCrypto(amount, main)} ${main}`}</span>
            </div>
            <div>
              <i className="fas fa-exchange-alt" />
            </div>
            <div styleName="tdContainer-2">
              <span styleName="secondType">
                {type === PAIR_TYPES.BID
                  ? (<FormattedMessage id="RowMobileSecondTypeYouGet" defaultMessage="You get" />)
                  : (<FormattedMessage id="RowMobileSecondTypeYouHave" defaultMessage="You have" />)}
              </span>
              <span>{`${formatCrypto(total, base)} ${base}`}</span>
            </div>
            <div styleName="tdContainer-3">
              {
                peer === ownerPeer ? (
                  <RemoveButton onClick={() => removeOrder(id)} />
                ) : (
                  <Fragment>
                    {
                      isRequested ? (
                        <Fragment>
                          <div style={{ color: 'red' }}>
                            <FormattedMessage id="RowM136" defaultMessage="REQUESTING" />
                          </div>
                          <Link to={`${links.swap}/${buyCurrency}-${sellCurrency}/${id}`}>
                            <FormattedMessage id="RowM139" defaultMessage="Go to the swap" />
                          </Link>
                        </Fragment>
                      ) : (
                        isProcessing ? (
                          <span>
                            <FormattedMessage id="RowM145" defaultMessage="This order is in execution" />
                          </span>
                        ) : (
                          isFetching ? (
                            <Fragment>
                              <InlineLoader />
                              <br />
                              <span>
                                <FormattedMessage id="RowM153" defaultMessage="Please wait while we confirm your request" />
                              </span>
                            </Fragment>
                          ) : (
                            <RequestButton
                              styleName="startButton"
                              disabled={balance >= Number(buyAmount)}
                              onClick={() => this.sendRequest(id, isMy ? sellCurrency : buyCurrency)}
                              data={{ type, amount, main, total, base }}
                            />
                          )
                        )
                      )
                    }
                  </Fragment>
                )
              }
            </div>
          </div>
        </td>
      </tr>
    )
  }

  renderContent = () => {
    let windowWidthIn = window.innerWidth
    this.setState({ windowWidth: windowWidthIn })
  }

  render() {
    const { windowWidth } = this.state;
    let mobileBreakpoint = 800

    return windowWidth < mobileBreakpoint ? this.renderMobileContent() : this.renderWebContent()
  }
}
