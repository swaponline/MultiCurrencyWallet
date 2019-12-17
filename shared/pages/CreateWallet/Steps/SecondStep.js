import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import { connect } from 'redaction'
import reducers from 'redux/core/reducers'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from 'react-intl'
import { isMobile } from 'react-device-detect'

import config from 'app-config'
import { constants } from 'helpers'
import actions from 'redux/actions'

import Explanation from '../Explanation'
import icons from '../images'
import Cupture,
{
  subHeaderText1,
  subHeaderText2,
  cupture2,
} from './texts'


const CreateWallet = (props) => {
  const { intl: { locale }, onClick, currencies, error, setError, singleCurrecnyData } = props

  const _protection = {
    nothing: {
      btc: true,
      eth: true,
      erc: true,
    },
    sms: {},
    g2fa: {},
    multisign: {},
  }

  const _activated = {
    nothing: {},
    sms: {},
    g2fa: {},
    multisign: {},
  }

  if (currencies.BTC) {
    _protection.sms.btc = true
    _protection.g2fa.btc = false
    _protection.multisign.btc = true
    _activated.sms.btc = actions.btcmultisig.checkSMSActivated()
    _activated.g2fa.btc = actions.btcmultisig.checkG2FAActivated()
    _activated.multisign.btc = actions.btcmultisig.checkUserActivated()
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

  const handleClick = (index, el) => {
    const { name, enabled, activated } = el
    if (!enabled || activated) return
    //if (activated) return
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

  console.log("locale", locale)
  const coins = [
    {
      text: locale === 'en' ? 'Without Secure' : 'Без защиты',
      name: 'withoutSecure',
      capture: locale === 'en' ? 'suitable for small amounts' : 'Подходит для небольших сумм',
      enabled: true,
      activated: false,
    },
    {
      text: 'SMS',
      name: 'sms',
      capture: locale === 'en' ? 'transactions are confirmed by SMS code' : 'Транзакции подтверждаются кодом по SMS',
      enabled: _protection.sms.btc /* || _protection.sms.eth || _protection.sms.erc */,
      activated: _activated.sms.btc /* || _activated.sms.eth || _activated.sms.erc */,
    },
    {
      text: 'Google 2FA',
      name: 'google2FA',
      capture: locale === 'en' ?
        'Transactions are verified through the Google Authenticator app' :
        'Транзакции подтверждаются через приложение Google Authenticator',
      enabled: _protection.g2fa.btc /* || _protection.g2fa.eth || _protection.g2fa.erc */,
      activated: _activated.g2fa.btc,
    },
    {
      text: 'Multisignature',
      name: 'multisignature',
      capture: locale === 'en' ?
        'Transactions are confirmed from another device and / or by another person.' :
        'Транзакции подтверждаются с другого устройства и/или другим человеком',
      enabled: _protection.multisign.btc,
      activated: _activated.multisign.btc,
    },
  ]

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
                  styleName={`${cardStyle_}`}
                  onClick={() => handleClick(index, el)}
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
        <button styleName="continue" onClick={onClick} disabled={error}>
          <FormattedMessage id="createWalletButton3" defaultMessage="Create Wallet" />
        </button>
      </div>
    </div>
  )
}
export default injectIntl(CSSModules(CreateWallet, styles, { allowMultiple: true }))
