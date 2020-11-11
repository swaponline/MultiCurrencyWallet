import React, { Component } from 'react'
import { connect } from 'redaction'
import reducers from 'redux/core/reducers'

import feedback from 'shared/helpers/feedback'
import { getActivatedCurrencies } from 'helpers/user'
import config from 'helpers/externalConfig'

import { FormattedMessage } from 'react-intl'
import FirstStep from './FirstStep'
import SecondStep from './SecondStep'

const isWidgetBuild = config && config.isWidget

@connect(({ currencies: { items: currencies } }) => ({ currencies }))
// TODO: переименовать компонент
export default class LogicForSteps extends Component {
  widgetStartPack = [
    ...(!config.opts.curEnabled || config.opts.curEnabled.btc) ? [{ name: "BTC", capture: "Bitcoin" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.eth) ? [{ name: "ETH", capture: "Ethereum" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.ghost) ? [{ name: "GHOST", capture: "Ghost" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.next) ? [{ name: "NEXT", capture: "NEXT.coin" }] : [],
  ]

  defaultStartPack = [
    ...widgetStartPack,
    { name: "SWAP", capture: "Swap" },
    { name: "USDT", capture: "Tether" },
    { name: "EURS", capture: "Eurs" },
  ]

  constructor(props) {
    super()
    const { currencies } = props
    
    if (config
      && config.opts
      && config.opts.ownTokens
      && Object.keys(config.opts.ownTokens)
      && Object.keys(config.opts.ownTokens).length
    ) {
      defaultStartPack = []
      if (!config.opts.curEnabled || config.opts.curEnabled.btc) {
        defaultStartPack.push({ name: "BTC", capture: "Bitcoin" })
      }
      if (!config.opts.curEnabled || config.opts.curEnabled.eth) {
        defaultStartPack.push({ name: "ETH", capture: "Ethereum" })
      }
      if (!config.opts.curEnabled || config.opts.curEnabled.ghost) {
        defaultStartPack.push({ name: "GHOST", capture: "Ghost" })
      }
      if (!config.opts.curEnabled || config.opts.curEnabled.next) {
        defaultStartPack.push({ name: "NEXT", capture: "NEXT.coin" })
      }
      const ownTokensKeys = Object.keys(config.opts.ownTokens)

      // defaultStartPack has 5 slots
      if (ownTokensKeys.length >= 1 && (5 - defaultStartPack.length)) {
        defaultStartPack.push({
          name: ownTokensKeys[0].toUpperCase(),
          capture: config.opts.ownTokens[ownTokensKeys[0]].fullName,
        })
      }
      if (ownTokensKeys.length >= 2 && (5 - defaultStartPack.length)) {
        defaultStartPack.push({
          name: ownTokensKeys[1].toUpperCase(),
          capture: config.opts.ownTokens[ownTokensKeys[1]].fullName,
        })
      }
      if (ownTokensKeys.length >= 3 && (5 - defaultStartPack.length)) {
        defaultStartPack.push({
          name: ownTokensKeys[2].toUpperCase(),
          capture: config.opts.ownTokens[ownTokensKeys[2]].fullName,
        })
      }
    }

    const enabledCurrencies = getActivatedCurrencies()
    const items = currencies
      .filter(({ addAssets, name }) => addAssets)
      .filter(({ name }) => enabledCurrencies.includes(name))
    const untouchable = defaultStartPack.map(({ name }) => name)

    const coins = items
      .map(({ name, fullTitle }) => ({ name, capture: fullTitle }))
      .filter(({ name }) => !untouchable.includes(name))

    const curState = {}
    items.forEach(({ currency }) => { curState[currency] = false })
    if (isWidgetBuild && config && config.erc20) {
      if (window && window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
        // Multi token build
        Object.keys(window.widgetERC20Tokens).forEach((tokenSymbol) => {
          if (config.erc20[tokenSymbol]) {
            widgetStartPack.push({
              name: tokenSymbol.toUpperCase(),
              capture: config.erc20[tokenSymbol].fullName,
            })
          }
        })
      } else {
        // Single token build
        if (config.erc20[config.erc20token]) {
          widgetStartPack.push({
            name: config.erc20token.toUpperCase(),
            capture: config.erc20[config.erc20token].fullName,
          })
        }
      }
    }
    this.state = { curState, coins, startPack: (isWidgetBuild) ? widgetStartPack : defaultStartPack }
  }


  handleClick = name => {
    feedback.createWallet.currencySelected(name)
    const { setError } = this.props
    const { curState } = this.state

    const dataToReturn = { [name]: !curState[name] }
    this.setState(() => ({ curState: dataToReturn }))
    reducers.createWallet.newWalletData({ type: 'currencies', data: dataToReturn })
    setError(null)
  }

  etcClick = () => {
    const { coins, startPack, all } = this.state
    let newStartPack = defaultStartPack
    if (!all) {
      if (config.opts.addCustomERC20) {
        newStartPack = [{
          name: 'Custom ERC20',
          capture: <FormattedMessage id="createWallet_customERC20" defaultMessage="Подключить токен" />,
        }, ...startPack, ...coins]
      } else {
        newStartPack = [...startPack, ...coins]
      }
    }
    this.setState(() => ({ startPack: newStartPack, all: !all }))
  }

  render() {
    const { 
      forcedCurrencyData, 
      onClick, 
      error, 
      setError, 
      btcData, 
      ethData, 
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
              etcClick={this.etcClick}
              handleClick={this.handleClick}
              forcedCurrencyData
            />
          : (
            <div>
              {
                step === 1 && 
                <FirstStep 
                  error={error} 
                  onClick={validate}
                  setError={setError}
                  etcClick={this.etcClick}
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
                  onClick={validate} 
                  currencies={currenciesForSecondStep}
                  setError={setError}
                  etcClick={this.etcClick}
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