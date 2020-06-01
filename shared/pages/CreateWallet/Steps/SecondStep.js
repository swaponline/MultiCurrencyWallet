import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import { connect } from 'redaction'
import reducers from 'redux/core/reducers'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from 'react-intl'
import { isMobile } from 'react-device-detect'

import config from 'app-config'
import actions from 'redux/actions'
import { firebase, constants } from 'helpers'
import firestore from 'helpers/firebase/firestore'


import Explanation from '../Explanation'
import icons from '../images'
import Cupture,
{
  subHeaderText1,
  subHeaderText2,
  cupture2,
} from './texts'


const CreateWallet = (props) => {
  const { intl: { locale }, onClick, currencies, error, setError, singleCurrecnyData, btcData } = props

  const _protection = {
    nothing: {
      btc: true,
      eth: true,
      erc: true,
    },
    sms: {},
    g2fa: {},
    multisign: {},
    fingerprint: {},
  }

  const _activated = {
    nothing: {},
    sms: {},
    g2fa: {},
    multisign: {},
    fingerprint: {},
  }

  const { hiddenCoinsList } = constants.localStorage
  const hiddenCoins = JSON.parse(localStorage.getItem(hiddenCoinsList))

  if (currencies.BTC) {
    _protection.sms.btc = true
    _protection.g2fa.btc = false
    _protection.multisign.btc = true
    _protection.fingerprint.btc = true
    _activated.nothing.btc = btcData.balance > 0 || (!hiddenCoins.includes("BTC") && !hiddenCoins.includes(`BTC:${btcData.address}`)) || !hiddenCoins.length
    _activated.sms.btc = actions.btcmultisig.checkSMSActivated()
    _activated.g2fa.btc = actions.btcmultisig.checkG2FAActivated()
    _activated.multisign.btc = actions.btcmultisig.checkUserActivated()
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
          await firestore.signUpWithPush()
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
  const [is2FAFeatureAsked, set2FAFeatureAsked] = useState(false)
  const [isMultisigFeatureAsked, setMultisigFeatureAsked] = useState(false)

  useEffect(() => {
    try {
      if (typeof PublicKeyCredential !== 'undefined') {
        // eslint-disable-next-line no-undef
        if (thisComponentInitHelper.current && PublicKeyCredential) {
          // eslint-disable-next-line no-undef
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
      try {
        axios({
          // eslint-disable-next-line max-len
          url: `https://noxon.wpmix.net/counter.php?msg=%D0%BD%D0%B0%D1%87%D0%B0%D0%BB%D0%B8%20%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5%20%D0%BA%D0%BE%D1%88%D0%B5%D0%BB%D1%8C%D0%BA%D0%B0%20BTC%20${window.top.location.host}`,
          method: 'post',
        }).catch(e => console.error(e))
      } catch (error) {
        console.error(error)
      }
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

    if (!enabled) return
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

  const currencyName = Object.keys(currencies)[0] || 'Cant define currency'

  const coins = [
    {
      text: locale === 'en' ? 'No security' : 'Без защиты',
      name: 'withoutSecure',
      capture: locale === 'en' ? 'suitable for small amounts' : 'Подходит для небольших сумм',
      enabled: !_activated.nothing.btc,
      activated: _activated.nothing.btc,
      onClickHandler: () => {
        if (isTrivialFeatureAsked) {
          return null
        }
        setTrivialFeatureAsked(true)
        try {
          return axios({
            // eslint-disable-next-line max-len
            url: `https://noxon.wpmix.net/counter.php?msg=%D1%85%D0%BE%D1%82%D1%8F%D1%82%20%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C%20${currencyName}-normal%20%D0%BA%D0%BE%D1%88%D0%B5%D0%BB%D1%8C%20${window.top.location.host}`,
            method: 'post',
          }).catch(e => console.error(e))
        } catch (error) {
          console.error(error)
        }
      },
    },
    {
      text: 'SMS',
      name: 'sms',
      capture: locale === 'en' ? 'Verify your transactions via SMS code' : 'Транзакции подтверждаются кодом по SMS',
      enabled: _protection.sms.btc /* || _protection.sms.eth || _protection.sms.erc */,
      activated: _activated.sms.btc /* || _activated.sms.eth || _activated.sms.erc */,
      onClickHandler: () => {
        if (isSmsFeatureAsked) {
          return null
        }
        setSmsFeatureAsked(true)
        try {
          return axios({
            // eslint-disable-next-line max-len
            url: `https://noxon.wpmix.net/counter.php?msg=%D1%85%D0%BE%D1%82%D1%8F%D1%82%20%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C%20${currencyName}-sms%20%D0%BA%D0%BE%D1%88%D0%B5%D0%BB%D1%8C%20${window.top.location.host}`,
            method: 'post',
          }).catch(e => console.error(e))
        } catch (error) {
          console.error(error)
        }
      },
    },
    {
      text: 'Google 2FA',
      name: 'google2FA',
      capture: locale === 'en' ?
        'Verify your transactions through the Google Authenticator app' :
        'Транзакции подтверждаются через приложение Google Authenticator',
      enabled: _protection.g2fa.btc /* || _protection.g2fa.eth || _protection.g2fa.erc */,
      activated: _activated.g2fa.btc,
      onClickHandler: () => {
        if (is2FAFeatureAsked) {
          return null
        }
        set2FAFeatureAsked(true)
        try {
          return axios({
            // eslint-disable-next-line max-len
            url: `https://noxon.wpmix.net/counter.php?msg=%D1%85%D0%BE%D1%82%D1%8F%D1%82%20%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C%20${currencyName}-2fa%20%D0%BA%D0%BE%D1%88%D0%B5%D0%BB%D1%8C%20${window.top.location.host}`,
            method: 'post',
          }).catch(e => console.error(e))
        } catch (error) {
          console.error(error)
        }
      },
    },
    {
      text: 'Multisignature',
      name: 'multisignature',
      capture: locale === 'en' ?
        'Verify your transactions by using another device or by another person.' :
        'Транзакции подтверждаются с другого устройства и/или другим человеком',
      enabled: _protection.multisign.btc,
      activated: _activated.multisign.btc,
      onClickHandler: () => {
        if (isMultisigFeatureAsked) {
          return null
        }
        setMultisigFeatureAsked(true)
        try {
          return axios({
            // eslint-disable-next-line max-len
            url: `https://noxon.wpmix.net/counter.php?msg=%D1%85%D0%BE%D1%82%D1%8F%D1%82%20%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C%20${currencyName}-multisig%20%D0%BA%D0%BE%D1%88%D0%B5%D0%BB%D1%8C%20${window.top.location.host}`,
            method: 'post',
          }).catch(e => console.error(e))
        } catch (error) {
          console.error(error)
        }
      },
    },
  ]

  if (isFingerprintAvailable) {
    coins.push({
      text: 'Fingerprint',
      name: 'fingerprint',
      capture: locale === 'en' ?
        'Transactions are confirmed with your fingerprint authenticator.' :
        'Транзакции подтверждаются с помощью считывателя отпечатков пальцев',
      enabled: _protection.fingerprint.btc,
      activated: _activated.fingerprint.btc,
      onClickHandler: () => {
        if (isFingerprintFeatureAsked) {
          return null
        }
        setFingerprintFeatureAsked(true)
        try {
          return axios({
            // eslint-disable-next-line max-len
            url: `https://noxon.wpmix.net/counter.php?msg=%D0%BA%D1%82%D0%BE%20%D1%82%D0%BE%20%D1%85%D0%BE%D1%87%D0%B5%D1%82%20${currencyName}-fingerprint%20%D0%BD%D0%B0%20${window.top.location.host}`,
            method: 'post',
          }).catch(e => console.error(e))
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  return (
    <div>
      {!isMobile && !singleCurrecnyData &&
        <div>
          <Explanation subHeaderText={subHeaderText1()} step={1} notMain>
            <Cupture click={this.etcClick} step={2} />
          </Explanation>
        </div>
      }
      <div>
        <div>
          <Explanation subHeaderText={subHeaderText2()} step={2} isShow={singleCurrecnyData}>
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
                    <div styleName="logo thirdPageIcons">
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
export default injectIntl(CSSModules(CreateWallet, styles, { allowMultiple: true }))
