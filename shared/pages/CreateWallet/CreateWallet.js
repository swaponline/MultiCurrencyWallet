import React, { useState } from 'react'

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

import check from './images/check'
import FirstStep from './Steps/FirstStep'
import SecondStep from './Steps/SecondStep'

import { color } from './chooseColor'


const styleBtn = { backgroundColor: '#f0eefd', color: '#6144E5' }
const defaultColors = { backgroundColor: '#6144E5' }

const CreateWallet = (props) => {
  const { history, intl: { locale }, createWallet: { usersData: { eMail }, currencies, secure }, createWallet } = props

  const [step, setStep] = useState(1)
  const [error, setError] = useState('Choose something')

  const steps = [1, 2]


  const handleClick = () => {
    setError(null)

    if (step !== 2) {
      reducers.createWallet.newWalletData({ type: 'step', data: step + 1 })
      return setStep(step + 1)
    }
    history.push(localisedUrl(locale, '/wallet'))
  }

  const validate = () => {
    setError(null)
    if (!Object.values(currencies).includes(true) && step === 1) {
      setError('Choose something')

      return
    }

    if (!secure.length && step === 2) {
      setError('Choose something')
      return
    }
    if (step === 2) {
      switch (secure) {
        case 'withoutSecure':
          Object.keys(currencies).forEach(el => {
            if (currencies[el]) {
              actions.core.markCoinAsVisible(el.toUpperCase())
            }
          })
          break;
        case 'sms':
          if (currencies.btc) {
            actions.core.markCoinAsVisible('BTC (SMS-Protected)')
          }
          break;
      }
    }

    handleClick()
  }

  return (
    <div styleName="wrapper">
      <div styleName={isMobile ? 'mobileFormBody' : 'formBody'}>
        <h2>
          <FormattedMessage
            id="createWalletHeader1"
            defaultMessage="Создайте кошелек  в три простых шага?"
          />
        </h2>
        {isMobile &&
          <div styleName="inLine steps">
            {steps.map(el => (
              <div styleName={`stepNumber ${color(step, el)}`}>
                {step > el ? check() : el}
              </div>
            ))}
          </div>
        }
        <div>
          {step === 1 && <FirstStep error={error} onClick={validate} setError={setError} />}
          {step === 2 && <SecondStep error={error} onClick={validate} currencies={currencies} setError={setError} />}
        </div>
      </div>
    </div>
  )
}
export default connect({
  createWallet: 'createWallet',
})(injectIntl(withRouter(CSSModules(CreateWallet, styles, { allowMultiple: true }))))
