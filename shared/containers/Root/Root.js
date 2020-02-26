import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'

import App from 'containers/App/App'

import IntlProviderContainer from 'containers/IntlProviderContainer'

import util from 'swap.app/util'
import config from 'app-config'
import actions from 'redux/actions'
import { constants } from 'swap.app'

window.appConfig = config

export default class Root extends React.PureComponent {

  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    routes: PropTypes.element.isRequired,
  }

  constructor() {
    super()

    // Reconfigure app config if it widget or use external config
    config.opts = {
      curEnabled: false,
      ownTokens: false,
      addCustomERC20: true,
    }

    if (window
      && window.buildOptions
      && Object.keys(window.buildOptions)
      && Object.keys(window.buildOptions).length
    ) {
      config.opts = { ...config.opts, ...window.buildOptions }
    }

    if (window
      && window.widgetERC20Tokens
      && Object.keys(window.widgetERC20Tokens)
      && Object.keys(window.widgetERC20Tokens).length
    ) {
      config.opts.ownTokens = window.widgetERC20Tokens
    }

    if ((config && config.isWidget) || config.opts.ownTokens) {
      // clean old erc20 config - leave only swap token (need for correct swap work)
      if (!config.isWidget) {
        const newERC20 = {}
        //newERC20.swap = config.erc20.swap
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
      const cleanERC20 = {}
      Object.keys(config.erc20).forEach((key) => {
        if (key !== ('{#'+'WIDGETTOKENCODE'+'#}')) {
          cleanERC20[key] = config.erc20[key]
        }
      })
      config.erc20 = cleanERC20
    }
    if (!(config && config.isWidget) || config.opts.addCustomERC20) {
      // Add custom tokens
      const customERC = actions.token.GetCustromERC20()

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
    // Add to swap.core not exists tokens
    Object.keys(config.erc20).forEach((tokenCode) => {
      if (!constants.COINS[tokenCode]) {
        console.info('Add token to swap.core', tokenCode, config.erc20[tokenCode].address, config.erc20[tokenCode].decimals, config.erc20[tokenCode].fullName)
        util.erc20.register(tokenCode, config.erc20[tokenCode].decimals)
        actions[tokenCode] = actions.token
      }
    })
    
  }

  render() {
    const { history, store, routes } = this.props

    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <IntlProviderContainer>
            <App>
              {routes}
            </App>
          </IntlProviderContainer>
        </ConnectedRouter>
      </Provider>
    )
  }
}
