import React, { Component, Fragment } from 'react'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import cssModules from 'react-css-modules'
import { Link } from 'react-router-dom'
import { connect } from 'redaction'
import actions from 'redux/actions'
import styles from './Row.scss'

import helpers, { links, constants, ethToken } from 'helpers'
import { IPairFees } from 'helpers/getPairFees'
import PAIR_TYPES from 'helpers/constants/PAIR_TYPES'
import { localisedUrl } from 'helpers/locale'
import feedback from 'helpers/feedback'
import { BigNumber } from 'bignumber.js'

import Avatar from 'components/Avatar/Avatar'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { RemoveButton } from 'components/controls'
import TurboIcon from 'components/ui/TurboIcon/TurboIcon'

import Pair from './../../Pair'
import RequestButton from '../RequestButton/RequestButton'
import SwapApp from 'swap.app'


const isDark = localStorage.getItem(constants.localStorage.isDark)

type RowProps = {
  history: IUniversalObj
  balances: { [key: string]: number } | boolean
  pairFees: IPairFees
  decline: any[]
  orderId: string
  linkedOrderId: string
  
  row: {
    id: string
    isMy: boolean
    isTurbo: boolean
    buyCurrency: string
    sellCurrency: string
    buyAmount: BigNumber
    sellAmount: BigNumber
    isRequested: boolean
    isProcessing: boolean
    owner: IUniversalObj
  }

  removeOrder: (number) => void
  checkSwapAllow: ({}) => boolean

  currenciesData?: IUniversalObj
  intl?: IUniversalObj
  peer?: string

  buy?: string
  sell?: string
}

type RowState = {
  enterButton: boolean
  isFetching: boolean
  windowWidth: number
}

@connect(({
  pubsubRoom: { peer },
  user,
}) => ({
  currenciesData: user,
  peer,
}))

@cssModules(styles, { allowMultiple: true })
class Row extends Component<RowProps, RowState> {
  _mounted = false

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

    let balanceCheckCur = isMy ? sellCurrency : buyCurrency

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

    return decimalPlaces > 8
      ? String(new BigNumber(amount).dp(8, BigNumber.ROUND_CEIL))
      : String(new BigNumber(amount).dp(decimalPlaces, BigNumber.ROUND_CEIL))
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
        //sellAmount,
      },
      buy: buyCurrency,
      sell: sellCurrency,
      row,
      intl,
      history,
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
              const swapUri = row.isTurbo ?
                `${links.turboSwap}/${id}`
                :
                `${links.atomicSwap}/${id}`
              
              console.log(`Redirect to swap: ${swapUri}`)
              history.push(localisedUrl(intl.locale, swapUri))
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

    const {
      row: {
        id,
        isMy,
        isTurbo,
        buyCurrency,
        buyAmount,
        sellCurrency,
        isRequested,
        isProcessing,
        owner: { peer: ownerPeer },
      },
      buy,
      sell,
      row: order,
      peer,
      orderId,
      removeOrder,
      linkedOrderId,
      checkSwapAllow,
    } = this.props

    const pair = Pair.fromOrder(this.props.row)
    const { price, amount, total, main, base, type } = pair

    const isSwapButtonEnabled = checkSwapAllow({
      sellCurrency: sell,
      buyCurrency: buy,
      amount: buyAmount,
      isSilentError: true,
    })

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

    const swapUri = `${links.atomicSwap}/${id}`

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
        styleName={`
          ${isDark ? 'rowDark' : ''}
          ${id === linkedOrderId ? 'linkedOrderHighlight' : ''}
        `}
        style={orderId === id ? { background: 'rgba(0, 236, 0, 0.1)' } : {}}
      >
        <td styleName='rowCell'>
          <div styleName='withIcon'>
            <Avatar
              value={ownerPeer}
              size={30}
            />
            {isTurbo &&
              <TurboIcon />
            }
          </div>
        </td>
        <td styleName='rowCell'>
          <span styleName='rowAmount'>
            {`${this.getDecimals(sellAmountOut, sellCurrencyOut)} ${sellCurrencyOut}`}
          </span>
        </td>
        <td styleName='rowCell'>
          <span styleName='rowAmount'>
            {`${this.getDecimals(getAmountOut, getCurrencyOut)} ${getCurrencyOut}`}
          </span>
        </td>
        <td styleName='rowCell'>
          <span styleName='rowAmount'>
            {`${this.getDecimals(priceOut, getCurrencyOut)} ${getCurrencyOut}/${sellCurrencyOut}`}
          </span>
        </td>
        <td styleName='rowCell'>
          {peer === ownerPeer
            ? <RemoveButton onClick={() => removeOrder(id)} brand={true} />
            :
            <Fragment>
              {
                isRequested ? (
                  <Fragment>
                    <div style={{ color: 'red' }}>
                      <FormattedMessage id="Row148" defaultMessage="REQUESTING" />
                    </div>
                    {' '}
                    <Link to={swapUri}>
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
                        data={{ type, main, base }}
                      />
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
          ${'mobileRow'}
          ${isDark ? 'rowDark' : ''}
          ${id === linkedOrderId ? 'linkedOrderHighlight' : ''}
        `}
        style={orderId === id ? { background: 'rgba(0, 236, 0, 0.1)' } : {}}
      >
        <td>
          <div styleName="bigContainer">
            <div styleName="tdContainer-1">
              <span styleName="firstType">
                {type === PAIR_TYPES.BID
                  ? (<FormattedMessage id="RowMobileYouSend" defaultMessage="You send" />)
                  : (<FormattedMessage id="RowMobileYouGet" defaultMessage="You get" />)}
              </span>
              <span styleName='rowAmount withIcon'>
                {isTurbo &&
                  <TurboIcon />
                }
                {`${mobileFormatCrypto(amount, main)} ${main}`}
              </span>
            </div>
            <div>
              <i styleName='arrowsIcon' className="fas fa-exchange-alt" />
            </div>
            <div styleName="tdContainer-2">
              <span styleName="secondType">
                {type === PAIR_TYPES.BID
                  ? (<FormattedMessage id="RowMobileYouGet" defaultMessage="You get" />)
                  : (<FormattedMessage id="RowMobileYouSend" defaultMessage="You send" />)}
              </span>
              <span styleName='rowAmount'>{`${mobileFormatCrypto(total, base)} ${base}`}</span>
            </div>
            <div styleName="tdContainer-3">
              {
                peer === ownerPeer ? (
                  <RemoveButton onClick={() => removeOrder(id)} brand={true} />
                ) : (
                  <Fragment>
                    {
                      isRequested ? (
                        <Fragment>
                          <div style={{ color: 'red' }}>
                            <FormattedMessage id="RowM136" defaultMessage="REQUESTING" />
                          </div>
                          {' '}
                          <Link to={swapUri}>
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
                              disabled={!isSwapButtonEnabled}
                              onClick={isSwapButtonEnabled ?
                                () => this.sendSwapRequest(id, isMy ? sellCurrency : buyCurrency)
                                :
                                () => {}
                              }
                              data={{ type, main, base }}
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

export default injectIntl(Row)
