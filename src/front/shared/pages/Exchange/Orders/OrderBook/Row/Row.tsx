import React, { Component, Fragment } from 'react'

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
import feedback from 'shared/helpers/feedback'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type RowProps = {
  history: { [key: string]: any }
  balances: { [key: string]: number } | boolean
  pairFees: any
  decline: any[]
  orderId: string
  linkedOrderId: number
  
  row: {
    id: string
    isMy: boolean
    buyCurrency: string
    sellCurrency: string
    buyAmount: BigNumber
    sellAmount: BigNumber
    isRequested: boolean
    isProcessing: boolean
    owner: { [key: string]: any }
  }

  removeOrder: (number) => void
  checkSwapAllow: ({}) => boolean

  currenciesData?: { [key: string]: any }
  intl?: { [key: string]: any }
  peer?: string
}

type RowState = {
  enterButton: boolean
  isFetching: boolean
  windowWidth: number
}
@injectIntl
@connect(({
  pubsubRoom: { peer },
  user,
}) => ({
  currenciesData: user,
  peer,
}))

@cssModules(styles, { allowMultiple: true })
export default class Row extends Component {
  _mounted = false

  props: RowProps
  state: RowState

  constructor(props) {
    super(props)

    this.state = {
      windowWidth: 0,
      isFetching: false,
      enterButton: false,
    }
  }

  getBalance() {
    const {
      row: {
        isMy,
        buyCurrency,
        sellCurrency,
      },
      balances,
    } = this.props

    const balanceCheckCur = (isMy) ? sellCurrency : buyCurrency

    return (balances && balances[balanceCheckCur]) ? balances[balanceCheckCur] : 0
  }

  componentDidMount() {
    this._mounted = true
    window.addEventListener('resize', this.renderContent)
    this.renderContent()
  }

  componentWillUnmount() {
    this._mounted = false
    window.removeEventListener('resize', this.renderContent)
    actions.modals.close(constants.modals.Confirm)
  }

  checkDeclineOrders = (orderId, currency) => {
    const { decline } = this.props

    if (decline.length === 0) {
      this.sendSwapRequest(orderId, currency)
    } else {
      const getDeclinedExistedSwapIndex = helpers.handleGoTrade.getDeclinedExistedSwapIndex({ currency, decline })
      if (getDeclinedExistedSwapIndex !== false) {
        this.handleDeclineOrdersModalOpen(getDeclinedExistedSwapIndex)
      } else {
        this.sendSwapRequest(orderId, currency)
      }
    }
  }

