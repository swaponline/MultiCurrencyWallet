import React, { useState, useEffect, useRef } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import { connect } from 'redaction'
import reducers from 'redux/core/reducers'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from 'react-intl'
import { isMobile } from 'react-device-detect'

import config from 'app-config'
import actions from 'redux/actions'
import { firebase, constants, stats } from 'helpers'
import firestore from 'helpers/firebase/firestore'
import ethToken from 'helpers/ethToken'
import feedback from 'shared/helpers/feedback'

import Explanation from '../Explanation'
import icons from '../images'
import Cupture, {
  subHeaderText1,
  subHeaderText2,
  cupture2,
} from './texts'


const SecondStep = (props) => {
  const { 
    intl: { locale }, 
    onClick, 
    currencies, 
    error, 
    setError, 
    forcedCurrencyData, 
    btcData,
    etcClick,
    ethData 
  } = props

  const _protection = {
    nothing: {
      btc: true,
      eth: true,
      ghost: true,
      next: true,
      erc: true,
    },
    sms: {},
    pin: {
      btc: true,
    },
    g2fa: {},
    multisign: {},
    fingerprint: {},
  }

  const _activated = {
    nothing: {},
    sms: {},
    pin: {},
    g2fa: {},
    multisign: {},
    fingerprint: {},
  }

  const { hiddenCoinsList } = constants.localStorage
  const hiddenCoins = JSON.parse(localStorage.getItem(hiddenCoinsList))

  if (currencies.BTC) {
    //@ts-ignore
    _protection.sms.btc = true
    //@ts-ignore
    _protection.pin.btc = true
    //@ts-ignore
    _protection.g2fa.btc = false
    //@ts-ignore
    _protection.multisign.btc = true
    //@ts-ignore
    _protection.fingerprint.btc = true
    //@ts-ignore
    _activated.nothing.btc = btcData.balance > 0 || (hiddenCoins.length ? !hiddenCoins.includes('BTC') && !hiddenCoins.includes(`BTC:${btcData.address}`) : false)
    //@ts-ignore
    _activated.sms.btc = actions.btcmultisig.checkSMSActivated()
    //@ts-ignore
    _activated.pin.btc = actions.btcmultisig.checkPINActivated()
    //@ts-ignore
    _activated.g2fa.btc = actions.btcmultisig.checkG2FAActivated()
    //@ts-ignore
    _activated.multisign.btc = actions.btcmultisig.checkUserActivated()
    //@ts-ignore
    _activated.fingerprint.btc = false
  }

  const isSupportedPush = firebase.isSupported()

  const onCreateTrigger = async () => {
    if (!window.localStorage.getItem(constants.localStorage.signedUpWithPush)) {
      try {
        const ipInfo = await firebase.getIPInfo()
        const data = {
          ...ipInfo,
          registrationDomain: window.top.location.host,
          userAgentRegistration: navigator.userAgent,
        }
        await firestore.addUser(data)
        if (isSupportedPush) {
          await firebase.signUpWithPush(data)
          window.localStorage.setItem(constants.localStorage.signedUpWithPush, 'true')
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const [border, setBorder] = useState({
    color: {
      withoutSecure: false,
      sms: false,
      pin: false,
      google2FA: false,
      multisignature: false,
    },
    selected: '',
  })

  const [isFingerprintAvailable, setFingerprintAvaillable] = useState(false)

  const thisComponentInitHelper = useRef(true)

  const [isFingerprintFeatureAsked, setFingerprintFeatureAsked] = useState(false)
  const [isTrivialFeatureAsked, setTrivialFeatureAsked] = useState(false)
  const [isSmsFeatureAsked, setSmsFeatureAsked] = useState(false)
  const [isPinFeatureAsked, setPinFeatureAsked] = useState(false)
  const [is2FAFeatureAsked, set2FAFeatureAsked] = useState(false)
  const [isMultisigFeatureAsked, setMultisigFeatureAsked] = useState(false)

  useEffect(() => {
    try {
      //@ts-ignore
      if (typeof PublicKeyCredential !== 'undefined') {
        // eslint-disable-next-line no-undef
        //@ts-ignore
        if (thisComponentInitHelper.current && PublicKeyCredential) {
          // eslint-disable-next-line no-undef
          //@ts-ignore
          PublicKeyCredential
            .isUserVerifyingPlatformAuthenticatorAvailable()
            .then(result => {
              if (result) {
                setFingerprintAvaillable(true)
              }
            })
            .catch(e => console.error(e))
        }
      }
    } catch (error) {
      console.error(error)
    }
  })

  const handleFinish = () => {
    if (currencies.BTC) {
      //@ts-ignore
      feedback.createWallet.finished('BTC')
    } else {
      //@ts-ignore
      feedback.createWallet.finished()
    }
    onClick()
    onCreateTrigger()
  }

  const handleClick = (index, el) => {
    const { name, enabled, activated } = el

    if (el.name === 'fingerprint') {
      // eslint-disable-next-line no-alert
      alert('We don\'t support this type of device for now :(')
      return null
    }

    if (!enabled) {
      return
    }
    // if (activated) return
    const colors = border.color

    Object.keys(border.color).forEach(el => {
      if (el !== name) {
        colors[el] = false
      } else {
        colors[el] = true
      }
    })
    setBorder({ color: colors, selected: name })
    reducers.createWallet.newWalletData({ type: 'secure', data: name })
    setError(null)
  }

  const currencyName = Object.keys(currencies).filter((el) => currencies[el])[0] || 'Cant define currency'

  const currencyKey = (ethToken.isEthToken({ name: currencyName })) ? `erc` : currencyName.toLowerCase()

  const coins = [
    {
      text: {
        en: 'No security',
        ru: 'Без защиты',
        nl: 'Geen beveliging',
        es: 'sin seguridad',
      }[locale],
      name: 'withoutSecure',
      capture: {
        en: 'suitable for small amounts',
        ru: 'Подходит для небольших сумм',
        nl: 'Geschikt voor kleine bedragen',
        es: 'Apto para pequeñas cantidades',
      }[locale],
      enabled: !_activated.nothing[currencyKey],
      activated: _activated.nothing[currencyKey],
      onClickHandler: () => {
        if (isTrivialFeatureAsked) {
          return null
        }
        setTrivialFeatureAsked(true)
        //@ts-ignore
        feedback.createWallet.securitySelected(`${currencyName}-normal`)
      },
    },
    /*
    {
      text: 'SMS',
      name: 'sms',
      capture: {
        en: 'Verify your transactions via SMS code.',
        ru: 'Транзакции подтверждаются кодом по SMS.',
        nl: 'Verifieer uw transacties via SMS code.',
        es: 'Verifique sus transacciones mediante código SMS.',
      }[locale],
      // enabled: _protection.sms[currencyKey],
      enabled: false, // sms temporarly disabled
      activated: _activated.sms[currencyKey],
      onClickHandler: () => {
        if (isSmsFeatureAsked) {
          return null
        }
        setSmsFeatureAsked(true)
        //@ts-ignore
        feedback.createWallet.securitySelected(`${currencyName}-sms`)
      },
    },
    */
    {
      text: 'PIN',
      name: 'pin',
      capture: {
        en: 'Verify your transactions via PIN code',
        ru: 'Транзакции подтверждаются PIN-кодом',
        nl: 'Verifieer uw transacties via PIN code',
        es: ' Verifique sus transacciones mediante el código PIN',
      }[locale],
      enabled: _protection.pin[currencyKey],
      activated: _activated.pin[currencyKey],
      onClickHandler: () => {
        if (isPinFeatureAsked) {
          return null
        }
        setPinFeatureAsked(true)
        //@ts-ignore
        feedback.createWallet.securitySelected(`${currencyName}-pin`)
      },
    },
    /*
    {
      text: 'Google 2FA',
      name: 'google2FA',
      capture: locale === 'en' ?
        'Verify your transactions through the Google Authenticator app' :
        'Транзакции подтверждаются через приложение Google Authenticator',
      enabled: _protection.g2fa.btc,
      activated: _activated.g2fa.btc,
      onClickHandler: () => {
        if (is2FAFeatureAsked) {
          return null
        }
        set2FAFeatureAsked(true)
        feedback.createWallet.securitySelected(`${currencyName}-2fa`)
      },
    },
    */
    {
      text: 'Multisignature',
      name: 'multisignature',
      capture: {
        en: 'Verify your transactions by using another device or by another person.',
        ru: 'Транзакции подтверждаются с другого устройства и/или другим человеком',
        nl: 'Verifieer uw transacties met een ander apparaat of persoon',
        es: 'Verifique sus transacciones usando otro dispositivo o por otra persona.',
      }[locale],
      enabled: _protection.multisign[currencyKey],
      activated: _activated.multisign[currencyKey],
      onClickHandler: () => {
        if (isMultisigFeatureAsked) {
          return null
        }
        setMultisigFeatureAsked(true)
        //@ts-ignore
        feedback.createWallet.securitySelected(`${currencyName}-multisig`)
      },
    },
  ]

  if (isFingerprintAvailable) {
    coins.push({
      text: 'Fingerprint',
      name: 'fingerprint',
      capture: {
        en: 'Transactions are confirmed with your fingerprint authenticator.',
        ru: 'Транзакции подтверждаются с помощью считывателя отпечатков пальцев',
        nl: 'Transacties bevestigd met uw vingerprint authenticator',
        es: 'Las transacciones se confirman con su autenticador de huellas digitales.'
      }[locale],

      enabled: _protection.fingerprint[currencyKey],
      activated: _activated.fingerprint[currencyKey],
      onClickHandler: () => {
        if (isFingerprintFeatureAsked) {
          return null
        }
        setFingerprintFeatureAsked(true)
        //@ts-ignore
        feedback.createWallet.securitySelected(`${currencyName}-fingerprint`)
      },
    })
  }

  return (
    <div>
      {!isMobile && !forcedCurrencyData &&
        <div>
          <Explanation subHeaderText={subHeaderText1()} step={1} notMain>
            <Cupture click={etcClick} step={2} />
          </Explanation>
        </div>
      }
      <div>
        <div>
          <Explanation subHeaderText={subHeaderText2()} step={2} isShow={forcedCurrencyData}>
            {cupture2()}
          </Explanation>
          <div styleName="currencyChooserWrapper currencyChooserWrapperSecond">
            {coins.map((el, index) => {
              const { name, capture, text, enabled, activated } = el

              const cardStyle = ['card', 'secureSize', 'thirdCard']

              if (border.color[name] && enabled) cardStyle.push('purpleBorder')
              if (!enabled) cardStyle.push('cardDisabled')

              if (activated) cardStyle.push('cardActivated')
              const cardStyle_ = cardStyle.join(' ')

              return (
                <div
                  key={index}
                  styleName={`${cardStyle_}`}
                  onClick={() => {
                    if (typeof el.onClickHandler !== 'undefined') { el.onClickHandler() }
                    return handleClick(index, el)
                  }}
                >
                  <div styleName="ind">
                    {(!enabled || activated) &&
                      <em>
                        {!activated && <FormattedMessage id="createWalletSoon" defaultMessage="Soon!" />}
                        {activated && <FormattedMessage id="createWalletActivated" defaultMessage="Activated!" />}
                      </em>
                    }
                  </div>
                  <div styleName="flex">
                    <div styleName="logo securityIcon">
                      <img
                        src={icons[name]}
                        alt={`${name} icon`}
                        role="image"
                      />
                    </div>
                    <div styleName="listGroup">
                      <li>
                        <b>{text}</b>
                      </li>
                      <li>{capture}</li>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <button
          styleName="continue"
          onClick={handleFinish}
          disabled={error || border.selected === '' || border.selected === 'fingerprint'}
        >
          <FormattedMessage id="createWalletButton3" defaultMessage="Create Wallet" />
        </button>
      </div>
    </div>
  )
}
export default injectIntl(CSSModules(SecondStep, styles, { allowMultiple: true }))