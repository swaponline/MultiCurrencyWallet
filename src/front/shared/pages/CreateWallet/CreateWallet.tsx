/* eslint-disable no-restricted-syntax */
import { useState, useEffect } from 'react'
import config from 'helpers/externalConfig'

import CSSModules from 'react-css-modules'
import { connect } from 'redaction'
import actions from 'redux/actions'
import { FormattedMessage, useIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import reducers from 'redux/core/reducers'
import TOKEN_STANDARDS, { EXISTING_STANDARDS } from 'helpers/constants/TOKEN_STANDARDS'
import links from 'helpers/links'
import metamask from 'helpers/metamask'
import { localisedUrl } from 'helpers/locale'

import Tooltip from 'components/ui/Tooltip/Tooltip'
import Button from 'shared/components/controls/Button/Button'

import { constants, localStorage } from 'helpers'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import web3Icons from 'images'
import StepsWrapper from './Steps/StepsWrapper'
import styles from './CreateWallet.scss'

const noInternalWallet = !!(config?.opts?.ui?.disableInternalWallet)
const addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase = !!config?.opts?.addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase

function CreateWallet(props) {
  const {
    history,
    currencies: { items: allCurrencies },
    createWallet: { currencies, secure },
    location: { pathname, hash },
    userData,
    core: { hiddenCoinsList },
  } = props

  const { locale } = useIntl()

  const forcedCurrency = pathname.split('/')[2]

  const {
    btcData,
  } = userData

  const userWallets = actions.core
    .getWallets({})
    .filter(({ currency }) => !hiddenCoinsList.includes(currency))

  useEffect(() => {
    if (forcedCurrency) {
      const hiddenList = localStorage.getItem('hiddenCoinsList')

      const isExist = hiddenList.find((el) => {
        if (el.includes(':')) {
          const [elCoin, elAddress] = el.split(':')
          return elCoin === forcedCurrency.toUpperCase()
        }
        return el === forcedCurrency.toUpperCase()
      })

      if (!isExist) {
        setExist(true)
      }

      if (forcedCurrency.toUpperCase() === 'SWAP') {
        // SWAP has no security options
        // just add and redirect
        const isWasOnWallet = localStorage
          .getItem('hiddenCoinsList')
          .find((cur) => cur.includes(forcedCurrency))
        actions.core.markCoinAsVisible(isWasOnWallet || forcedCurrency.toUpperCase(), true)
        handleClick()
      }
    }
  }, [pathname])

  const [step, setStep] = useState(1)
  const [error, setError] = useState('Choose something')
  const [isExist, setExist] = useState(false)

  const goHome = () => {
    history.push(localisedUrl(locale, links.home))
  }

  const handleConnectWallet = () => {
    history.push(localisedUrl(locale, links.connectWallet))
  }

  const handleClick = () => {
    // @ts-ignore: strictNullChecks
    setError(null)
    if (step !== 2 && !forcedCurrencyData) {
      reducers.createWallet.newWalletData({ type: 'step', data: step + 1 })
      return setStep(step + 1)
    }
    localStorage.setItem(constants.localStorage.isWalletCreate, true)
    goHome()
  }

  const handleShowMnemonic = () => {
    actions.modals.open(constants.modals.SaveWalletSelectMethod)
  }

  const handleRestoreMnemonic = () => {
    actions.modals.open(constants.modals.RestoryMnemonicWallet)
  }

  const handleRestoreShamirs = () => {
    actions.modals.open(constants.modals.ShamirsSecretRestory)
  }

  const validate = () => {
    // @ts-ignore: strictNullChecks
    setError(null)

    if (!Object.values(currencies).includes(true) && step === 1) {
      setError('Choose something')
      return
    }

    const isIgnoreSecondStep = !Object.keys(currencies).includes('BTC') || (Object.keys(currencies).includes('BTC') && hash !== '#pin')
    const standardConfigs = EXISTING_STANDARDS.map((standard) => TOKEN_STANDARDS[standard])

    for (const standardObj of standardConfigs) {
      const standardName = standardObj.standard.toUpperCase()
      const baseCurrency = standardObj.currency.toUpperCase()
      const key = `{${baseCurrency}}${standardName}`

      if (currencies[key] && isIgnoreSecondStep) {
        actions.core.markCoinAsVisible(standardObj.currency.toUpperCase(), true)
        localStorage.setItem(constants.localStorage.isWalletCreate, true)

        goHome()

        actions.modals.open(constants.modals.AddCustomToken, {
          standard: standardName,
          baseCurrency: standardObj.currency,
        })

        return
      }
    }

    if (isIgnoreSecondStep) {
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

    if (step === 2 || forcedCurrencyData) {
      switch (secure) {
        case 'withoutSecure':
          Object.keys(currencies).forEach((el) => {
            if (currencies[el]) {
              const isWasOnWallet = localStorage
                .getItem('hiddenCoinsList')
                .find((cur) => cur.includes(`${el}:`))
              actions.core.markCoinAsVisible(isWasOnWallet || el.toUpperCase(), true)
            }
          })
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
              title: (
                <FormattedMessage
                  id="ConfirmActivatePIN_Title"
                  defaultMessage="Добавление кошелька BTC (PIN-Protected)"
                />
              ),
              message: (
                <FormattedMessage
                  id="ConfirmActivatePIN_Message"
                  defaultMessage="У вас уже активирован этот тип кошелька. Хотите активировать другой кошелек?"
                />
              ),
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

  let forcedCurrencyData

  if (forcedCurrency) {
    forcedCurrencyData = allCurrencies.find(({ name, standard, value }) => (standard ? value.toUpperCase() : name) === forcedCurrency.toUpperCase())
    if (forcedCurrencyData) {
      currencies[forcedCurrency.toLowerCase()] = true
    }
  }

  if (isExist) {
    goHome()
  }

  const web3Type = metamask.web3connect.getInjectedType()
  const web3Icon = (web3Icons[web3Type] && web3Type !== `UNKNOWN` && web3Type !== `NONE`) ? web3Icons[web3Type] : false

  const hasExternalWallet = (web3Type == 'NONE' && config.opts.hasWalletConnect) || (web3Type !== 'NONE')

  return (
    <div styleName="wrapper">
      {userWallets.length ? (
        <CloseIcon
          styleName="closeButton"
          onClick={goHome}
          data-testid="modalCloseIcon"
        />
      ) : null}

      <div styleName={isMobile ? 'mobileFormBody' : 'formBody'}>
        <h2>
          <FormattedMessage id="createWalletHeader1" defaultMessage="Создание кошелька" />
          {' '}
          {forcedCurrency && forcedCurrency.toUpperCase()}
        </h2>
        <div styleName="buttonWrapper">
          {!noInternalWallet && (
            <>
              <div>
                <button onClick={handleRestoreMnemonic} type="button">
                  <FormattedMessage id="ImportKeys_RestoreMnemonic" defaultMessage="Restore from 12-word seed" />
                </button>
                &nbsp;
                <Tooltip id="ImportKeys_RestoreMnemonic_tooltip">
                  <span>
                    <FormattedMessage
                      id="ImportKeys_RestoreMnemonic_Tooltip"
                      defaultMessage="12-word backup phrase"
                    />
                    <br />
                    <br />
                    <div styleName="alertTooltipWrapper">
                      <FormattedMessage
                        id="ImportKeys_RestoreMnemonic_Tooltip_withBalance"
                        defaultMessage="Please, be causious!"
                      />
                    </div>
                  </span>
                </Tooltip>
              </div>
              <div>
                <button onClick={handleRestoreShamirs} type="button">
                  <FormattedMessage id="ImportKeys_RestoreShamirs" defaultMessage="Restore from Secret-Sharing" />
                </button>
                &nbsp;
                <Tooltip id="ImportKeys_RestoreShamirsc_tooltip">
                  <span>
                    <FormattedMessage
                      id="ImportKeys_RestoreShamirs_Tooltip"
                      defaultMessage="Shamir's Secret-Sharing for Mnemonic Codes"
                    />
                    <br />
                    <br />
                    <div styleName="alertTooltipWrapper">
                      <FormattedMessage
                        id="ImportKeys_RestoreShamirs_Tooltip_withBalance"
                        defaultMessage="Please, be causious!"
                      />
                    </div>
                  </span>
                </Tooltip>
              </div>
            </>
          )}
          {hasExternalWallet && (
            <>
              {!metamask.isConnected() && (
                <div>
                  <button onClick={handleConnectWallet} type="button">
                    {web3Icon && (
                      <img styleName="connectWalletIcon" src={web3Icon} />
                    )}
                    <FormattedMessage id="ImportKeys_ConnectWallet" defaultMessage="Connect Wallet" />
                  </button>
                  &nbsp;
                  <Tooltip id="CreateWallet_ConnectWalletTooltip">
                    <FormattedMessage
                      id="CreateWallet_ConnectWalletButton"
                      defaultMessage="Use this if you already have ethereum wallet"
                    />
                  </Tooltip>
                </div>
              )}
            </>
          )}
        </div>

        {
          addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase
            ? (
              <div style={{ display: 'flex', justifyContent: 'center', width: '60%', margin: 'auto' }}>
                <Button blue fullWidth onClick={handleShowMnemonic}>
                  <FormattedMessage
                    id="BTCMS_SaveMnemonicButton"
                    defaultMessage="Save secret phrase"
                  />
                </Button>
              </div>
            )
            : (
              <StepsWrapper
                step={step}
                forcedCurrencyData={forcedCurrencyData}
                error={error}
                onClick={validate}
                setError={setError}
                btcData={btcData}
                currenciesForSecondStep={currencies}
                showPinContent={hash === '#pin'}
              />
            )
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
})(withRouter(CSSModules(CreateWallet, styles, { allowMultiple: true })))
