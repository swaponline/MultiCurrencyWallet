import { useState } from 'react'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { FormattedMessage } from 'react-intl'
import { externalConfig, localStorage, constants } from 'helpers'

import QuickSwap from './QuickSwap'
import AtomicSwap from './AtomicSwap'

function Exchange(props) {
  const { location } = props

  const exchangeSettings = JSON.parse(
    localStorage.getItem(constants.localStorage.exchangeSettings) || '{}'
  )

  let initialState = location.pathname === '/exchange/quick' ? 'quick' : 'atomic'

  if (exchangeSettings.swapMode) {
    initialState = exchangeSettings.swapMode
  } else {
    exchangeSettings.swapMode = initialState
    localStorage.setItem(constants.localStorage.exchangeSettings, JSON.stringify(exchangeSettings))
  }

  const [swapMode, setSwapMode] = useState(initialState)

  const updateSwapMode = (mode) => {
    setSwapMode(mode)
    exchangeSettings.swapMode = mode
    localStorage.setItem(constants.localStorage.exchangeSettings, JSON.stringify(exchangeSettings))
  }

  return (
    <div>
      <div styleName="tabsWrapper">
        <button
          styleName={`tab ${swapMode === 'atomic' ? 'active' : ''}`}
          onClick={() => updateSwapMode('atomic')}
        >
          <FormattedMessage id="atomicSwap" defaultMessage="Atomic swap" />
        </button>
        <button
          styleName={`tab  ${swapMode === 'quick' ? 'active' : ''} ${
            externalConfig.entry === 'testnet' ? 'disabled' : ''
          }`}
          onClick={externalConfig.entry === 'mainnet' ? () => updateSwapMode('quick') : undefined}
        >
          <FormattedMessage id="quickSwap" defaultMessage="Quick swap" />
        </button>
      </div>

      {/*
      quick and simple hack. Pass props from this component into AtomicSwap component
      because there has to be "url" props like match, location, etc. */}
      {swapMode === 'atomic' && <AtomicSwap {...props} />}

      {/* this swap type is available only on mainnet networks */}
      {swapMode === 'quick' && externalConfig.entry === 'mainnet' && (
        <div styleName="container">
          <QuickSwap />
        </div>
      )}
    </div>
  )
}

export default CSSModules(Exchange, styles, { allowMultiple: true })
