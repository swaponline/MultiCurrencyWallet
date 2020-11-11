import React, { Component } from 'react'

import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import reducers from 'redux/core/reducers'
import { isMobile } from 'react-device-detect'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'
import Coin from 'components/Coin/Coin'

import Explanation from '../Explanation'
import icons from '../images'
import config from 'helpers/externalConfig'
import { getActivatedCurrencies } from 'helpers/user'
import feedback from 'shared/helpers/feedback'

import Cupture, {
  subHeaderText1,
  subHeaderText2,
  cupture2,
} from './texts'


const isWidgetBuild = config && config.isWidget

@connect(({ currencies: { items: currencies } }) => ({ currencies }))
@CSSModules(styles, { allowMultiple: true })
export default class FirstStep extends Component<any, any> {
  defaultStartPack = [
    ...(!config.opts.curEnabled || config.opts.curEnabled.btc) ? [{ name: "BTC", capture: "Bitcoin" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.eth) ? [{ name: "ETH", capture: "Ethereum" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.ghost) ? [{ name: "GHOST", capture: "Ghost" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.next) ? [{ name: "NEXT", capture: "NEXT.coin" }] : [],
    { name: "SWAP", capture: "Swap" },
    { name: "USDT", capture: "Tether" },
    { name: "EURS", capture: "Eurs" },
  ]

  widgetStartPack = [
    ...(!config.opts.curEnabled || config.opts.curEnabled.btc) ? [{ name: "BTC", capture: "Bitcoin" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.eth) ? [{ name: "ETH", capture: "Ethereum" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.ghost) ? [{ name: "GHOST", capture: "Ghost" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.next) ? [{ name: "NEXT", capture: "NEXT.coin" }] : [],
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
      this.defaultStartPack = []
      if (!config.opts.curEnabled || config.opts.curEnabled.btc) {
        this.defaultStartPack.push({ name: "BTC", capture: "Bitcoin" })
      }
      if (!config.opts.curEnabled || config.opts.curEnabled.eth) {
        this.defaultStartPack.push({ name: "ETH", capture: "Ethereum" })
      }
      if (!config.opts.curEnabled || config.opts.curEnabled.ghost) {
        this.defaultStartPack.push({ name: "GHOST", capture: "Ghost" })
      }
      if (!config.opts.curEnabled || config.opts.curEnabled.next) {
        this.defaultStartPack.push({ name: "NEXT", capture: "NEXT.coin" })
      }
      const ownTokensKeys = Object.keys(config.opts.ownTokens)

      // defaultStartPack has 5 slots
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
    const items = currencies
      .filter(({ addAssets, name }) => addAssets)
      .filter(({ name }) => enabledCurrencies.includes(name))
    const untouchable = this.defaultStartPack.map(({ name }) => name)

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
            this.widgetStartPack.push({
              name: tokenSymbol.toUpperCase(),
              capture: config.erc20[tokenSymbol].fullName,
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
    this.state = { curState, coins, startPack: (isWidgetBuild) ? this.widgetStartPack : this.defaultStartPack }
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
    let newStartPack = this.defaultStartPack
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
    const { onClick, error } = this.props
    const { curState, startPack, all } = this.state

    const coloredIcons = ['btc', 'eth', 'ghost', 'next', 'swap', 'usdt', 'eurs']

    return (
      <div>
        <div>
          <div>
            <Explanation step={1} subHeaderText={subHeaderText1()}>
              {!isWidgetBuild && (
                <Cupture click={this.etcClick} step={1} />
              )}
            </Explanation>
            <div styleName={`currencyChooserWrapper ${startPack.length < 4 ? "smallArr" : ""}`}>
              {startPack.map(el => {
                const { name, capture } = el

                return (
                  <div key={name} styleName={`card ${curState[name] ? 'purpleBorder' : ''}`} onClick={() => this.handleClick(name)}>
                    <div styleName="logo">
                      <Coin styleName={`assetsTableIcon ${coloredIcons.includes(name.toLowerCase()) ? name.toLowerCase() : "coinColor"}`} name={name} />
                    </div>
                    <div styleName="listGroup">
                      <li><b>{name}</b></li>
                      <li>{capture}</li>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <button styleName="continue" onClick={onClick} disabled={error}>
            <FormattedMessage id="createWalletButton1" defaultMessage="Продолжить" />
          </button>
        </div>
        {
          !isMobile &&
          <div>
            <Explanation step={2} subHeaderText={subHeaderText2()} notMain>
              {cupture2()}
            </Explanation>
          </div>
        }
      </div>
    )
  }

}
