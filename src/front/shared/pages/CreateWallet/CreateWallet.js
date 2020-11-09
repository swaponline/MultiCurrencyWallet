import React, { useState, useEffect } from 'react'
import config from 'app-config'

import CSSModules from 'react-css-modules'
import styles from './CreateWallet.scss'

import { connect } from 'redaction'
import actions from 'redux/actions'

import { FormattedMessage, injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import reducers from 'redux/core/reducers'

import links from 'helpers/links'
import { getActivatedCurrencies } from 'helpers/user'
import { localisedUrl } from 'helpers/locale'
import feedback from 'helpers/feedback'


import FirstStep from './Steps/FirstStep'
import SecondStep from './Steps/SecondStep'
import Tooltip from 'components/ui/Tooltip/Tooltip'

import { constants, localStorage } from 'helpers'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'


const isDark = localStorage.getItem(constants.localStorage.isDark)
const isWidgetBuild = config && config.isWidget
// FIXME: эта строка была перед обьявлением класса в FirstStep.js
// @connect(({ currencies: { items: currencies } }) => ({ currencies }));
const CreateWallet = (props) => {
  const {
    history,
    intl: { locale },
    createWallet: {
      currencies,
      secure,
    },
    location: { pathname },
    userData,
    core: { hiddenCoinsList },
    activeFiat,
  } = props

  const allCurrencies = props.currencies.items

  const {
    ethData,
    btcData,
    ghostData,
    nextData,
    btcMultisigSMSData,
    btcMultisigUserData,
  } = userData

  const userWallets = actions.core.getWallets().filter(({ currency }) => !hiddenCoinsList.includes(currency))

  const currencyBalance = [
    btcData,
    btcMultisigSMSData,
    btcMultisigUserData,
    ethData,
    ghostData,
    nextData,
  ].map(({ balance, currency, infoAboutCurrency }) => ({
    balance,
    infoAboutCurrency,
    name: currency,
  }))

  let btcBalance = 0
  let fiatBalance = 0

  const widgetCurrencies = [
    'BTC',
    'BTC (SMS-Protected)',
    'BTC (PIN-Protected)',
    'BTC (Multisig)',
    'ETH',
    'GHOST',
    'NEXT',
  ]

  if (isWidgetBuild) {
    if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
      // Multi token widget build
      Object.keys(window.widgetERC20Tokens).forEach(key => {
        widgetCurrencies.push(key.toUpperCase())
      })
    } else {
      widgetCurrencies.push(config.erc20token.toUpperCase())
    }
  }

  if (currencyBalance) {
    currencyBalance.forEach(async item => {
      if ((!isWidgetBuild || widgetCurrencies.includes(item.name)) && item.infoAboutCurrency && item.balance !== 0) {
        btcBalance += item.balance * item.infoAboutCurrency.price_btc
        fiatBalance += item.balance * ((item.infoAboutCurrency.price_fiat) ? item.infoAboutCurrency.price_fiat : 1)
      }
    })
  }

  useEffect(
    () => {
      const forcedCurrency = pathname.split('/')[2]

      if (forcedCurrency) {
        const hiddenList = localStorage.getItem('hiddenCoinsList')

        const isExist = hiddenList.find(el => {
          if (el.includes(':')) {
            return el.includes(forcedCurrency.toUpperCase())
          }
          return el === forcedCurrency.toUpperCase()
        })

        if (!isExist) {
          setExist(true)
        }

        if (forcedCurrency.toUpperCase() === 'SWAP') {
          // SWAP has no security options
          // just add and redirect
          const isWasOnWallet = localStorage.getItem('hiddenCoinsList').find(cur => cur.includes(forcedCurrency))
          actions.core.markCoinAsVisible(isWasOnWallet || forcedCurrency.toUpperCase(), true)
          handleClick()
        }
      }
    },
    [pathname],
  )

  useEffect(() => {
    const widgetCurrencies = [
      'BTC',
      'BTC (SMS-Protected)',
      'BTC (PIN-Protected)',
      'BTC (Multisig)',
      'ETH',
      'GHOST',
      'NEXT',
    ]

    if (isWidgetBuild) {
      if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
        // Multi token widget build
        Object.keys(window.widgetERC20Tokens).forEach(key => {
          widgetCurrencies.push(key.toUpperCase())
        })
      } else {
        widgetCurrencies.push(config.erc20token.toUpperCase())
      }
    }

    if (currencyBalance) {
      currencyBalance.forEach(item => {
        if ((!isWidgetBuild || widgetCurrencies.includes(item.name)) && item.infoAboutCurrency && item.balance !== 0) {
          btcBalance += item.balance * item.infoAboutCurrency.price_btc
          fiatBalance += item.balance * ((item.infoAboutCurrency.price_fiat) ? item.infoAboutCurrency.price_fiat : 1)
        }
      })
    }
  }, [])

  const [step, setStep] = useState(1)
  const [error, setError] = useState('Choose something')
  const [isExist, setExist] = useState(false)
  const [curState, setCurState] = useState({})
  const [startPack, setStartPack] = useState(isWidgetBuild ? widgetStartPack : defaultStartPack)

  // ---------------------------------------------------------
  const widgetStartPack = [
    ...(!config.opts.curEnabled || config.opts.curEnabled.btc) ? [{ name: "BTC", capture: "Bitcoin" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.eth) ? [{ name: "ETH", capture: "Ethereum" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.ghost) ? [{ name: "GHOST", capture: "Ghost" }] : [],
    ...(!config.opts.curEnabled || config.opts.curEnabled.next) ? [{ name: "NEXT", capture: "NEXT.coin" }] : [],
  ]
  
  const defaultStartPack = [
    ...widgetStartPack,
    { name: "SWAP", capture: "Swap" },
    { name: "USDT", capture: "Tether" },
    { name: "EURS", capture: "Eurs" },
  ]

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

  handleClick = name => {
    feedback.createWallet.currencySelected(name)

    const dataToReturn = { [name]: !curState[name] }
    setCurState(curState = dataToReturn)
    
    reducers.createWallet.newWalletData({ type: 'currencies', data: dataToReturn })
    setError(null)
  }

  etcClick = () => {
    let newStartPack = defaultStartPack

    if (config.opts.addCustomERC20) {
      newStartPack = [{
        name: 'Custom ERC20',
        capture: <FormattedMessage id="createWallet_customERC20" defaultMessage="Подключить токен" />,
      }, ...startPack, ...coins]
    } else {
      newStartPack = [...startPack, ...coins]
    }

    setStartPack(startPack = newStartPack)
  }
  // ---------------------------------------------------------

  const goHome = () => {
    history.push(localisedUrl(locale, links.home))
  }

  const handleClick = () => {
    setError(null)
    if (step !== 2 && !forcedCurrencyData) {
      reducers.createWallet.newWalletData({ type: 'step', data: step + 1 })
      return setStep(step + 1)
    }
    localStorage.setItem(constants.localStorage.isWalletCreate, true)
    goHome()
  }


  const handleRestoreMnemonic = () => {
    actions.modals.open(constants.modals.RestoryMnemonicWallet, { btcBalance, fiatBalance })
  }

  const validate = () => {

    setError(null)

    if (!Object.values(currencies).includes(true) && step === 1) {
      setError('Choose something')
      return
    }

    const isIgnoreSecondStep = !Object.keys(currencies).includes('BTC') // ['ETH', 'SWAP', 'EURS', 'Custom ERC20'].find(el => Object.keys(currencies).includes(el))

    if (isIgnoreSecondStep && !currencies['Custom ERC20']) {
      Object.keys(currencies).forEach((currency) => {
        if (currencies[currency]) {
          actions.core.markCoinAsVisible(currency.toUpperCase(), true)
        }
      })
      localStorage.setItem(constants.localStorage.isWalletCreate, true)
      goHome()
      return
    }

    if (!secure.length && (step === 2 || forcedCurrencyData)) {
      setError('Choose something')
      return
    }

    if (currencies['Custom ERC20']) {
      goHome()
      actions.modals.open(constants.modals.AddCustomERC20)
      return
    }

    if (step === 2 || forcedCurrencyData) {
      switch (secure) {
        case 'withoutSecure':
          Object.keys(currencies).forEach(el => {
            if (currencies[el]) {
              const isWasOnWallet = localStorage.getItem('hiddenCoinsList').find(cur => cur.includes(`${el}:`))
              actions.core.markCoinAsVisible(isWasOnWallet || el.toUpperCase(), true)
            }
          })
          break
        case 'sms':
          if (currencies.BTC) {
            if (!actions.btcmultisig.checkSMSActivated()) {
              actions.modals.open(constants.modals.RegisterSMSProtected, {
                callback: () => {
                  actions.core.markCoinAsVisible('BTC (SMS-Protected)', true)
                  handleClick()
                },
              })
              return
            }
            actions.modals.open(constants.modals.Confirm, {
              title: <FormattedMessage id="ConfirmActivateSMS_Title" defaultMessage="Добавление кошелька BTC (SMS-Protected)" />,
              message: <FormattedMessage id="ConfirmActivateSMS_Message" defaultMessage="У вас уже активирован этот тип кошелька. Хотите активировать другой кошелек?" />,
              labelYes: <FormattedMessage id="ConfirmActivateSMS_Yes" defaultMessage="Да" />,
              labelNo: <FormattedMessage id="ConfirmActivateSMS_No" defaultMessage="Нет" />,
              onAccept: () => {
                actions.modals.open(constants.modals.RegisterSMSProtected, {
                  callback: () => {
                    actions.core.markCoinAsVisible('BTC (SMS-Protected)', true)
                    handleClick()
                  },
                })
              },
              onCancel: () => {
                actions.core.markCoinAsVisible('BTC (SMS-Protected)', true)
                handleClick()
              },
            })
            return

          }
          break
        case 'pin':
          if (currencies.BTC) {
            if (!actions.btcmultisig.checkPINActivated()) {
              actions.modals.open(constants.modals.RegisterPINProtected, {
                callback: () => {
                  actions.core.markCoinAsVisible('BTC (PIN-Protected)', true)
                  handleClick()
                },
              })
              return
            }
            actions.modals.open(constants.modals.Confirm, {
              title: <FormattedMessage id="ConfirmActivatePIN_Title" defaultMessage="Добавление кошелька BTC (PIN-Protected)" />,
              message: <FormattedMessage id="ConfirmActivatePIN_Message" defaultMessage="У вас уже активирован этот тип кошелька. Хотите активировать другой кошелек?" />,
              labelYes: <FormattedMessage id="ConfirmActivatePIN_Yes" defaultMessage="Да" />,
              labelNo: <FormattedMessage id="ConfirmActivatePIN_No" defaultMessage="Нет" />,
              onAccept: () => {
                actions.modals.open(constants.modals.RegisterPINProtected, {
                  callback: () => {
                    actions.core.markCoinAsVisible('BTC (PIN-Protected)', true)
                    handleClick()
                  },
                })
              },
              onCancel: () => {
                actions.core.markCoinAsVisible('BTC (PIN-Protected)', true)
                handleClick()
              },
            })
            return

          }
          break
        case 'multisignature':
          if (currencies.BTC) {
            actions.modals.open(constants.modals.MultisignJoinLink, {
              callback: () => {
                actions.core.markCoinAsVisible('BTC (Multisig)', true)
                handleClick()
              },
              showCloseButton: false,
            })
            return
          }
          break
        default:
          console.warn('unconnected secure type')
      }
    }
    handleClick()
  }

  const forcedCurrency = pathname.split('/')[2]
  let forcedCurrencyData

  if (forcedCurrency) {
    forcedCurrencyData = allCurrencies.find(({ name }) => name === forcedCurrency.toUpperCase())
    if (forcedCurrencyData) {
      currencies[forcedCurrency.toLowerCase()] = true
    }
  }

  if (isExist) {
    goHome()
  }

  useEffect(() => {
    // Link from index.html (first screen)
    const starterModalRestoreWallet = document.getElementById('starter-modal__link-restore-wallet')
    if (starterModalRestoreWallet) {
      starterModalRestoreWallet.addEventListener('click', redirectToRestoreWallet)

      return () => {
        starterModalRestoreWallet.removeEventListener('click', redirectToRestoreWallet)
      }

      function redirectToRestoreWallet() {
        document.location.href = '#/restoreWallet'
        handleRestoreMnemonic()
        document.getElementById('starter-modal').classList.add('d-none')
      }
    }
  }, [])

  return (
    <div styleName={`wrapper ${isDark ? '--dark' : ''}`}>
      {
        userWallets.length && !localStorage.getItem(constants.wasOnWallet)
          ? <CloseIcon styleName="closeButton" onClick={() => goHome()} data-testid="modalCloseIcon" />
          : ''
      }

      <div styleName={isMobile ? 'mobileFormBody' : 'formBody'}>
        <h2>
          <FormattedMessage
            id="createWalletHeader1"
            defaultMessage="Создание кошелька"
          />
          {' '}{forcedCurrency && forcedCurrency.toUpperCase()}
        </h2>
        <div styleName="buttonWrapper">
          <span>
            <button onClick={handleRestoreMnemonic}>
              <FormattedMessage
                id="ImportKeys_RestoreMnemonic"
                defaultMessage="Ввести 12 слов"
              />
            </button>
            &nbsp;
            <Tooltip id="ImportKeys_RestoreMnemonic_tooltip">
              <span>
                <FormattedMessage id="ImportKeys_RestoreMnemonic_Tooltip" defaultMessage="12-word backup phrase" />
                {
                  (btcBalance > 0 || fiatBalance > 0) && (
                    <React.Fragment>
                      <br />
                      <br />
                      <div styleName="alertTooltipWrapper">
                        <FormattedMessage id="ImportKeys_RestoreMnemonic_Tooltip_withBalance" defaultMessage="Please, be causious!" />
                      </div>
                    </React.Fragment>
                  )
                }
              </span>
            </Tooltip>
          </span>
          <br />
        </div>

        {forcedCurrencyData ?
          <SecondStep error={error} onClick={validate} currencies={currencies} setError={setError} forcedCurrencyData />
          :
          <div>
            {step === 1 && <FirstStep error={error} onClick={validate} curState={curState} startPack={startPack} etcClick={etcClick} />}
            {step === 2 && <SecondStep error={error} btcData={btcData} onClick={validate} currencies={currencies} setError={setError} ethData={ethData} />}
          </div>
        }
      </div>
    </div>
  )
}
export default connect({
  createWallet: 'createWallet',
  currencies: 'currencies',
  userData: 'user',
  core: 'core',
  activeFiat: 'user.activeFiat',
})(injectIntl(withRouter(CSSModules(CreateWallet, styles, { allowMultiple: true }))))
