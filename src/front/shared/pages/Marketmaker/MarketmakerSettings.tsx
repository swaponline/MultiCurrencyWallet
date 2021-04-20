import React, { Component, Fragment } from 'react'
import CSSModules from 'react-css-modules'

import { BigNumber } from 'bignumber.js'

import { connect } from 'redaction'
import actions from 'redux/actions'

import SwapApp from 'swap.app'
import Swap from 'swap.swap'

import { constants, links } from 'helpers'
import config from 'helpers/externalConfig'


import styles from './MarketmakerSettings.scss'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import SwapRow from './SwapRow'
import FAQ from './FAQ'

import Toggle from 'components/controls/Toggle/Toggle'
import Input from 'components/forms/Input/Input'

import { AddressType } from 'domain/address'

import metamask from 'helpers/metamask'
import { Button } from 'components/controls'



@CSSModules(styles, { allowMultiple: true })
class MarketmakerSettings extends Component<any, any> {
  _mounted = true
  _handleSwapAttachedHandle = null
  _handleSwapEnterStep = null
  _metamaskEnabled = false

  constructor(props) {
    super(props)

    const {
      items,
      match: {
        params: {
          token: marketToken = "usdt",
        }
      }
    } = props

    this._handleSwapAttachedHandle = this.onSwapAttachedHandle.bind(this)
    this._handleSwapEnterStep = this.onSwapEnterStep.bind(this)

    this.state = {
      swapsIds: [],
      swapsByIds: {},
      marketToken,
      btcWallet: null,
      btcBalance: 0,
      tokenWallet: null,
      tokenBalance: 0,
      ethBalance: 0,
      isBalanceFetching: false,
      isMarketEnabled: false,
      isEthBalanceOk: false,
      isBtcBalanceOk: false,
      isTokenBalanceOk: false,
    }
  }

  extractSwapStatus(swap) {
    const {
      id,
      isMy,
      isTurbo,
      buyCurrency,
      sellCurrency,
      buyAmount,
      sellAmount,
      createUnixTimeStamp,
      flow: {
        state,
      },
    } = swap
    return {
      id,
      isMy,
      buyCurrency,
      sellCurrency,
      buyAmount,
      sellAmount,
      createUnixTimeStamp,
      ...state,
    }
  }

