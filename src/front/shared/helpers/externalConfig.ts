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
  if (config.opts && config.opts.inited) return config

  config.opts = {
    inited: true,
    curEnabled: {
      eth: true,
      btc: true,
      ghost: false,
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
    //@ts-ignore
    && window._ui_footerDisabled
  ) {
    //@ts-ignore
    config.opts.ui.footerDisabled = window._ui_footerDisabled
  }

  if (window
    //@ts-ignore
    && window.WPuserHash
  ) {
    //@ts-ignore
    config.opts.WPuserHash = window.WPuserHash
    //@ts-ignore
    window.WPuserHash = false
  }

  if (window
    //@ts-ignore
    && window.showHowItWorksOnExchangePage
  ) {
    //@ts-ignore
    config.showHowItsWork = window.showHowItWorksOnExchangePage
  }

  if (window
    //@ts-ignore
    && window.buildOptions
    //@ts-ignore
    && Object.keys(window.buildOptions)
    //@ts-ignore
    && Object.keys(window.buildOptions).length
  ) {
    //@ts-ignore
    config.opts = { ...config.opts, ...window.buildOptions }
  }

  if (window
    //@ts-ignore
    && window.DEFAULT_FIAT
  ) {
    //@ts-ignore
    config.opts.activeFiat = window.DEFAULT_FIAT
  }
  reducers.user.setActiveFiat({ activeFiat: config.opts.activeFiat })

  if (window
    //@ts-ignore
    && window.EXCHANGE_DISABLED
  ) {
    //@ts-ignore
    config.opts.exchangeDisabled = window.EXCHANGE_DISABLED
  }
  if (window
    //@ts-ignore
    && window.CUR_BTC_DISABLED
  ) {
    if (!config.opts.curEnabled) config.opts.curEnabled = {}
    config.opts.curEnabled.btc = false
  }

  if (window) {
    if (!config.opts.curEnabled) config.opts.curEnabled = {}
    //@ts-ignore
    if (window.CUR_GHOST_DISABLED !== undefined
      //@ts-ignore
      && window.CUR_GHOST_DISABLED === false
    ) {
      config.opts.curEnabled.ghost = true
    }
  }

  if (window) {
    if (!config.opts.curEnabled) config.opts.curEnabled = {}
    //@ts-ignore
    if (window.CUR_NEXT_DISABLED !== undefined
      //@ts-ignore
      && window.CUR_NEXT_DISABLED === false
    ) {
      config.opts.curEnabled.next = true
    }
  }

  if (window
    //@ts-ignore
    && window.CUR_ETH_DISABLED
  ) {
    if (!config.opts.curEnabled) config.opts.curEnabled = {}
    config.opts.curEnabled.eth = false
  }
  // Plugins
  if (window
    //@ts-ignore
    && window.backupPlugin
    //@ts-ignore
    && window.backupUrl
    //@ts-ignore
    && window.restoreUrl
  ) {
    //@ts-ignore
    config.opts.plugins.backupPlugin = window.backupPlugin
    //@ts-ignore
    config.opts.plugins.backupPluginUrl = window.backupUrl
    //@ts-ignore
    config.opts.plugins.restorePluginUrl = window.restoreUrl
  }

  if (window
    //@ts-ignore
    && window.setItemPlugin
  ) {
    //@ts-ignore
    config.opts.plugins.setItemPlugin = window.setItemPlugin
  }
  if (window
    //@ts-ignore
    && window.getItemPlugin
  ) {
    //@ts-ignore
    config.opts.plugins.getItemPlugin = window.getItemPlugin
  }
  if (window
    //@ts-ignore
    && window.userDataPluginApi
  ) {
    //@ts-ignore
    config.opts.plugins.userDataPluginApi = window.userDataPluginApi
  }

  // ------
  if (window
    //@ts-ignore
    && window.buyViaCreditCardLink
  ) {
    //@ts-ignore
    config.opts.buyViaCreditCardLink = window.buyViaCreditCardLink
  }

  if (window
    //@ts-ignore
    && window.SWAP_HIDE_EXPORT_PRIVATEKEY !== undefined
  ) {
    //@ts-ignore
    config.opts.hideShowPrivateKey = window.SWAP_HIDE_EXPORT_PRIVATEKEY
  }

  if (window
    //@ts-ignore
    && window.widgetERC20Tokens
    //@ts-ignore
    && Object.keys(window.widgetERC20Tokens)
  ) {
    //@ts-ignore
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
    //@ts-ignore
    && window.widgetERC20Comisions
    //@ts-ignore
    && Object.keys(window.widgetERC20Comisions)
  ) {
    let setErc20FromEther = false

    //@ts-ignore
    Object.keys(window.widgetERC20Comisions).filter((key) => {
      const curKey = key.toLowerCase()
      //@ts-ignore
      if (window.widgetERC20Comisions[curKey]) {
        //@ts-ignore
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
