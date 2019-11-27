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
import { constants, localStorage } from 'helpers'


const styleBtn = { backgroundColor: '#f0eefd', color: '#6144E5' }
const defaultColors = { backgroundColor: '#6144E5' }

const CreateWallet = (props) => {
  const { history, intl: { locale }, createWallet: { usersData: { eMail }, currencies, secure }, location: { pathname } } = props
  const allCurrencies = props.currencies.items

  const [step, setStep] = useState(1)
  const [error, setError] = useState('Choose something')

  const steps = [1, 2]


  const handleClick = () => {
    setError(null)

    if (step !== 2) {
      reducers.createWallet.newWalletData({ type: 'step', data: step + 1 })
      return setStep(step + 1)
    }
    localStorage.setItem(constants.localStorage.isWalletCreate, true)
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
          break
        case 'sms':
          if (currencies.btc) {
            actions.modals.open(constants.modals.RegisterSMSProtected, {
              callback: () => {
                actions.core.markCoinAsVisible('BTC (SMS-Protected)')
                handleClick()
              },
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

  const singleCurrecny = pathname.split('/')[2]
  const singleCurrecnyData = allCurrencies.find(({ name }) => name === singleCurrecny && singleCurrecny.toUpperCase())

  if (singleCurrecnyData) {
    currencies[singleCurrecny.toLowerCase()] = true
  }

  return (
    <div styleName="wrapper">
      <div styleName={isMobile ? 'mobileFormBody' : 'formBody'}>
        <h2>
          <FormattedMessage
            id="createWalletHeader1"
            defaultMessage="Создание кошелька"
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
        {singleCurrecnyData ?
          <SecondStep error={error} onClick={validate} currencies={currencies} setError={setError} singleCurrecnyData /> :
          <div>
            {step === 1 && <FirstStep error={error} onClick={validate} setError={setError} />}
            {step === 2 && <SecondStep error={error} onClick={validate} currencies={currencies} setError={setError} />}
          </div>
        }
      </div>
    </div>
  )
}
export default connect({
  createWallet: 'createWallet', 
  currencies: 'currencies', 
})(injectIntl(withRouter(CSSModules(CreateWallet, styles, { allowMultiple: true }))))
