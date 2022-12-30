import React, { Component } from 'react'
import CSSModules from 'react-css-modules'

import { BigNumber } from 'bignumber.js'

import actions from 'redux/actions'
import SwapApp from 'swap.app'
import Swap from 'swap.swap'

import { constants, links, feedback } from 'helpers'
import config from 'helpers/externalConfig'

import styles from './MarketmakerSettings.scss'

import { FormattedMessage, injectIntl } from 'react-intl'

import SwapRow from './SwapRow'
import FAQ from './FAQ'

import Toggle from 'components/controls/Toggle/Toggle'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import Tooltip from 'components/ui/Tooltip/Tooltip'

import btc from './images/btcIcon.svg'
import wbtc from './images/wbtcIcon.svg'

import metamask from 'helpers/metamask'
import { Button } from 'components/controls'

import { AddressType, AddressFormat } from 'domain/address'
import Address from 'components/ui/Address/Address'

@CSSModules(styles, { allowMultiple: true })
class MarketmakerSettings extends Component<any, any> {
  _mounted = true
  _handleSwapAttachedHandle = null
  _handleSwapEnterStep = null
  _metamaskEnabled = false

  constructor(props) {
    super(props)

    const {
      match: {
        params: {
          token: marketToken = "{eth}usdt",
          utxoCoin = 'btc'
        }
      }
    } = props

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = (mnemonic === `-`)
    const isWalletCreated = localStorage.getItem(constants.localStorage.isWalletCreate)

    this._handleSwapAttachedHandle = this.onSwapAttachedHandle.bind(this)
    this._handleSwapEnterStep = this.onSwapEnterStep.bind(this)


    this.state = {
      swapsIds: [],
      swapsByIds: {},
      marketToken,
      utxoCoin,
      utxoWallet: null,
      utxoBalance: 0,
      tokenWallet: null,
      tokenBalance: 0,
      ethBalance: 0,
      isBalanceFetching: true,
      isWalletCreated,
      isFirstFetchin: true,
      isMarketEnabled: false,
      isEthBalanceOk: false,
      isUtxoBalanceOk: false,
      isTokenBalanceOk: false,
      marketSpread: 0, // 0% spread
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
      buyBlockchain,
      sellBlockchain,
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
      buyBlockchain,
      sellBlockchain,
      ...state,
    }
  }

