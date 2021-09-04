import React, { Component, Fragment } from 'react'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import cssModules from 'react-css-modules'
import { Link } from 'react-router-dom'
import { connect } from 'redaction'
import actions from 'redux/actions'
import styles from './Row.scss'
import config from 'app-config'

import helpers, { links, constants } from 'helpers'
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
  checkSwapExists: ({}) => boolean

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

  formatWithDecimals = (amount, currency): string => {
    const decimals = constants.tokenDecimals[currency.toLowerCase()]
    const wrongDecimals = !Number.isInteger(decimals) || decimals < 0 || decimals > 8
    const finalDecimals = wrongDecimals ? 8 : decimals
    const result = new BigNumber(amount).dp(finalDecimals, BigNumber.ROUND_HALF_CEIL)

    // save decimals if it's float number
    return !result.mod(1) ? result.toFixed(finalDecimals) : result.toFixed()
  }

  handleDeclineOrdersModalOpen = (indexOfDecline) => {
    //@ts-ignore: strictNullChecks
    const orders = SwapApp.shared().services.orders.items
    const declineSwap = actions.core.getSwapById(this.props.decline[indexOfDecline])

    if (declineSwap !== undefined) {
      //@ts-ignore: strictNullChecks
      actions.modals.open(constants.modals.DeclineOrdersModal, {
        declineSwap,
      })
    }
  }

  renderCoinName = (coin) => {
    return coin.toUpperCase()
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
      checkSwapExists,
    } = this.props

    const balance = this.getBalance()

    feedback.offers.buyPressed(`${this.renderCoinName(sellCurrency)}->${this.renderCoinName(buyCurrency)}`)

    const pair = Pair.fromOrder(row)
    //@ts-ignore: strictNullChecks
    const { price, amount, total, main, base, type } = pair

    if (!checkSwapAllow({
      sellCurrency,
      buyCurrency,
      amount: sellAmount,
      balance,
    })) return false

    const isSwapExists = await checkSwapExists({ haveCurrency: sellCurrency, getCurrency: buyCurrency, orderId })

    if (isSwapExists) {
      actions.notifications.show(
        constants.notifications.ErrorNotification,
        { error: 'You have Exists Swap with order participant. Please use other order for start swap with this pair.' }
      )
      return false
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

    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.ConfirmBeginSwap, {
      order: row,
      onAccept: async (customWallet) => {
        feedback.offers.swapRequested(`${this.renderCoinName(sellCurrency)}->${this.renderCoinName(buyCurrency)}`)

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
              //@ts-ignore: strictNullChecks
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
              //@ts-ignore: strictNullChecks
              ? intl.formatMessage(messages.sell)
              //@ts-ignore: strictNullChecks
              : intl.formatMessage(messages.buy)
            }`,
            amount: `${this.formatWithDecimals(amount, main)}`,
            main: `${this.renderCoinName(main)}`,
            total: `${this.formatWithDecimals(total, base)}`,
            base: `${this.renderCoinName(base)}`,
            price: `${exchangeRates}`,
          }}
        />
      ),
    })
  }

  renderContent = () => {
    const windowWidth = window.innerWidth

    this.setState(() => ({
      windowWidth,
    }))
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
        owner: {
          peer: ownerPeer,
          eth: {
            address: ownerEthAddress,
          },
        },
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
    //@ts-ignore: strictNullChecks
    const { price, amount, total, main, base, type } = pair

    const isSwapButtonEnabled = checkSwapAllow({
      sellCurrency: sell,
      buyCurrency: buy,
      amount: buyAmount,
      isSilentError: true,
    })

    let sellCurrencyOut
    let sellAmountOut
    let getCurrencyOut
    let getAmountOut
    let priceOut

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
          ${id === linkedOrderId ? 'linkedOrderHighlight' : ''}
        `}
        style={orderId === id ? { background: 'rgba(0, 236, 0, 0.1)' } : {}}
      >
        <td styleName='rowCell'>
          <div styleName='withIcon'>
            <Avatar
              value={ownerPeer}
              size={25}
              ownerEthAddress={ownerEthAddress}
            />
            {isTurbo &&
              <TurboIcon />
            }
          </div>
        </td>
        <td styleName='rowCell'>
          <span styleName='rowAmount'>
            <span className={`${sellCurrencyOut.toLowerCase()}SellAmountOfOrder`}>{`${this.formatWithDecimals(sellAmountOut, sellCurrencyOut)}`}</span>
            {' '}
            <span>{`${this.renderCoinName(sellCurrencyOut)}`}</span>
          </span>
        </td>
        <td styleName='rowCell'>
          <span styleName='rowAmount'>
            <span className={`${getCurrencyOut.toLowerCase()}GetAmountOfOrder`}>{`${this.formatWithDecimals(getAmountOut, getCurrencyOut)}`}</span>
            {' '}
            <span>{`${this.renderCoinName(getCurrencyOut)}`}</span>
          </span>
        </td>
        <td styleName='rowCell'>
          <span styleName='rowAmount'>
            {`${this.formatWithDecimals(priceOut, getCurrencyOut)} ${this.renderCoinName(getCurrencyOut)}/${this.renderCoinName(sellCurrencyOut)}`}
          </span>
        </td>
        <td styleName='rowCell'>
          {peer === ownerPeer
            ? <RemoveButton onClick={() => removeOrder(id)} brand />
            :
            <Fragment>
              {
                isRequested ? (
                  <Fragment>
                    <div style={{ color: 'red' }}>
                      <FormattedMessage id="RowM136" defaultMessage="REQUESTING" />
                    </div>
                    {' '}
                    <Link to={swapUri}>
                      <FormattedMessage id="RowM139" defaultMessage="Swap" />
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
                        data={{
                          type,
                          main: this.renderCoinName(main),
                          base: this.renderCoinName(base),
                        }}
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
          ${id === linkedOrderId ? 'linkedOrderHighlight' : ''}
        `}
        style={orderId === id ? { background: 'rgba(0, 236, 0, 0.1)' } : {}}
      >
        <td>
          <div styleName="bigContainer">
            <div styleName="tdContainer-1">
              <span styleName="firstType">
                {type === PAIR_TYPES.BID
                  ? (<FormattedMessage id="MyOrdersYouSend" defaultMessage="You send" />)
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
                  : (<FormattedMessage id="MyOrdersYouSend" defaultMessage="You send" />)}
              </span>
              <span styleName='rowAmount'>{`${mobileFormatCrypto(total, base)} ${this.renderCoinName(base)}`}</span>
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
                            <FormattedMessage id="RowM139" defaultMessage="Swap" />
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
                              data={{
                                type,
                                main: this.renderCoinName(main),
                                base: this.renderCoinName(base),
                              }}
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
