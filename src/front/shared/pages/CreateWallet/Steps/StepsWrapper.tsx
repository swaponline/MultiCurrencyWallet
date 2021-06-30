import React, { Component } from 'react'
import { connect } from 'redaction'
import reducers from 'redux/core/reducers'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import feedback from 'shared/helpers/feedback'
import { getActivatedCurrencies } from 'helpers/user'
import config from 'helpers/externalConfig'
import { defaultPack, widgetPack } from './startPacks'
import FirstStep from './FirstStep'
import SecondStep from './SecondStep'

const isWidgetBuild = config && config.isWidget
const curEnabled = config.opts.curEnabled


@connect(({ currencies: { items: currencies } }) => ({ currencies }))
export default class StepsWrapper extends Component<any, any> {

  defaultStartPack = defaultPack
  widgetStartPack = widgetPack

  constructor(props) {
    super(props)
    const { currencies } = props
    
    if (config?.opts.ownTokens?.length) {
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
      if (!curEnabled || curEnabled.matic) {
        this.defaultStartPack.push({ name: "MATIC", capture: "Matic token" })
      }
      if (!curEnabled || curEnabled.arbeth) {
        this.defaultStartPack.push({ name: "ARBETH", capture: "Arbitrum ETH" })
      }
      if (!curEnabled || curEnabled.ghost) {
        this.defaultStartPack.push({ name: "GHOST", capture: "Ghost" })
      }
      if (!curEnabled || curEnabled.next) {
        this.defaultStartPack.push({ name: "NEXT", capture: "NEXT.coin" })
      }

      config.opts.ownTokens.forEach((token) => {
        config[token.standard][token.name.toLowerCase()] = token

        this.defaultStartPack.push({
          name: token.name.toUpperCase(),
          capture: token.fullName,
        })
      })
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
      if (window?.widgetEvmLikeTokens?.length) {
        // Multi token build
        window.widgetEvmLikeTokens.forEach((token) => {
          const name = token.name.toLowerCase()
          const standard = token.standard.toLowerCase()
          const baseCurrency = TOKEN_STANDARDS[standard].currency.toUpperCase()
          const isTokenAdded = this.widgetStartPack.find((packToken) => {
            return packToken.name.toLowerCase() === name
          })

          if (config[standard][name] && !isTokenAdded) {
            this.widgetStartPack.push({
              name: name.toUpperCase(),
              capture: config[standard][name].fullName,
              baseCurrency,
            })
          }
        })
      } else {
        // Single token build
        if (config.erc20[config.erc20token]) {
          this.widgetStartPack.push({
            name: config.erc20token.toUpperCase(),
            capture: config.erc20[config.erc20token].fullName,
            baseCurrency: 'ETH',
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
              btcData={btcData}
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
                />
              }
            </div>
          )
        }
      </div>
    )
  }
}