  getDecimals = (amount, currency) => {
    const decimalPlaces = constants.tokenDecimals[currency.toLowerCase()] || 8
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

  sendSwapRequest = async (orderId, currency) => {
    const {
      row: {
        id,
        buyAmount: sellAmount,
        buyCurrency: sellCurrency, // taker-maker - (maker buy - we sell)
        sellCurrency: buyCurrency, // taker-maker - (maker sell - we buy)
      },
      row,
      intl,
      history,
      pairFees,
      balances,
      checkSwapAllow,
    } = this.props

    const balance = this.getBalance()

    feedback.offers.buyPressed(`${sellCurrency}->${buyCurrency}`)

    const pair = Pair.fromOrder(row)
    const { price, amount, total, main, base, type } = pair

    if (!checkSwapAllow({
      sellCurrency,
      buyCurrency,
      amount: sellAmount,
      balance,
    })) return false

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
      order: row,
      onAccept: async (customWallet) => {
        //@ts-ignore
        feedback.offers.swapRequested(`${sellCurrency}->${buyCurrency}`)

        this.setState({ isFetching: true })

        setTimeout(() => {
          this.setState(() => ({ isFetching: false }))
        }, 15 * 1000)

        const destination = {
          address: null
        }
        if (customWallet !== null) {
          destination.address = customWallet
        }

        actions.core.sendRequest(orderId, destination, (isAccepted) => {
          console.log(`Your request is ${isAccepted ? 'accepted' : 'declined'}`)

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

  renderContent = () => {
    let windowWidthIn = window.innerWidth
    this.setState({ windowWidth: windowWidthIn })
  }

  render() {
    const {
      isFetching,
      windowWidth,
    } = this.state

    const balance = this.getBalance()

    const {
      row: {
        id,
        isMy,
        buyCurrency,
        buyAmount,
        sellCurrency,
        sellAmount,
        isRequested,
        isProcessing,
        owner: { peer: ownerPeer },
      },
      peer,
      orderId,
      removeOrder,
      linkedOrderId,
      intl: { locale },
      pairFees,
    } = this.props


    const pair = Pair.fromOrder(this.props.row)
    const { price, amount, total, main, base, type } = pair

    // todo: improve calculation much more
    const buyCurrencyFee = (
      pairFees
      && pairFees.byCoins
      && pairFees.byCoins[buyCurrency.toUpperCase()]
    ) ? pairFees.byCoins[buyCurrency.toUpperCase()].fee
      : false

    const costs = (buyCurrencyFee) ? new BigNumber(buyAmount).plus(buyCurrencyFee) : buyAmount

    let isSwapButtonEnabled = new BigNumber(balance).isGreaterThanOrEqualTo(costs)
    // @ToDo - Tokens - need eth balance for fee

    let sellCurrencyOut,
      sellAmountOut,
      getCurrencyOut,
      getAmountOut,
      priceOut

    if (type === PAIR_TYPES.BID) {
      sellCurrencyOut = base
      sellAmountOut = total
      getCurrencyOut = main
      getAmountOut = amount
      priceOut = new BigNumber(1).div(price)
    }

    if (type === PAIR_TYPES.ASK) {
      sellCurrencyOut = main
      sellAmountOut = amount
      getCurrencyOut = base
      getAmountOut = total
      priceOut = price
    }

    const mobileFormatCrypto = (value, currency) => {
      if (currency === 'USDT' || currency == 'EUR') {
        return String(value.toFixed(2))
      } else {
        if (Number(value) > 10) {
          return String(value.toFixed(5))
        } else {
          return String(value.toFixed(8))
        }
      }
    }

    const showDesktopContent = windowWidth > 800

    return showDesktopContent ? (
      <tr
        id={id}
        styleName={`${isDark ? 'rowDark' : ''}`}
        style={orderId === id ? { background: 'rgba(0, 236, 0, 0.1)' } : {}}
      >
        <td>
          <Avatar
            value={ownerPeer}
            size={30}
          />
        </td>
        <td>
          <span styleName="rowBindingText">
            <FormattedMessage
              id="OrderBookRowSells"
              defaultMessage="sells"
            />
          </span>
          <span styleName='rowAmount'>
            {`${this.getDecimals(sellAmountOut, sellCurrencyOut)} ${sellCurrencyOut}`}
          </span>
        </td>
        <td>
          <span styleName="rowBindingText">
            <FormattedMessage
              id="OrderBookRowFor"
              defaultMessage="for"
            />
          </span>
          <span styleName='rowAmount'>
            {`${this.getDecimals(getAmountOut, getCurrencyOut)} ${getCurrencyOut}`}
          </span>
        </td>
        <td>
          <span styleName="rowBindingText">
            <FormattedMessage
              id="OrderBookRowAtPrice"
              defaultMessage="at price"
            />
          </span>
          <span styleName='rowAmount'>
            {`${this.getDecimals(priceOut, getCurrencyOut)} ${getCurrencyOut}/${sellCurrencyOut}`}
          </span>
        </td>
        <td styleName="buttonsColumn">
          {peer === ownerPeer
            ?
            <RemoveButton className="removeButton" onClick={() => removeOrder(id)} />
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
                        disabled={!isSwapButtonEnabled}
                        onClick={isSwapButtonEnabled ?
                          () => this.checkDeclineOrders(id, isMy ? sellCurrency : buyCurrency)
                          :
                          () => {}
                        }
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
    : /* mobile content */
    (
      <tr
        id={id}
        styleName={`
          ${peer === ownerPeer ? 'mobileRowRemove' : 'mobileRowStart'}
          ${isDark ? 'rowDark' : ''}
        `}
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
              <span styleName='rowAmount'>{`${mobileFormatCrypto(amount, main)} ${main}`}</span>
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
              <span styleName='rowAmount'>{`${mobileFormatCrypto(total, base)} ${base}`}</span>
            </div>
            <div styleName="tdContainer-3">
              {
                peer === ownerPeer ? (
                  <RemoveButton className="removeButton" onClick={() => removeOrder(id)} />
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
                            //@ts-ignore
                            <RequestButton
                              styleName="startButton"
                              disabled={!isSwapButtonEnabled}
                              onClick={isSwapButtonEnabled ?
                                () => this.sendSwapRequest(id, isMy ? sellCurrency : buyCurrency)
                                :
                                () => {}
                              }
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
}
