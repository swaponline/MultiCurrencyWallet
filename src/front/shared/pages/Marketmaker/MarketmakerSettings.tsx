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

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = (mnemonic === `-`)

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
      marketSpread: 0.1, // 10% spread
      mnemonicSaved,
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

      if (!tokenWallet) {
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

  handleSaveMnemonic() {
    actions.modals.open(constants.modals.SaveMnemonicModal, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicSaved = (mnemonic === `-`)

        this.setState({
          mnemonicSaved,
        })
      }
    })
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

    if (!isEthBalanceOk) {
      hasError = true
      actions.modals.open(constants.modals.AlertModal, {
        message: <FormattedMessage id="MM_NotEnoughtEth" defaultMessage="Не достаточно ETH для оплаты коммисии майнеров" />,
      })
    }
    if (!isTokenBalanceOk && !isBtcBalanceOk) {
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
      marketSpread,
    } = this.state

    /*
           / 100 - spread[%] \
  price * |  –––––––––––––––  |
           \       100       /
           
           price = 1
           sell = 10
           buy = ? 10 + spread
           
           buy = 10
           sell = ? 10 - spread
    */
    const tokenBalance2 = 1
    const btcBalance2 = 1
    if (isTokenBalanceOk) {
      
      const sellTokenExchangeRate =
        new BigNumber(100).minus(
          new BigNumber(100).times(marketSpread)
        ).dividedBy(100).toNumber()
      console.log('>>>> sellTokenExchangeRate', sellTokenExchangeRate)
      const sellAmount = new BigNumber(tokenBalance2).times(sellTokenExchangeRate)
      console. log('sellAmount', sellAmount.toNumber())
      
      const sellTokenOrderData = {
        balance: tokenBalance2,
        buyAmount: tokenBalance2,
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
        sellAmount,
        buyCurrency: `BTC`,
        sellCurrency: marketToken,
      }
      console.log(sellTokenOrderData)
      SwapApp.shared().services.orders.create(sellTokenOrderData)
    }
    if (isBtcBalanceOk) {
      
      const buyTokenExchangeRate =
        new BigNumber(100).plus(
          new BigNumber(100).times(marketSpread)
        ).dividedBy(100).toNumber()
      console.log('>>>> buyTokenExchangeRate', buyTokenExchangeRate)
      const buyAmount = new BigNumber(btcBalance2).times(buyTokenExchangeRate).toNumber()
      console.log('>>>>>', buyAmount)
      //const buyTokenExchangeRate = 1
      const buyTokenOrderData = {
        balance: btcBalance2,
        sellAmount: btcBalance2,
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
        buyAmount,
        sellCurrency: `BTC`,
        buyCurrency: marketToken,
      }
      console.log(buyTokenOrderData)
      SwapApp.shared().services.orders.create(buyTokenOrderData)
    }
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
      mnemonicSaved,
    } = this.state

    const totalBalance = new BigNumber(btcBalance).plus(tokenBalance).toNumber()

    const sortedSwaps = swapsIds.sort((aId, bId) => {
      return swapsByIds[bId].createUnixTimeStamp - swapsByIds[aId].createUnixTimeStamp
    })
    return (
      <div styleName="mm-settings-page">
        <section styleName="mm-controls">
        {!mnemonicSaved && (
          <>
            <p>
              <FormattedMessage
                id="MM_NeedSaveMnemonic"
                defaultMessage="We will create BTC,ETH,WBTC hot wallets. You need to write 12 words if you have not done so earlier"
              />
            </p>
            <Button blue onClick={this.handleSaveMnemonic.bind(this)}>
              <FormattedMessage
                id="MM_MakeSaveMnemonic"
                defaultMessage="Сохранить секретную фразу"
              />
            </Button>
          </>
        )}
        {!isBalanceFetching && mnemonicSaved ? (
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
            <FormattedMessage
              id="MM_TotalBalance"
              defaultMessage="Total balance {totalBalance} {token}, BTC"
              values={{
                totalBalance,
                token: marketToken.toUpperCase(),
              }}
            />
          </>
        ) : (
          <>
            {mnemonicSaved && (
              <p>Loading...</p>
            )}
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