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
import { localisedUrl } from 'helpers/locale'


import FirstStep from './Steps/FirstStep'
import SecondStep from './Steps/SecondStep'
import Tooltip from 'components/ui/Tooltip/Tooltip'

import { constants, localStorage } from 'helpers'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'


const isWidgetBuild = config && config.isWidget
const styleBtn = { backgroundColor: '#f0eefd', color: '#6144E5' }
const defaultColors = { backgroundColor: '#6144E5' }

const isDark = localStorage.getItem(constants.localStorage.isDark)

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
  ].map(({ balance, currency, infoAboutCurrency }) => ({
    balance,
    infoAboutCurrency,
    name: currency,
  }))

  let btcBalance = 0
  let fiatBalance = 0
  let changePercent = 0

  const widgetCurrencies = [
    'BTC',
    'BTC (SMS-Protected)',
    'BTC (PIN-Protected)',
    'BTC (Multisig)',
    'ETH',
    'GHOST',
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
        if (item.name === 'BTC') {
          changePercent = item.infoAboutCurrency.percent_change_1h
        }

        btcBalance += item.balance * item.infoAboutCurrency.price_btc
        fiatBalance += item.balance * ((item.infoAboutCurrency.price_fiat) ? item.infoAboutCurrency.price_fiat : 1)
      }
    })
  }

  useEffect(
    () => {
      const singleCurrency = pathname.split('/')[2]

      if (singleCurrency) {
        const hiddenList = localStorage.getItem('hiddenCoinsList')

        const isExist = hiddenList.find(el => {
          if (el.includes(':')) {
            return el.includes(singleCurrency.toUpperCase())
          }
          return el === singleCurrency.toUpperCase()
        })

        if (!isExist) {
          setExist(true)
        }

        if (singleCurrency.toUpperCase() === 'SWAP') {
          // SWAP has no security options
          // just add and redirect
          const isWasOnWallet = localStorage.getItem('hiddenCoinsList').find(cur => cur.includes(singleCurrency))
          actions.core.markCoinAsVisible(isWasOnWallet || singleCurrency.toUpperCase(), true)
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
          if (item.name === 'BTC') {
            changePercent = item.infoAboutCurrency.percent_change_1h
          }

          btcBalance += item.balance * item.infoAboutCurrency.price_btc
          fiatBalance += item.balance * ((item.infoAboutCurrency.price_fiat) ? item.infoAboutCurrency.price_fiat : 1)
        }
      })
    }
  }, [])

  const [step, setStep] = useState(1)
  const [error, setError] = useState('Choose something')
  const [isExist, setExist] = useState(false)

  const goHome = () => {
    history.push(localisedUrl(locale, links.home))
  }

  const handleClick = () => {
    setError(null)
    if (step !== 2 && !singleCurrencyData) {
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
        actions.core.markCoinAsVisible(currency, true)
      })
      localStorage.setItem(constants.localStorage.isWalletCreate, true)
      goHome()
      return
    }

    if (!secure.length && (step === 2 || singleCurrencyData)) {
      setError('Choose something')
      return
    }

    if (currencies['Custom ERC20']) {
      goHome()
      actions.modals.open(constants.modals.AddCustomERC20)
      return
    }

    if (step === 2 || singleCurrencyData) {
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

  const singleCurrency = pathname.split('/')[2]
  let singleCurrencyData

  if (singleCurrency) {
    singleCurrencyData = allCurrencies.find(({ name }) => name === singleCurrency.toUpperCase())
    if (singleCurrencyData) {
      currencies[singleCurrency.toLowerCase()] = true
    }
  }

  if (isExist) {
    goHome()
  }

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
          {' '}{singleCurrency && singleCurrency.toUpperCase()}
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

        {singleCurrencyData ?
          <SecondStep error={error} onClick={validate} currencies={currencies} setError={setError} singleCurrencyData />
          :
          <div>
            {step === 1 && <FirstStep error={error} onClick={validate} setError={setError} />}
            {step === 2 && <SecondStep error={error} btcData={btcData} onClick={validate} currencies={currencies} setError={setError} />}
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