  fetchWalletsWithBalances() {
    const {
      marketToken,
      utxoCoin,
      isBalanceFetching,
      isFirstFetchin,
    } = this.state

    if (!this._mounted) return

    if (isBalanceFetching && !isFirstFetchin) {
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
      isFirstFetchin: false,
    }, () => {
      const utxoWallet = actions.core.getWallet({ currency: utxoCoin })

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

      const evmCoinWallet = actions.core.getWallet({
        currency: tokenWallet.blockchain,
        connected: true,
        addressType: AddressType.Metamask
      })

      this.setState({
        utxoWallet,
        evmCoinWallet,
        tokenWallet,
      }, async () => {
        const utxoBalance = await actions.core.fetchWalletBalance(utxoWallet)
        const ethBalance = await actions.core.fetchWalletBalance(evmCoinWallet)
        const tokenBalance = await actions.core.fetchWalletBalance(tokenWallet)

        // Запрос баланса асинхронный. За это время пользователь мог уже перейти на другую страницу
        // Обновляем стейт только если мы находимся в этом компоненте
        if (this._mounted) {
          this.setState({
            utxoBalance,
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
          token: prevMarketToken = '{eth}usdt',
          utxoCoin: prevUtxoCoin = 'btc'
        },
      },
    } = prevProps

    const {
      match: {
        params: {
          token: marketToken = '{eth}usdt',
          utxoCoin = 'btc'
        }
      }
    } = this.props
    const { mnemonicSaved } = this.state

    if (
      mnemonicSaved &&
      prevMarketToken.toLowerCase() !== marketToken.toLowerCase()
    ) {
      this.setState({
        marketToken,
        tokenBalance: 0,
        tokenWallet: null,
      }, () => {
        this.fetchWalletsWithBalances()
      })
    }
    if (
      mnemonicSaved &&
      prevUtxoCoin.toLowerCase() !== utxoCoin.toLowerCase()
    ) {
      this.setState({
        utxoCoin,
        utxoBalance: 0,
        utxoWallet: null,
      }, () => {
        this.fetchWalletsWithBalances()
      })
    }
  }

  async componentDidMount() {
    const { mnemonicSaved } = this.state

    SwapApp.onInit(() => {
      //@ts-ignore: strictNullChecks
      let isMarketEnabled = (SwapApp.shared().services.orders.getMyOrders().length > 0)

      if (isMarketEnabled && metamask.isConnected()) {
        isMarketEnabled = false
        this.cleanupMarketMakerOrder()
        actions.notifications.show(constants.notifications.Message, {
          message: (
            <FormattedMessage
              id="MM_TurnOffMarketmaking"
              defaultMessage="Marketmaking disabled because of your external wallet is connected"
            />
          ),
        })
        feedback.marketmaking.disabled('User connected to external wallet')
      }

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

  async componentWillUnmount() {
    const { mnemonicSaved } = this.state

    this._mounted = false

    if (mnemonicSaved) {
      //@ts-ignore: strictNullChecks
      SwapApp.shared().off('swap attached', this._handleSwapAttachedHandle)
      //@ts-ignore: strictNullChecks
      SwapApp.shared().off('swap enter step', this._handleSwapEnterStep)
    }
  }

  handleCreateWallet = () => {
    const {
      history,
      match: {
        params: {
          utxoCoin = 'btc'
        }
      }
    } = this.props

    history.push(`${links.createWallet}/${utxoCoin.toUpperCase()}`)
  }

  handleSaveMnemonic = () => {
    actions.modals.open(constants.modals.SaveWalletSelectMethod, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicSaved = (mnemonic === `-`)

        this.setState(() => ({
          mnemonicSaved,
        }))
      }
    })
  }

  handleRestoreMnemonic() {
    actions.modals.open(constants.modals.RestoryMnemonicWallet, {
      noRedirect: true,
      onClose: () => { window.location.reload() }
    })
  }

  handleToggleMarketmaker() {
    const { isMarketEnabled } = this.state

    const {
      ethBalance,
      utxoBalance,
      tokenBalance,
      evmCoinWallet,
      tokenWallet,
      utxoCoin,
    } = this.state

    const isEthBalanceOk = new BigNumber(ethBalance).isGreaterThanOrEqualTo(0.02)
    const isTokenBalanceOk = new BigNumber(tokenBalance).isGreaterThan(0)
    const isUtxoBalanceOk = new BigNumber(utxoBalance).isGreaterThan(0)

    let hasError = false

    if (metamask.isConnected()) {
      hasError = true
      actions.modals.open(constants.modals.AlertModal, {
        message: (
          <FormattedMessage
            id="MM_DisconnectExternalWallet"
            defaultMessage="Marketmakig works only with internal wallet. Please disconnnect external wallet"
          />
        ),
        labelOk: (
          <FormattedMessage
              id="MetamaskDisconnect"
              defaultMessage="Disconnect wallet"
            />
        ),
        canClose: true,
        onClose: () => {
          metamask.disconnect()
          actions.modals.close(constants.modals.AlertModal)
        }
      })
      feedback.marketmaking.prevented(`Tried to enable mm with connected external wallet `)
    }
    if (!isEthBalanceOk) {
      hasError = true
      const AB_Coin = evmCoinWallet.currency.toUpperCase()
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
    if (!isTokenBalanceOk && !isUtxoBalanceOk) {
      hasError = true
      const token = tokenWallet.tokenKey.toUpperCase()
      actions.modals.open(constants.modals.AlertModal, {
        message: (
          <FormattedMessage
            id="MM_NotEnoughCoins"
            defaultMessage="Insufficient funds. You need to top up your {utxoCoin} or {token}"
            values={{
              token,
              utxoCoin: utxoCoin.toUpperCase()
            }}
          />
        ),
      })
      feedback.marketmaking.prevented(`Not enough ${utxoCoin} or ${token}`)
    }
    if (!hasError) {
      this.setState({
        isMarketEnabled: !isMarketEnabled,
        isUtxoBalanceOk,
        isEthBalanceOk,
        isTokenBalanceOk
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
        isMarketEnabled: false
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
      tokenWallet,
      ethBalance,
      isTokenBalanceOk,
      utxoCoin,
      utxoBalance,
      isUtxoBalanceOk,
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
        buyCurrency: utxoCoin.toUpperCase(),
        buyBlockchain: ``,
        sellCurrency: tokenWallet.tokenKey.toUpperCase(),
        sellBlockchain: tokenWallet.blockchain.toUpperCase(),
      }
      console.log(sellTokenOrderData)
      //@ts-ignore: strictNullChecks
      const sellOrder = SwapApp.shared().services.orders.create(sellTokenOrderData)
      console.log('sellOrder', sellOrder)
      actions.core.setupPartialOrder(sellOrder)
    }
    if (isUtxoBalanceOk) {
      const buyTokenExchangeRate =
        new BigNumber(100).plus(
          new BigNumber(100).times(marketSpread)
        ).dividedBy(100).toNumber()

      const buyAmount = new BigNumber(utxoBalance).times(buyTokenExchangeRate).toNumber()

      const buyTokenOrderData = {
        balance: utxoBalance,
        sellAmount: utxoBalance,
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
        sellCurrency: utxoCoin,
        sellBlockchain: ``,
        buyCurrency: tokenWallet.tokenKey.toUpperCase(),
        buyBlockchain: tokenWallet.blockchain.toUpperCase(),
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
      utxoWallet,
      utxoCoin,
      utxoBalance,
      evmCoinWallet,
      tokenWallet,
      tokenBalance,
      ethBalance,
      isBalanceFetching,
      isMarketEnabled,
      isWalletCreated,
      mnemonicSaved,
    } = this.state

    const totalBalance = new BigNumber(utxoBalance).plus(tokenBalance).toNumber()

    const sortedSwaps = swapsIds.sort((aId, bId) => {
      return swapsByIds[bId].createUnixTimeStamp - swapsByIds[aId].createUnixTimeStamp
    })
    return (
      <div styleName="mm-settings-page">
        <div styleName="promoText">
          <h2>
            <FormattedMessage
              id="MM_Promo_Title"
              defaultMessage="Earn interest on {utxoTitle}"
              values={{
                utxoTitle: utxoWallet?.fullName || 'Bitcoin'
              }}
            />
          </h2>
          <p>
            {tokenWallet && evmCoinWallet && (
              <FormattedMessage
                id="MM_Promo_TitleBody"
                defaultMessage="On swap.io users exchange {utxoCoin} for {token} (a token that costs like {utxoCoin}, but works on {Ab_Title}), and vice versa."
                values={{
                  utxoCoin: utxoCoin.toUpperCase(),
                  token: tokenWallet.tokenKey.toUpperCase(),
                  Ab_Title: evmCoinWallet.fullName,
                  link: <a href={links.impermanentLoss} target="_blank">(?)</a>,
                }}
              />
            )}
          </p>
        </div>

        <section>
        {!mnemonicSaved && (
          <>
            <h3 styleName="start-here">
              <FormattedMessage
                id="MM_StartHere"
                defaultMessage="Start marketmaking here"
              />
            </h3>
            <p styleName="wallet-required">
              <FormattedMessage
                id="MM_Wallet_Required"
                defaultMessage="A hot wallet is required to launch marketmaking ({utxoCoin}, {AB_Coin}, {token})."
                values={{
                  utxoCoin: utxoCoin.toUpperCase(),
                  token: tokenWallet?.currency?.toUpperCase(),
                  AB_Coin: evmCoinWallet?.currency?.toUpperCase(),
                }}
              />
            </p>
            <div styleName='wallet-buttons'>
              {isWalletCreated ? (
                <div styleName='wallet-button'>
                  <Button blue onClick={this.handleSaveMnemonic}>
                    <FormattedMessage
                      id="BTCMS_SaveMnemonicButton"
                      defaultMessage="Save secret phrase"
                    />
                  </Button>
                </div>
              ) : (
                <div styleName='wallet-button'>
                  <Button blue onClick={this.handleCreateWallet}>
                    <FormattedMessage
                      id="menu.CreateWallet"
                      defaultMessage="Create wallet"
                    />
                  </Button>
                </div>
              )}
              <div styleName='wallet-button'>
                <Button blue onClick={this.handleRestoreMnemonic.bind(this)}>
                  <FormattedMessage
                    id="MM_Wallet_Restore"
                    defaultMessage="Restore from 12-word seed"
                  />
                </Button>
              </div>
            </div>
          </>
        )}
        {!isBalanceFetching && tokenWallet && mnemonicSaved ? (
          <div styleName={`section-items`}>
            <div styleName='section-items__item' style={{ zIndex: 2 }}> {/* zIndex need for Tooltip */}
              <div styleName={`mm-toggle`}>
                <p styleName='mm-toggle__text'>
                  <FormattedMessage
                    id="MM_ToggleText"
                    defaultMessage="Marketmaking {utxoCoin}/{token}"
                    values={{
                      utxoCoin: utxoCoin.toUpperCase(),
                      token: tokenWallet.tokenKey.toUpperCase(),
                    }}
                  />
                </p>
                <span styleName='mm-toggle__switch'>
                  <Toggle checked={isMarketEnabled} onChange={this.handleToggleMarketmaker.bind(this)} />
                </span>
              </div>
              <div styleName='item-text__secondary'>
                {isMarketEnabled ? (
                  <span styleName='warning'>
                    <FormattedMessage
                      id="MM_ToggleTextEnabled"
                      defaultMessage="Warning! You must be online all the time..."
                    />
                    {' '}
                    <Tooltip id="WarningMessage">
                      <span styleName="tooltipText">
                        <FormattedMessage
                          id="MM_WarningMessage"
                          defaultMessage="Warning! You must stay online all the time, otherwise you will not earn or if the swap is processing (can takes a few hour) you may LOOSE your funds! If you can't guarantee long uptime - turn off marketmakeing."
                        />
                      </span>
                    </Tooltip>
                  </span>
                ) : (
                  <FormattedMessage
                    id="MM_ToggleTextDisabled"
                    defaultMessage="Turn on this toggle to start earn"
                  />
                )}
              </div>
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
                      defaultMessage="On swap.io users exchange {utxoCoin} for {token} (a token that costs like {utxoCoin}, but works on {Ab_Title}), and vice versa."
                      values={{
                        utxoCoin: utxoCoin.toUpperCase(),
                        token: tokenWallet.tokenKey.toUpperCase(),
                        Ab_Title: evmCoinWallet.fullName,
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
                    defaultMessage="{token} + {utxoCoin}"
                    values={{
                      utxoCoin: utxoCoin.toUpperCase(),
                      token: tokenWallet.tokenKey.toUpperCase(),
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
                    defaultMessage="{token} + {utxoCoin}"
                    values={{
                      utxoCoin: utxoCoin.toUpperCase(),
                      token: tokenWallet.tokenKey.toUpperCase(),
                    }}
                  />
                </span>
              </p>
            </div>
            {(true) && (
              <>
                <div styleName='section-items__item'>
                  {utxoWallet ? (
                      <>
                        <h2 styleName='item-text__secondary-title'>
                          <FormattedMessage
                            id="MM_BTCBalance"
                            defaultMessage="Balance {utxoCoin}:"
                            values={{
                              utxoCoin: utxoCoin.toUpperCase(),
                            }}
                          />
                        </h2>
                        <p>
                          {utxoCoin === 'btc' && (
                            <>
                              <img src={btc} alt="btc" />
                              {' '}
                            </>
                          )}
                          <span id='btcBalance' styleName='balanceSecondary'>{utxoBalance}</span>
                        </p>
                        <hr />
                        <p styleName='item-text__secondary'>
                          <FormattedMessage
                            id="MM_DepositeWallet"
                            defaultMessage="to top up, transfer to"
                          />
                          <br />
                          <Address address={utxoWallet.address} format={AddressFormat.Full} />
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 styleName='item-text__secondary-title'>
                          <FormattedMessage
                            id="MM_BTCBalance"
                            defaultMessage="Balance {utxoCoin}:"
                            values={{
                              utxoCoin: utxoCoin.toUpperCase()
                            }}
                          />
                        </h2>
                        <p>
                          {utxoCoin === 'btc' && (
                            <>
                              <img src={btc} alt="btc" />
                              {' '}
                            </>
                          )}
                          <span id='btcBalance' styleName='balanceSecondary'>{utxoBalance}</span>
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
                        token: tokenWallet.tokenKey.toUpperCase(),
                      }}
                    />
                  </h2>
                  <div>
                    {utxoCoin === 'btc' && (
                      <>
                        {config.binance ? (
                          <img src={btc} alt="btcb" />
                        ): (
                          <img styleName='iconPosition' src={wbtc} alt="wbtc" />
                        )}
                        {' '}
                      </>
                    )}
                    <span id='tokenBalance' styleName='balanceSecondary'>{tokenBalance}</span>
                    {' '}
                    {tokenWallet && (
                      <Tooltip id="WhatIsToken">
                        <span styleName="tooltipText">
                          <FormattedMessage
                            id="MM_whatIsWBTCTooltip1"
                            defaultMessage="{tokenFullName} ({token}) is an {tokenStandart} token that represents {utxoTitle} ({utxoCoin}) on the {blockchainName} blockchain."
                            values={{
                              utxoTitle: utxoWallet?.fullName || 'Bitcoin',
                              utxoCoin: utxoCoin.toUpperCase(),
                              tokenFullName: tokenWallet.fullName,
                              tokenStandart: tokenWallet.standard.toUpperCase(),
                              token: tokenWallet.currency.toUpperCase(),
                              blockchainName: evmCoinWallet.fullName,
                            }}
                          />
                          <br />
                          <FormattedMessage
                            id="MM_whatIsWBTCTooltip2"
                            defaultMessage="{token} was created to allow {utxoTitle} holders to participate in decentralized finance (“DeFi”) apps that are popular on {blockchainName}."
                            values={{
                              utxoTitle: utxoWallet?.fullName || 'Bitcoin',
                              token: tokenWallet.currency.toUpperCase(),
                              blockchainName: evmCoinWallet.fullName,
                            }}
                          />
                        </span>
                      </Tooltip>
                    )}
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
                  {evmCoinWallet && (
                    <>
                      <p styleName='item-text__secondary'>
                        <FormattedMessage
                          id="MM_ETHBalance"
                          defaultMessage="Balance {AB_Coin}: {balance} (for miners fee)"
                          values={{
                            AB_Coin: evmCoinWallet.currency.toUpperCase(),
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
                        <Address address={evmCoinWallet.address} format={AddressFormat.Full} />
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {mnemonicSaved && (
              <div styleName='controls-loader'>
                <InlineLoader />
              </div>
            )}
          </>
        )}
        </section>

        {/* Swaps history + Active swaps */}
        { mnemonicSaved && (
          <section>
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


        <FAQ />
      </div>
    )
  }
}

export default injectIntl(MarketmakerSettings)
