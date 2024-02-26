import { Component } from 'react'
import { connect } from 'redaction'
import reducers from 'redux/core/reducers'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import feedback from 'shared/helpers/feedback'
import { getActivatedCurrencies } from 'helpers/user'
import config from 'helpers/externalConfig'
import getCoinInfo from 'common/coins/getCoinInfo'
import { defaultPack, widgetPack } from './startPacks'
import FirstStep from './FirstStep'
import SecondStep from './SecondStep'

const isWidgetBuild = config && config.isWidget
const { curEnabled } = config.opts

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
        this.defaultStartPack.push({ name: 'BTC', capture: 'Bitcoin' })
      }
      if (!curEnabled || curEnabled.ghost) {
        this.defaultStartPack.push({ name: 'GHOST', capture: 'Ghost' })
      }
      if (!curEnabled || curEnabled.next) {
        this.defaultStartPack.push({ name: 'NEXT', capture: 'NEXT.coin' })
      }

      Object.values(config.enabledEvmNetworks).forEach(({ currency, chainName }: EvmNetworkConfig) => {
        if (currency && chainName) {
          this.defaultStartPack.push({ name: currency, capture: chainName })
        }
      })

      // Multi token build
      config.opts.ownTokens.forEach((token) => {
        const name = token.name.toLowerCase()
        const standard = token.standard.toLowerCase()

        this.defaultStartPack.push({
          name: name.toUpperCase(),
          capture: token.fullName,
          baseCurrency: TOKEN_STANDARDS[standard].currency.toUpperCase(),
        })
      })

      if (config.opts.addCustomTokens) {
        if (config.erc20 && (!curEnabled || curEnabled.eth)) this.defaultStartPack.push({ name: 'ERC20', capture: 'Token', baseCurrency: 'ETH' })
        if (config.bep20 && (!curEnabled || curEnabled.bnb)) this.defaultStartPack.push({ name: 'BEP20', capture: 'Token', baseCurrency: 'BNB' })
        if (config.erc20matic && (!curEnabled || curEnabled.matic)) this.defaultStartPack.push({ name: 'ERC20MATIC', capture: 'Token', baseCurrency: 'MATIC' })
        if (config.erc20xdai && (!curEnabled || curEnabled.xdai)) this.defaultStartPack.push({ name: 'ERC20XDAI', capture: 'Token', baseCurrency: 'XDAI' })
        if (config.erc20ftm && (!curEnabled || curEnabled.ftm)) this.defaultStartPack.push({ name: 'ERC20FTM', capture: 'Token', baseCurrency: 'FTM' })
        if (config.erc20avax && (!curEnabled || curEnabled.avax)) this.defaultStartPack.push({ name: 'ERC20AVAX', capture: 'Token', baseCurrency: 'AVAX' })
        if (config.erc20movr && (!curEnabled || curEnabled.movr)) this.defaultStartPack.push({ name: 'ERC20MOVR', capture: 'Token', baseCurrency: 'MOVR' })
        if (config.erc20one && (!curEnabled || curEnabled.one)) this.defaultStartPack.push({ name: 'ERC20ONE', capture: 'Token', baseCurrency: 'ONE' })
        if (config.erc20ame && (!curEnabled || curEnabled.ame)) this.defaultStartPack.push({ name: 'ERC20AME', capture: 'Token', baseCurrency: 'AME' })
        if (config.erc20aurora && (!curEnabled || curEnabled.aureth)) this.defaultStartPack.push({ name: 'ERC20AURORA', capture: 'Token', baseCurrency: 'AURETH' })
        if (config.phi20_v1 && (!curEnabled || curEnabled.phi_v1)) this.defaultStartPack.push({ name: 'PHI20_V1', capture: 'Token', baseCurrency: 'PHI_V1' })
        if (config.phi20 && (!curEnabled || curEnabled.phi)) this.defaultStartPack.push({ name: 'PHI20', capture: 'Token', baseCurrency: 'PHI' })
        if (config.fkw20 && (!curEnabled || curEnabled.fkw)) this.defaultStartPack.push({ name: 'FKW20', capture: 'Token', baseCurrency: 'FKW' })
        if (config.phpx20 && (!curEnabled || curEnabled.phpx)) this.defaultStartPack.push({ name: 'PHPX20', capture: 'Token', baseCurrency: 'PHPX' })
      }
    }

    const enabledCurrencies = getActivatedCurrencies()

    const items = currencies
      .filter(({ addAssets }) => addAssets)
      // @ts-ignore: strictNullChecks
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
        window.widgetEvmLikeTokens.reverse().forEach((token) => {
          const name = token.name.toLowerCase()
          const standard = token.standard.toLowerCase()
          const baseCurrency = TOKEN_STANDARDS[standard].currency.toUpperCase()
          const isTokenAdded = this.widgetStartPack.find((packToken) =>
            // @ts-ignore
            packToken.name?.toLowerCase() === name && packToken.standard?.toLowerCase() === standard,
          )

          if (config[standard][name] && !isTokenAdded) {
            this.widgetStartPack.unshift({
              name: name.toUpperCase(),
              capture: config[standard][name].fullName,
              // @ts-ignore
              standard,
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

    // Порядок коинов в списке
    if (config.opts.createWalletCoinsOrder && config.opts.createWalletCoinsOrder.length) {
      const sortPacks = (packList) => {
        const setCoinOrder = (coinInfo, order) => {
          const {
            coin,
            blockchain,
          } = getCoinInfo(coinInfo)
          let isCustomToken = false
          let customTokenType = ``
          const tokenStandard = new RegExp(
            [
              '^CUSTOM_(',
              'ERC20|BEP20|PHI20_V1|PHI20|FKW20|ERC20MATIC|ERC20XDAI|ERC20FTM|',
              'ERC20AVAX|ERC20MOVR|ERC20ONE|ERC20AME|ERC20AURORA',
              ')$',
            ].join('')
          )

          if (
            !!coinInfo.match(tokenStandard)
          ) {
            ;[customTokenType] = coinInfo.split(`_`)
            isCustomToken = true
          }
          Object.keys(packList).forEach((coinIndex) => {
            if (isCustomToken) {
              if (packList[coinIndex].name === customTokenType
                && packList[coinIndex].capture === `Token`
              ) {
                packList[coinIndex].order = order
                return false
              }
            } else {
              if (blockchain) {
                if (packList[coinIndex].name === coin
                  && packList[coinIndex].baseCurrency === blockchain.toUpperCase()
                ) {
                  packList[coinIndex].order = order
                  return false
                }
              } else {
                if (packList[coinIndex].name === coin) {
                  packList[coinIndex].order = order
                  return false
                }
              }
            }
          })
        }
        Object.keys(packList).forEach((coinIndex, index) => {
          packList[coinIndex].order = packList.length + index
        })
        config.opts.createWalletCoinsOrder.forEach((coin, order) => {
          setCoinOrder(coin, order)
        })
        packList.sort((pack1, pack2) => pack1.order - pack2.order)
      }
      sortPacks((isWidgetBuild) ? this.widgetStartPack : this.defaultStartPack)
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
      currenciesForSecondStep,
      showPinContent,
    } = this.props
    const { curState, startPack } = this.state

    return (
      <div>
        {
          forcedCurrencyData
            ? (
              <SecondStep
                error={error}
                onClick={onClick}
                currencies={currenciesForSecondStep}
                setError={setError}
                handleClick={this.handleClick}
                btcData={btcData}
                forcedCurrencyData
              />
            )
            : (
              <div>
                {
                  step === 1
                && (
                  <FirstStep
                    error={error}
                    onClick={onClick}
                    setError={setError}
                    handleClick={this.handleClick}
                    curState={curState}
                    startPack={startPack}
                    showPinContent={showPinContent}
                  />
                )
                }
                {
                  step === 2
                && (
                  <SecondStep
                    error={error}
                    btcData={btcData}
                    onClick={onClick}
                    currencies={currenciesForSecondStep}
                    setError={setError}
                    handleClick={this.handleClick}
                  />
                )
                }
              </div>
            )
        }
      </div>
    )
  }
}
