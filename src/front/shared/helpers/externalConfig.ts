import config from 'app-config'
import { util } from 'swap.app'
import actions from 'redux/actions'
import { constants } from 'swap.app'
import BigNumber from 'bignumber.js'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'


const GetCustromERC20 = () => {
  const configStorage = (process.env.MAINNET) ? 'mainnet' : 'testnet'

  let tokensInfo = JSON.parse(localStorage.getItem('customERC'))
  if (!tokensInfo || !tokensInfo[configStorage]) return {}
  return tokensInfo[configStorage]
}

const initExternalConfig = () => {
  // Add to swap.core not exists tokens
  Object.keys(config.erc20).forEach((tokenCode) => {
    if (!constants.COIN_DATA[tokenCode]) {
      console.info('Add token to swap.core', tokenCode, config.erc20[tokenCode].address, config.erc20[tokenCode].decimals, config.erc20[tokenCode].fullName)
      util.erc20.register(tokenCode, config.erc20[tokenCode].decimals)
      actions[tokenCode] = actions.token
    }
  })
}

const externalConfig = () => {
  // Reconfigure app config if it widget or use external config
  if (config.opts && config.opts.inited) {
    return config
  }

  config.opts = {
    inited: true,
    curEnabled: {
      eth: true,
      btc: true,
      ghost: true,
      next: true,
    },
    ownTokens: false,
    addCustomERC20: true,
    invoiceEnabled: true,
    showWalletBanners: false,
    showHowItsWork: false,
    fee: {},
    hideShowPrivateKey: false,
    plugins: {
      setItemPlugin: false,
      getItemPlugin: false,
      userDataPluginApi: false,
      backupPlugin: false,
      backupPluginUrl: false,
      restorePluginUrl: false,
    },
    WPuserHash: false,
    buyViaCreditCardLink: false,
    activeFiat: 'USD',
    exchangeDisabled: false,
    ui: {
      footerDisabled: false,
    },
  }


  if (window
    && window._ui_footerDisabled
  ) {
    config.opts.ui.footerDisabled = window._ui_footerDisabled
  }

  if (window
    && window.WPuserHash
  ) {
    config.opts.WPuserHash = window.WPuserHash
    window.WPuserHash = false
  }

  if (window
    && window.showHowItWorksOnExchangePage
  ) {
    config.showHowItsWork = window.showHowItWorksOnExchangePage
  }

  if (window
    && window.buildOptions
    && Object.keys(window.buildOptions)
    && Object.keys(window.buildOptions).length
  ) {
    config.opts = { ...config.opts, ...window.buildOptions }
  }

  if (window
    && window.DEFAULT_FIAT
  ) {
    config.opts.activeFiat = window.DEFAULT_FIAT
  }
  reducers.user.setActiveFiat({ activeFiat: config.opts.activeFiat })

  if (window
    && window.EXCHANGE_DISABLED
  ) {
    config.opts.exchangeDisabled = window.EXCHANGE_DISABLED
  }


  // Plugin: enable/disable currencies

  if (window && window.CUR_BTC_DISABLED === true) {
    config.opts.curEnabled.btc = false
  }

  if (window && window.CUR_GHOST_DISABLED === true) {
    config.opts.curEnabled.ghost = false
  }

  if (window && window.CUR_NEXT_DISABLED === true) {
    config.opts.curEnabled.next = false
  }

  if (window && window.CUR_ETH_DISABLED === true) {
    config.opts.curEnabled.eth = false
  }


  // Plugins
  if (window
    && window.backupPlugin
    && window.backupUrl
    && window.restoreUrl
  ) {
    config.opts.plugins.backupPlugin = window.backupPlugin
    config.opts.plugins.backupPluginUrl = window.backupUrl
    config.opts.plugins.restorePluginUrl = window.restoreUrl
  }

  if (window
    && window.setItemPlugin
  ) {
    config.opts.plugins.setItemPlugin = window.setItemPlugin
  }
  if (window
    && window.getItemPlugin
  ) {
    config.opts.plugins.getItemPlugin = window.getItemPlugin
  }
  if (window
    && window.userDataPluginApi
  ) {
    config.opts.plugins.userDataPluginApi = window.userDataPluginApi
  }

  // ------
  if (window
    && window.buyViaCreditCardLink
  ) {
    config.opts.buyViaCreditCardLink = window.buyViaCreditCardLink
  }

  if (window
    && window.SWAP_HIDE_EXPORT_PRIVATEKEY !== undefined
  ) {
    config.opts.hideShowPrivateKey = window.SWAP_HIDE_EXPORT_PRIVATEKEY
  }

  if (window
    && window.widgetERC20Tokens
    && Object.keys(window.widgetERC20Tokens)
  ) {
    config.opts.ownTokens = window.widgetERC20Tokens
  }

  if ((config && config.isWidget) || config.opts.ownTokens) {
    // clean old erc20 config - leave only swap token (need for correct swap work)
    if (!config.isWidget) {
      const newERC20 = {}
      // newERC20.swap = config.erc20.swap
      config.erc20 = newERC20
    }

    if (Object.keys(config.opts.ownTokens).length) {
      // Multi token mode
      Object.keys(config.opts.ownTokens).forEach((key) => {
        const tokenData = config.opts.ownTokens[key]
        config.erc20[key] = tokenData
      })
    }

    // Clean not inited single-token
    // Обходим оптимизацию, нам нельзя, чтобы в этом месте было соптимизированно в целую строку {#WIDGETTOKENCODE#}
    const wcPb = `{#`
    const wcP = (`WIDGETTOKENCODE`).toUpperCase()
    const wcPe = `#}`
    const cleanERC20 = {}
    Object.keys(config.erc20).forEach((key) => {
      if (key !== (`${wcPb}${wcP}${wcPe}`)) {
        cleanERC20[key] = config.erc20[key]
      }
    })
    config.erc20 = cleanERC20
  }
  if (!config.isWidget && config.opts.addCustomERC20) {
    // Add custom tokens
    const customERC = GetCustromERC20()

    Object.keys(customERC).forEach((tokenContract) => {
      if (!config.erc20[customERC[tokenContract].symbol.toLowerCase()]) {
        config.erc20[customERC[tokenContract].symbol.toLowerCase()] = {
          address: customERC[tokenContract].address,
          decimals: customERC[tokenContract].decimals,
          fullName: customERC[tokenContract].symbol,
        }
      }
    })
  }

  // Comission config - default false
  if (window
    && window.widgetERC20Comisions
    && Object.keys(window.widgetERC20Comisions)
  ) {
    let setErc20FromEther = false

    Object.keys(window.widgetERC20Comisions).filter((key) => {
      const curKey = key.toLowerCase()
      if (window.widgetERC20Comisions[curKey]) {
        let { fee, address, min } = window.widgetERC20Comisions[curKey]
        let feeOk = false
        let minOk = false

        // @ToDo add currency isAddress Check
        if (fee && address && min) {
          try {
            fee = new BigNumber(fee.replace(',', '.')).toNumber()
            feeOk = true
          } catch (e) {
            console.error(`Fail convert ${fee} to number for ${curKey}`)
          }
          try {
            min = new BigNumber(min.replace(',', '.')).toNumber()
            minOk = true
          } catch (e) {
            console.error(`Fail convert ${min} to number for ${curKey}`)
          }

          if (minOk && feeOk) {
            config.opts.fee[curKey.toLowerCase()] = {
              fee,
              address,
              min,
            }
          }
        } else {
          if (curKey.toLowerCase() === `erc20` && address) {
            setErc20FromEther = true
            config.opts.fee[curKey.toLowerCase()] = {
              address,
            }
          }
        }
      }
    })
    if (setErc20FromEther
      && config.opts.fee.eth
      && config.opts.fee.eth.min
      && config.opts.fee.eth.fee
    ) {
      config.opts.fee.erc20.min = config.opts.fee.eth.min
      config.opts.fee.erc20.fee = config.opts.fee.eth.fee
    }
  }

  console.log('externalConfig', config)
  return config
}

export default externalConfig()

export {
  externalConfig,
  initExternalConfig,
}
