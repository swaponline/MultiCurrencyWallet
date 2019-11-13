import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import { connect } from 'redaction'
import reducers from 'redux/core/reducers'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from 'react-intl'
import { isMobile } from 'react-device-detect'

import Explanation from '../Explanation'
import icons from '../images'
import { subHeaderText1,
  cupture1,
  subHeaderText2,
  cupture2,
} from './texts'


const CreateWallet = (props) => {
  const { intl: { locale }, onClick, currencies, error, setError } = props

  let smsProtectionEnabled = false

  if (currencies.btc) smsProtectionEnabled = true

  const [border, setBorder] = useState({
    color: {
      withoutSecure: false,
      sms: false,
      google2FA: false,
      multisignature: false,
    },
    selected: '',
  })

  const handleClick = (name, index, enabled) => {
    if (!enabled) return
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

  const coins = [
    {
      text: locale === 'en' ? 'Without Secure' : 'Без защиты',
      name: 'withoutSecure',
      capture: locale === 'en' ? 'suitable for small amounts' : 'Подходит для небольших сумм',
      enabled: true,
    },
    { 
      text: 'SMS',
      name: 'sms',
      capture: locale === 'en' ? 'transactions are confirmed by SMS code' : 'Транзакции подтверждаются кодом по SMS',
      enabled: smsProtectionEnabled,
    },
    {
      text: 'Google 2FA',
      name: 'google2FA',
      capture: locale === 'en' ?
        'Transactions are verified through the Google Authenticator app' :
        'Транзакции подтверждаются через приложение Google Authenticator',
      enabled: false,
    },
    {
      text: 'Multisignature',
      name: 'multisignature',
      capture: locale === 'en' ?
        'Transactions are confirmed from another device and / or by another person.' :
        'Транзакции подтверждаются с другого устройства и/или другим человеком',
      enabled: false,
    },
  ]

  return (
    <div>
      {!isMobile &&
        <div>
          <Explanation subHeaderText={subHeaderText1()} step={1} notMain>
            {cupture1()}
          </Explanation>
        </div>
      }
      <div>
        <div>
          <Explanation subHeaderText={subHeaderText2()} step={2}>
            {cupture2()}
          </Explanation>
          <div styleName="currencyChooserWrapper currencyChooserWrapperSecond">
            {coins.map((el, index) => {
              const { name, capture, text, enabled } = el
              return (
                <div
                  styleName={
                    `card secureSize thirdCard ${border.color[name] && enabled ? 'purpleBorder' : ''} ${!enabled ? 'cardDisabled' : ''}`
                  }
                  onClick={() => handleClick(name, index, enabled)}
                >
                  {!enabled &&
                    <em>
                      <FormattedMessage id="createWalletSoon" defaultMessage="Soon!" />
                    </em>
                  }
                  <img
                    styleName="logo thirdPageIcons"
                    src={icons[name]}
                    alt={`${name} icon`}
                    role="image"
                  />
                  <div styleName="listGroup">
                    <li>
                      <b>{text}</b>
                    </li>
                    <li>{capture}</li>
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
