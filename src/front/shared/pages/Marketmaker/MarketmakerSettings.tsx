import React, { Component, Fragment } from 'react'
import CSSModules from 'react-css-modules'

import { BigNumber } from 'bignumber.js'

import { connect } from 'redaction'
import actions from 'redux/actions'

import SwapApp from 'swap.app'
import Swap from 'swap.swap'

import { constants, links, feedback } from 'helpers'
import config from 'helpers/externalConfig'


import styles from './MarketmakerSettings.scss'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import SwapRow from './SwapRow'
import FAQ from './FAQ'

import Toggle from 'components/controls/Toggle/Toggle'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import Input from 'components/forms/Input/Input'

import btc from './images/btcIcon.svg'
import wbtc from './images/wbtcIcon.svg'

import metamask from 'helpers/metamask'
import { Button } from 'components/controls'

import { AddressType, AddressFormat } from 'domain/address'
import Address from 'components/ui/Address/Address'


const isDark = !!localStorage.getItem(constants.localStorage.isDark)


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
      isNeedDeposit: false,
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
      //@ts-ignore: strictNullChecks
      const isMarketEnabled = (SwapApp.shared().services.orders.getMyOrders().length > 0)

      const swapsIds = []
      const swapsByIds = {}

      this.fetchWalletsWithBalances()
      //@ts-ignore: strictNullChecks
      const lsSwapId = JSON.parse(localStorage.getItem('swapId'))

      if (!(lsSwapId === null || lsSwapId.length === 0)) {
        const swapsCore = lsSwapId.map((id) => {
          try {
            return new Swap(id, SwapApp.shared())
          } catch (e) {}
        })
      }

      //@ts-ignore: strictNullChecks
      SwapApp.shared().attachedSwaps.items.forEach((swap) => {
        if (swap && swap.flow) {
          const swapState = this.extractSwapStatus(swap)
          //@ts-ignore: strictNullChecks
          swapsIds.push(swapState.id)
          swapsByIds[swapState.id] = swapState
        }
      })

      //@ts-ignore: strictNullChecks
      SwapApp.shared().on('swap attached', this._handleSwapAttachedHandle)
      //@ts-ignore: strictNullChecks
      SwapApp.shared().on('swap enter step', this._handleSwapEnterStep)

      this.setState({
        swapsIds,
        swapsByIds,
        isMarketEnabled,
      })
    })
    feedback.marketmaking.enteredSettings()
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
    //@ts-ignore: strictNullChecks
    SwapApp.shared().off('swap attached', this._handleSwapAttachedHandle)
    //@ts-ignore: strictNullChecks
    SwapApp.shared().off('swap enter step', this._handleSwapEnterStep)
  }

  handleSaveMnemonic() {
    //@ts-ignore: strictNullChecks
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
      const AB_Coin = (config.binance) ? `BNB` : `ETH`
      //@ts-ignore: strictNullChecks
      actions.modals.open(constants.modals.AlertModal, {
        message: (
          <FormattedMessage
            id="MM_NotEnoughtEth"
            defaultMessage="Not enough {AB_Coin} to pay the miners commission. You need to have at least 0.02 {AB_Coin}"
            values={{
              AB_Coin,
            }}
          />
        ),
      })
      feedback.marketmaking.prevented(`Not enough ${AB_Coin}`)
    }
    if (!isTokenBalanceOk && !isBtcBalanceOk) {
      hasError = true
      const token = marketToken.toUpperCase()
      //@ts-ignore: strictNullChecks
      actions.modals.open(constants.modals.AlertModal, {
        message: (
          <FormattedMessage
            id="MM_NotEnoughCoins"
            defaultMessage="Insufficient funds. You need to top up your BTC or {token}"
            values={{
              token,
            }}
          />
        ),
      })
      feedback.marketmaking.prevented(`Not enough BTC or ${token}`)
    }
    if (!hasError) {
      this.setState({
        isMarketEnabled: !isMarketEnabled,
        isBtcBalanceOk,
        isEthBalanceOk,
        isTokenBalanceOk,
        isNeedDeposit: false
      }, () => {
        if (!isMarketEnabled) {
          // New state - On
          this.createMakerMakerOrder()
          feedback.marketmaking.enabled()
        } else {
          // New state - Off
          this.cleanupMarketMakerOrder()
          feedback.marketmaking.disabled()
        }
      })
    } else {
      this.setState({
        isMarketEnabled: false,
        isNeedDeposit: true
      })
    }
  }

  cleanupMarketMakerOrder() {
    //@ts-ignore: strictNullChecks
    SwapApp.shared().services.orders.getMyOrders().forEach((order) => {
      //@ts-ignore: strictNullChecks
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
    */
    if (isTokenBalanceOk) {
      const sellTokenExchangeRate =
        new BigNumber(100).minus(
          new BigNumber(100).times(marketSpread)
        ).dividedBy(100).toNumber()

      const sellAmount = new BigNumber(tokenBalance).times(sellTokenExchangeRate).toNumber()

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
        sellAmount,
        buyCurrency: `BTC`,
        sellCurrency: marketToken,
      }
      console.log(sellTokenOrderData)
      //@ts-ignore: strictNullChecks
      const sellOrder = SwapApp.shared().services.orders.create(sellTokenOrderData)
      console.log('sellOrder', sellOrder)
      actions.core.setupPartialOrder(sellOrder)
    }
    if (isBtcBalanceOk) {
      const buyTokenExchangeRate =
        new BigNumber(100).plus(
          new BigNumber(100).times(marketSpread)
        ).dividedBy(100).toNumber()

      const buyAmount = new BigNumber(btcBalance).times(buyTokenExchangeRate).toNumber()

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
        buyAmount,
        sellCurrency: `BTC`,
        buyCurrency: marketToken,
      }
      console.log(buyTokenOrderData)
      //@ts-ignore: strictNullChecks
      const buyOrder = SwapApp.shared().services.orders.create(buyTokenOrderData)
      console.log('buyOrder', buyOrder)
      actions.core.setupPartialOrder(buyOrder)
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
      // @ts-ignore
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
      isNeedDeposit,
      mnemonicSaved,
    } = this.state

    const totalBalance = new BigNumber(btcBalance).plus(tokenBalance).toNumber()

    const sortedSwaps = swapsIds.sort((aId, bId) => {
      return swapsByIds[bId].createUnixTimeStamp - swapsByIds[aId].createUnixTimeStamp
    })
    return (
      <div styleName="mm-settings-page">
        <div styleName="promoText">
          <h2>
            <FormattedMessage
              id="MM_Promo_Title"
              defaultMessage="How to make money on atomic swaps?"
            />
          </h2>
          <p>
            <FormattedMessage
              id="MM_Promo_TitleBody"
              defaultMessage="On swap.io users exchange BTC for {token} (a token that costs like BTC, but works on {Ab_Title}), and vice versa. You get min. 10% APY (annual per year) as a commission from exchanges with low impermanent loss {link}."
              values={{
                token: marketToken.toUpperCase(),
                Ab_Title: (config.binance) ? `Binance Smart Chain` : `Ethereum`,
                link: <a href={links.impermanentLoss} target="_blank">(?)</a>,
              }}
            />
          </p>
        </div>

        <section styleName={`${isDark ? 'dark' : '' }`}>
        {!mnemonicSaved && (
          <>
            <p>
              <FormattedMessage
                id="MM_NeedSaveMnemonic"
                defaultMessage="We will create BTC, {AB_Coin}, {token} hot wallets. You need to write 12 words if you have not done so earlier"
                values={{
                  token: marketToken.toUpperCase(),
                  AB_Coin: (config.binance) ? `BNB` : `ETH`,
                }}
              />
            </p>
            <div styleName='restoreBtn'>
              <Button blue onClick={this.handleSaveMnemonic.bind(this)}>
                <FormattedMessage
                  id="MM_MakeSaveMnemonic"
                  defaultMessage="Save a secret phrase"
                />
              </Button>
            </div>
          </>
        )}
        {!isBalanceFetching && mnemonicSaved ? (
          <div styleName={`section-items ${isDark ? '--dark' : '' }`}>
            <div styleName='section-items__item' style={{ zIndex: 2 }}> {/* zIndex need for Tooltip */}
              <div styleName={`mm-toggle ${isDark ? '--dark' : '' }`}>
                <p styleName='mm-toggle__text'>
                  <FormattedMessage
                    id="MM_ToggleText"
                    defaultMessage="Marketmaking BTC/{token}"
                    values={{
                      token: marketToken.toUpperCase(),
                    }}
                  />
                </p>
                <span styleName='mm-toggle__switch'>
                  <Toggle checked={isMarketEnabled} onChange={this.handleToggleMarketmaker.bind(this)} />
                </span>
              </div>
              <p styleName='item-text__secondary'>
                {isMarketEnabled ? (
                  <FormattedMessage
                    id="MM_ToggleTextEnabled"
                    defaultMessage="You must be online all the time, otherwise your will not earn"
                  />
                ) : (
                  <FormattedMessage
                    id="MM_ToggleTextDisabled"
                    defaultMessage="Turn on this toggle to start earn"
                  />
                )}
              </p>
              <div styleName='item-text__secondary'>
                <FormattedMessage
                  id="MMPercentEarn"
                  defaultMessage="You will earn 0.5% from each swap"
                />
                {' '}
                <Tooltip id="FullEarnDiscription">
                  <span styleName="tooltipText">
                    <FormattedMessage
                      id="MM_Promo_TitleBody"
                      defaultMessage="On swap.io users exchange BTC for {token} (a token that costs like BTC, but works on {Ab_Title}), and vice versa. You get min. 10% APY (annual per year) as a commission from exchanges with low impermanent loss {link}."
                      values={{
                        token: marketToken.toUpperCase(),
                        Ab_Title: (config.binance) ? `Binance Smart Chain` : `Ethereum`,
                        link: <a href={links.impermanentLoss} target="_blank">(?)</a>,
                      }}
                    />
                  </span>
                </Tooltip>
              </div>
            </div>
            <div styleName='section-items__item'>
              <h2 styleName='item-text__secondary-title'>
                <FormattedMessage
                  id="MM_TotalEarned"
                  defaultMessage="Total earned:"
                />
              </h2>
              <p>
                <span styleName='balancePrimary'>
                  0
                </span>
                {' '}
                <span styleName='item-text__secondary'>
                  <FormattedMessage
                    id="MM_MarketmakingSimbols"
                    defaultMessage="{token} + BTC"
                    values={{
                      token: marketToken.toUpperCase(),
                    }}
                  />
                </span>
              </p>
              <hr />
              <h2 styleName='item-text__secondary-title'>
                <FormattedMessage
                  id="MM_MarketmakingBalanceTitle"
                  defaultMessage="Marketmaking Balance:"
                />
              </h2>
              <p>
                <span styleName='balancePrimary'>
                {isMarketEnabled ? (
                  totalBalance
                ) : (
                  '0'
                )}
                </span>
                {' '}
                <span styleName='item-text__secondary'>
                  <FormattedMessage
                    id="MM_MarketmakingSimbols"
                    defaultMessage="{token} + BTC"
                    values={{
                      token: marketToken.toUpperCase(),
                    }}
                  />
                </span>
              </p>
            </div>
            {(true) && (
              <>
                <div styleName='section-items__item'>
                  {btcWallet ? (
                      <>
                        <h2 styleName='item-text__secondary-title'>
                          <FormattedMessage
                            id="MM_BTCBalance"
                            defaultMessage="Balance BTC:"
                          />
                        </h2>
                        <p>
                          <img src={btc} alt="btc" />
                          {' '}
                          <span id='btcBalance' styleName='balanceSecondary'>{btcBalance}</span>
                        </p>
                        <hr />
                        <p styleName='item-text__secondary'>
                          <FormattedMessage
                            id="MM_DepositeWallet"
                            defaultMessage="to top up, transfer to"
                          />
                          <br />
                          <Address address={btcWallet.address} format={AddressFormat.Full} />
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 styleName='item-text__secondary-title'>
                          <FormattedMessage
                            id="MM_BTCBalance"
                            defaultMessage="Balance BTC:"
                          />
                        </h2>
                        <p>
                          <img src={btc} alt="btc" />
                          {' '}
                          <span id='btcBalance' styleName='balanceSecondary'>{btcBalance}</span>
                        </p>
                      </>
                    )
                  }
                </div>
                <div styleName='section-items__item'>
                  <h2 styleName='item-text__secondary-title'>
                    <FormattedMessage
                      id="MM_TokenBalance"
                      defaultMessage="Balance {token}:"
                      values={{
                        token: marketToken.toUpperCase(),
                      }}
                    />
                  </h2>
                  <div>
                    {config.binance ? (
                      <img src={btc} alt="btcb" />
                    ): (
                      <img styleName='iconPosition' src={wbtc} alt="wbtc" />
                    )}
                    {' '}
                    <span id='tokenBalance' styleName='balanceSecondary'>{tokenBalance}</span>
                    {' '}
                    <Tooltip id="WhatIsToken">
                      <span styleName="tooltipText">
                        <FormattedMessage
                          id="MM_whatIsWBTCTooltip1"
                          defaultMessage="{tokenFullName} ({token}) is an {tokenStandart} token that represents Bitcoin (BTC) on the {blockchainName} blockchain."
                          values={{
                            tokenFullName: config.binance ? 'Bitcoin BEP2' : 'Wrapped Bitcoin',
                            tokenStandart: config.binance ? 'BEP-20' : 'ERC-20',
                            token: marketToken.toUpperCase(),
                            blockchainName: config.binance ? 'Binance' : 'Ethereum'
                          }}
                        />
                        <br />
                        <FormattedMessage
                          id="MM_whatIsWBTCTooltip2"
                          defaultMessage="{token} was created to allow Bitcoin holders to participate in decentralized finance (“DeFi”) apps that are popular on {blockchainName}."
                          values={{
                            token: marketToken.toUpperCase(),
                            blockchainName: config.binance ? 'Binance' : 'Ethereum'
                          }}
                        />
                      </span>
                    </Tooltip>
                  </div>
                  {this._metamaskEnabled && (
                    <div style={{ marginBottom: '15px' }}>
                    {metamask.isConnected() ? (
                        <Button blue onClick={this.processDisconnectWallet.bind(this)}>
                          <FormattedMessage
                            id="MM_DisconnectMetamask"
                            defaultMessage="Disconnect Metamask"
                          />
                        </Button>
                      ) : (
                        <Button blue onClick={this.processConnectWallet.bind(this)}>
                          <FormattedMessage
                            id="MM_ConnectMetamask"
                            defaultMessage="Connect Metamask"
                          />
                        </Button>
                      )
                    }
                    </div>
                  )}
                  {ethWallet ? (
                      <>
                        <p styleName='item-text__secondary'>
                          <FormattedMessage
                            id="MM_ETHBalance"
                            defaultMessage="Balance {AB_Coin}: {balance} (for miners fee)"
                            values={{
                              AB_Coin: (config.binance) ? `BNB` : `ETH`,
                              balance: new BigNumber(ethBalance).dp(5).toNumber()
                            }}
                          />
                        </p>
                        <hr />
                        <p styleName='item-text__secondary'>
                          <FormattedMessage
                            id="MM_DepositeWallet"
                            defaultMessage="to top up, transfer to"
                          />
                          <br />
                          <Address address={ethWallet.address} format={AddressFormat.Full} />
                        </p>
                      </>
                    ) : (
                      <p styleName='item-text__secondary'>
                        <FormattedMessage
                          id="MM_ETHBalance"
                          defaultMessage="Balance {AB_Coin}: {balance} (for miner fees)"
                          values={{
                            AB_Coin: (config.binance) ? `BNB` : `ETH`,
                            balance: new BigNumber(ethBalance).dp(5).toNumber()
                          }}
                        />
                      </p>
                    )
                  }
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {mnemonicSaved && (
              <div styleName='controlsLoader'>
                <InlineLoader />
              </div>
            )}
          </>
        )}
        </section>

        {/* Swaps history + Active swaps */}
        { mnemonicSaved && (
          <section styleName={`${isDark ? 'dark' : '' }`}>
            <h2 styleName="section-title">
              <FormattedMessage
                id="MM_SwapHistory_Title"
                defaultMessage="Swap history"
              />
            </h2>
            <table styleName="swapHistory">
              <thead>
                <tr>
                  <td>
                    <p>
                      <FormattedMessage
                        id="MM_SwapHistory_YouBuy"
                        defaultMessage="You buy"
                      />
                    </p>
                  </td>
                  <td>
                    <p>
                      <FormattedMessage
                        id="MM_SwapHistory_Step"
                        defaultMessage="Step"
                      />
                    </p>
                  </td>
                  <td>
                    <p>
                      <FormattedMessage
                        id="MM_SwapHistory_YouSell"
                        defaultMessage="You sell"
                      />
                    </p>
                  </td>
                  <td>
                    <p>
                      <FormattedMessage
                        id="MM_SwapHistory_LockTime"
                        defaultMessage="Lock time"
                      />
                    </p>
                  </td>
                  <td>
                    <p>
                      <FormattedMessage
                        id="MM_SwapHistory_Status"
                        defaultMessage="Status"
                      />
                    </p>
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
                    <td colSpan={6}>
                      <FormattedMessage
                        id="MM_SwapHistory_Empty"
                        defaultMessage="You have not any swaps, turn on MM and wait when someone accept your orders"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}


        <FAQ
          isDark={isDark}
        />
      </div>
    )
  }
}

export default injectIntl(MarketmakerSettings)
