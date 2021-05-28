import React, { Component } from 'react'
import { connect } from 'redaction'
import reducers from 'redux/core/reducers'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import feedback from 'shared/helpers/feedback'
import { getActivatedCurrencies } from 'helpers/user'
import config from 'helpers/externalConfig'

import FirstStep from './FirstStep'
import SecondStep from './SecondStep'

const isWidgetBuild = config && config.isWidget
const curEnabled = config.opts.curEnabled


@connect(({ currencies: { items: currencies } }) => ({ currencies }))
export default class StepsWrapper extends Component<any, any> {

  // TODO: it's crazy. Move|split this packs somewhere

  defaultStartPack = [
    ...(!curEnabled || curEnabled.btc) ? [{ name: "BTC", capture: "Bitcoin" }] : [],

    ...(!curEnabled || curEnabled.eth) ? [{ name: "ETH", capture: "Ethereum" }] : [],
    ...config.erc20 ? [{ name: 'ERC20', capture: 'Token' }] : [],

    ...(!curEnabled || curEnabled.bnb) ? [{ name: "BNB", capture: "Binance Coin" }] : [],
    ...config.bep20 ? [{ name: 'BEP20', capture: 'Token' }] : [],

    ...(!curEnabled || curEnabled.ghost) ? [{ name: "GHOST", capture: "Ghost" }] : [],
    ...(!curEnabled || curEnabled.next) ? [{ name: "NEXT", capture: "NEXT.coin" }] : [],

    ...config.bep20 ? [{ name: "BTCB", capture: "BTCB Token" }] : [],
    ...config.erc20 ? [
      { name: "WBTC", capture: "Wrapped Bitcoin" },
      { name: "USDT", capture: "Tether" },
      { name: "EURS", capture: "Eurs" },
    ] : [],
    ...(process.env.MAINNET) ? [{ name: "SWAP", capture: "Swap" }] : [{ name: "WEENUS", capture: "Weenus" }],
  ]

  widgetStartPack = [
    ...config.erc20 ? [{ name: 'ERC20', capture: 'Token' }] : [],
    ...config.bep20 ? [{ name: 'BEP20', capture: 'Token' }] : [],
    ...(!curEnabled || curEnabled.btc) ? [{ name: "BTC", capture: "Bitcoin" }] : [],
    ...(!curEnabled || curEnabled.eth) ? [{ name: "ETH", capture: "Ethereum" }] : [],
    ...(!curEnabled || curEnabled.bnb) ? [{ name: "BNB", capture: "Binance Coin" }] : [],
    ...(!curEnabled || curEnabled.ghost) ? [{ name: "GHOST", capture: "Ghost" }] : [],
    ...(!curEnabled || curEnabled.next) ? [{ name: "NEXT", capture: "NEXT.coin" }] : [],
  ]