  fetchWalletsWithBalances() {
    const {
      marketToken,
      isBalanceFetching,
    } = this.state

    if (!this._mounted) return

    if (isBalanceFetching) {
      // Если в данный момент идет запрос баланса. ничего не делаем
      // вызываем функуцию повторно через несколько секунд
      // такое может произойти, если пользователь меняет быстро код токена в адресной строке
      // может быть запушен процес запроса баланса для предыдущего токена из адресной строки
      return setTimeout(() => {
        this.fetchWalletsWithBalances()
      }, 2000)
    }
    this.setState({
      isBalanceFetching: true,
    }, () => {
      const btcWallet = actions.core.getWallet({ currency: `btc` })
      const ethWallet = actions.core.getWallet({
        currency: `eth`,
        connected: true,
        addressType: AddressType.Metamask
      })
      const tokenWallet = actions.core.getWallet({
        currency: marketToken,
        connected: true,
        addressType: AddressType.Metamask
      })

console.log('>>> wallets', btcWallet, ethWallet, tokenWallet)
      if (!tokenWallet) {
        console.log('>>>> fail feth token wallet - retry')
        this.setState({
          isBalanceFetching: false,
        }, () => {
          return setTimeout(() => {
            this.fetchWalletsWithBalances()
          }, 2000)
        })
        return
      }

      this.setState({
        btcWallet,
        ethWallet,
        tokenWallet,
      }, async () => {
        const btcBalance = await actions.core.fetchWalletBalance(btcWallet)
        const ethBalance = await actions.core.fetchWalletBalance(ethWallet)
        const tokenBalance = await actions.core.fetchWalletBalance(tokenWallet)

        // Запрос баланса асинхронный. За это время пользователь мог уже перейти на другую страницу
        // Обновляем стейт только если мы находимся в этом компоненте
        if (this._mounted) {
          this.setState({
            btcBalance,
            ethBalance,
            tokenBalance,
            isBalanceFetching: false
          })
        }
      })
    })
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: {
          token: prevMarketToken = "usdt",
        },
      },
    } = prevProps

    const {
      match: {
        params: {
          token: marketToken = "usdt",
        }
      }
    } = this.props
    if (prevMarketToken.toLowerCase() !== marketToken.toLowerCase()) {
      this.setState({
        marketToken,
        tokenBalance: 0,
        tokenWallet: null,
      }, () => {
        this.fetchWalletsWithBalances()
      })
    }
  }

  componentDidMount() {
    SwapApp.onInit(() => {
      this.cleanupMarketMakerOrder()

      const swapsIds = []
      const swapsByIds = {}

      this.fetchWalletsWithBalances()
      const lsSwapId = JSON.parse(localStorage.getItem('swapId'))

      if (lsSwapId === null || lsSwapId.length === 0) {
        return
      }

      const swapsCore = lsSwapId.map((id) => new Swap(id, SwapApp.shared()))

      SwapApp.shared().attachedSwaps.items.forEach((swap) => {
        const swapState = this.extractSwapStatus(swap)
        swapsIds.push(swapState.id)
        swapsByIds[swapState.id] = swapState
      })

      SwapApp.shared().on('swap attached', this._handleSwapAttachedHandle)
      SwapApp.shared().on('swap enter step', this._handleSwapEnterStep)

      this.setState({
        swapsIds,
        swapsByIds,
      })
    })
  }

  onSwapEnterStep(data) {
    if (!this._mounted) return

    const { swap } = data
    const swapState = this.extractSwapStatus(swap)
    const {
      swapsByIds,
    } = this.state
    swapsByIds[swapState.id] = swapState
    this.setState({
      swapsByIds,
    })
  }

  onSwapAttachedHandle(data) {
    if (!this._mounted) return
    const {
      swap,
    } = data

    const {
      swapsIds,
      swapsByIds,
    } = this.state

    if (!swapsByIds[swap.id]) {
      const swapState = this.extractSwapStatus(swap)
      swapsIds.push(swapState.id)
      swapsByIds[swapState.id] = swapState
      this.setState({
        swapsIds,
        swapsByIds,
      })
    }
  }

  componentWillUnmount() {
    this._mounted = false
    SwapApp.shared().off('swap attached', this._handleSwapAttachedHandle)
    SwapApp.shared().off('swap enter step', this._handleSwapEnterStep)
  }

  handleToggleMarketmaker(checked) {
    const { isMarketEnabled } = this.state

    const {
      ethBalance,
      btcBalance,
      tokenBalance,
      marketToken,
    } = this.state

    const isEthBalanceOk = new BigNumber(ethBalance).isGreaterThanOrEqualTo(0.02)
    const isTokenBalanceOk = new BigNumber(tokenBalance).isGreaterThan(0)
    const isBtcBalanceOk = new BigNumber(btcBalance).isGreaterThan(0)

    let hasError = false

    if (!isEthBalanceOk && false) {
      console.log('>>>>> need eth')
      hasError = true
      actions.modals.open(constants.modals.AlertModal, {
        message: <FormattedMessage id="MM_NotEnoughtEth" defaultMessage="Не достаточно ETH для оплаты коммисии майнеров" />,
      })
    }
    if (!isTokenBalanceOk && !isBtcBalanceOk) {
      console.log('>>>>> No token and no btc')
      hasError = true
      actions.modals.open(constants.modals.AlertModal, {
        message: (
          <FormattedMessage
            id="MM_NotEnoughtCoins"
            defaultMessage="Не достаточно средств. Вам нужно пополнить BTC или {token}"
            values={{
              token: marketToken.toUpperCase(),
            }}
          />
        ),
      })
    }
    if (!hasError) {
      this.setState({
        isMarketEnabled: !isMarketEnabled,
        isBtcBalanceOk,
        isEthBalanceOk,
        isTokenBalanceOk,
      }, () => {
        if (!isMarketEnabled) {
          // New state - On
          this.createMakerMakerOrder()
        } else {
          // New state - Off
          this.cleanupMarketMakerOrder()
        }
      })
    } else {
      this.setState({
        isMarketEnabled: false,
      })
    }
  }

  cleanupMarketMakerOrder() {
    SwapApp.shared().services.orders.getMyOrders().forEach((order) => {
      SwapApp.shared().services.orders.remove(order.id)
    })
  }

  createMakerMakerOrder() {
    // clear old orders
    this.cleanupMarketMakerOrder()
    const {
      tokenBalance,
      marketToken,
      btcBalance,
      ethBalance,
      isBtcBalanceOk,
      isTokenBalanceOk,
    } = this.state
    if (isTokenBalanceOk) {
      const sellTokenExchangeRate = 1
      const sellTokenOrderData = {
        balance: tokenBalance,
        buyAmount: tokenBalance,
        ethBalance,
        exchangeRate: sellTokenExchangeRate,
        isPartial: true,
        isSending: true,
        isTokenBuy: false,
        isTokenSell: true,
        isTurbo: false,
        manualRate: true,
        minimalestAmountForBuy: 0.00038906,
        minimalestAmountForSell: 0.00038906,
        sellAmount: tokenBalance,
        buyCurrency: `BTC`,
        sellCurrency: marketToken,
      }
      console.log(sellTokenOrderData)
      SwapApp.shared().services.orders.create(sellTokenOrderData)
    }
    if (isBtcBalanceOk) {
      const buyTokenExchangeRate = 1
      const buyTokenOrderData = {
        balance: btcBalance,
        sellAmount: btcBalance,
        ethBalance,
        exchangeRate: buyTokenExchangeRate,
        isPartial: true,
        isSending: true,
        isTokenBuy: true,
        isTokenSell: false,
        isTurbo: false,
        manualRate: true,
        minimalestAmountForBuy: 0.00038906,
        minimalestAmountForSell: 0.00038906,
        buyAmount: btcBalance,
        sellCurrency: `BTC`,
        buyCurrency: marketToken,
      }
      console.log(buyTokenOrderData)
      SwapApp.shared().services.orders.create(buyTokenOrderData)
    }
    /*
      balance: "9899908898990000"
      buyAmount: "0.05"
      buyCurrency: "btc"
      ethBalance: "3.9929848021431"
      exchangeRate: "2000"
      isPartial: true
      isSending: true
      isTokenBuy: false
      isTokenSell: true
      isTurbo: false
      manualRate: true
      minimalestAmountForBuy: 0.00038906
      minimalestAmountForSell: 0.00038906
      sellAmount: "100"
      sellCurrency: "usdt"
    */
  }

  processDisconnectWallet() {
    metamask.handleDisconnectWallet(() => {
      this.fetchWalletsWithBalances()
    })
  }

  processConnectWallet() {
    metamask.handleConnectMetamask({
      dontRedirect: true,
      cbFunction: (isConnected) => {
        if (isConnected) {
          this.fetchWalletsWithBalances()
        }
      },
    })
  }

  render() {
    const {
      swapsIds,
      swapsByIds,
      btcWallet,
      ethWallet,
      btcBalance,
      tokenWallet,
      tokenBalance,
      ethBalance,
      marketToken,
      isBalanceFetching,
      isMarketEnabled,
    } = this.state

    const sortedSwaps = swapsIds.sort((aId, bId) => {
      return swapsByIds[bId].createUnixTimeStamp - swapsByIds[aId].createUnixTimeStamp
    })
    return (
      <div styleName="mm-settings-page">
        <section styleName="mm-controls">
        {!isBalanceFetching ? (
          <>
            <h2 styleName="section-title">Настройки маркетмейкинга</h2>

            <p>Маркетмейкинг BTC/WBTC : <span>
              <Toggle checked={isMarketEnabled} onChange={this.handleToggleMarketmaker.bind(this)} />
            </span></p>
            <p>Спред: 0.5% (по умолчанию стоит 0.5%)</p>
            {btcWallet ? (
              <p>Баланс BTC: {btcBalance} BTC для попленения переведите на `{btcWallet.address}`</p>
            ) : (
              <p>Баланс BTC: {btcBalance} BTC</p>
            )}
            {ethWallet ? (
              <p>Баланс ETH: {ethBalance} для пополнения переведите на `{ethWallet.address}`</p>
            ) : (
              <p>Баланс ETH: {ethBalance}</p>
            )}
            <p>Баланс {marketToken.toUpperCase()}: {tokenBalance} {marketToken.toUpperCase()}</p>
            {this._metamaskEnabled && (
              <div>
              {metamask.isConnected() ? (
                <Button blue onClick={this.processDisconnectWallet.bind(this)}>Отключить Metamask</Button>
              ) : (
                <Button blue onClick={this.processConnectWallet.bind(this)}>Подключить Metamask</Button>
              )}
              </div>
            )}
          </>
        ) : (
          <>
            <p>Loading...</p>
          </>
        )}
        </section>

        {/* Swaps history + Active swaps */}
        <section>
          <h2 styleName="section-title">Swap history</h2>
          <table styleName="swapHistory">
            <thead>
              <tr>
                <td>
                  <span>You buy</span>
                </td>
                <td>
                  <span>Step</span>
                </td>
                <td>
                  <span>You sell</span>
                </td>
                <td>
                  <span>Lock time</span>
                </td>
                <td>
                  <span>Status</span>
                </td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {!!sortedSwaps.length && sortedSwaps.map((swapId, rowIndex) => {
                return (
                  <SwapRow
                    key={swapId}
                    row={swapsByIds[swapId]}
                    extractSwapStatus={this.extractSwapStatus}
                  />
                )
              })}
              {!sortedSwaps.length && (
                <tr>
                  <td colSpan={6}>empty</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <FAQ />
      </div>
    )
  }
}

export default injectIntl(MarketmakerSettings)