  constructor(props) {
    super(props)
    const { currencies } = props
    
    if (config
      && config.opts?.ownTokens
      && Object.keys(config.opts.ownTokens)
      && Object.keys(config.opts.ownTokens).length
    ) {
      this.defaultStartPack = []
      if (!curEnabled || curEnabled.btc) {
        this.defaultStartPack.push({ name: "BTC", capture: "Bitcoin" })
      }
      if (!curEnabled || curEnabled.eth) {
        this.defaultStartPack.push({ name: "ETH", capture: "Ethereum" })
      }
      if (!curEnabled || curEnabled.bnb) {
        this.defaultStartPack.push({ name: "BNB", capture: "Binance Coin" })
      }
      if (!curEnabled || curEnabled.ghost) {
        this.defaultStartPack.push({ name: "GHOST", capture: "Ghost" })
      }
      if (!curEnabled || curEnabled.next) {
        this.defaultStartPack.push({ name: "NEXT", capture: "NEXT.coin" })
      }
      const ownTokensKeys = Object.keys(config.opts.ownTokens)

      // this.defaultStartPack has 5 slots
      if (ownTokensKeys.length >= 1 && (5 - this.defaultStartPack.length)) {
        this.defaultStartPack.push({
          name: ownTokensKeys[0].toUpperCase(),
          capture: config.opts.ownTokens[ownTokensKeys[0]].fullName,
        })
      }
      if (ownTokensKeys.length >= 2 && (5 - this.defaultStartPack.length)) {
        this.defaultStartPack.push({
          name: ownTokensKeys[1].toUpperCase(),
          capture: config.opts.ownTokens[ownTokensKeys[1]].fullName,
        })
      }
      if (ownTokensKeys.length >= 3 && (5 - this.defaultStartPack.length)) {
        this.defaultStartPack.push({
          name: ownTokensKeys[2].toUpperCase(),
          capture: config.opts.ownTokens[ownTokensKeys[2]].fullName,
        })
      }
    }

    const enabledCurrencies = getActivatedCurrencies()

    let items = currencies
      .filter(({ addAssets, name }) => addAssets)
      //@ts-ignore: strictNullChecks
      .filter(({ name }) => enabledCurrencies.includes(name))

    const untouchable = this.defaultStartPack.map(({ name }) => name)

    const coins = items
      .map(({ name, fullTitle }) => ({ name, capture: fullTitle }))
      .filter(({ name }) => !untouchable.includes(name))

    const curState = {}
    items.forEach(({ currency }) => { curState[currency] = false })

    let haveTokenConfig = true 

    Object.keys(TOKEN_STANDARDS).forEach((key) => {
      if (!config[TOKEN_STANDARDS[key].standard]) {
        haveTokenConfig = false
      }
    })

    if (isWidgetBuild && haveTokenConfig) {
      if (window?.widgetERC20Tokens?.length) {
        // Multi token build
        window.widgetERC20Tokens.forEach((token) => {
          const name = token.name.toLowerCase()
          const standard = token.standard.toLowerCase()

          if (config[standard][name]) {
            this.widgetStartPack.push({
              name: name.toUpperCase(),
              capture: config[standard][name].fullName,
            })
          }
        })
      } else {
        // Single token build
        if (config.erc20[config.erc20token]) {
          this.widgetStartPack.push({
            name: config.erc20token.toUpperCase(),
            capture: config.erc20[config.erc20token].fullName,
          })
        }
      }
    }

    this.state = {
      curState,
      coins,
      startPack: (isWidgetBuild) ? this.widgetStartPack : this.defaultStartPack,
    }
  }


  handleClick = (name) => {
    feedback.createWallet.currencySelected(name)
    const { setError } = this.props
    const { curState } = this.state

    const dataToReturn = { [name]: !curState[name] }
    this.setState(() => ({ curState: dataToReturn }))
    reducers.createWallet.newWalletData({ type: 'currencies', data: dataToReturn })
    setError(null)
  }

  render() {
    const { 
      forcedCurrencyData,
      onClick,
      error,
      setError,
      btcData,
      ethData,
      step,
      currenciesForSecondStep
    } = this.props
    const { curState, startPack } = this.state

    return (
      <div>
        {
          forcedCurrencyData 
          ? <SecondStep 
              error={error}
              onClick={onClick}
              currencies={currenciesForSecondStep}
              setError={setError}
              handleClick={this.handleClick}
              forcedCurrencyData
            />
          : (
            <div>
              {
                step === 1 && 
                <FirstStep 
                  error={error} 
                  onClick={onClick}
                  setError={setError}
                  handleClick={this.handleClick}
                  curState={curState}
                  startPack={startPack}
                />
              }
              {
                step === 2 && 
                <SecondStep
                  error={error}
                  btcData={btcData}
                  onClick={onClick} 
                  currencies={currenciesForSecondStep}
                  setError={setError}
                  handleClick={this.handleClick}
                  ethData={ethData}
                />
              }
            </div>
          )
        }
      </div>
    )
  }
}