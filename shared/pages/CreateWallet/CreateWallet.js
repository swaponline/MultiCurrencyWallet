import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import styles from './CreateWallet.scss'

import { connect } from 'redaction'

import { FormattedMessage, injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import reducers from 'redux/core/reducers'

import links from 'helpers/links'
import { localisedUrl } from 'helpers/locale'

import check from './images/check'
import FirstStep from './Steps/FirstStep'
import SecondStep from './Steps/SecondStep'
import ThirdStep from './Steps/ThirdStep'

import { color } from './chooseColor'


const styleBtn = { backgroundColor: '#f0eefd', color: '#6144E5' }
const defaultColors = { backgroundColor: '#6144E5' }

const CreateWallet = (props) => {
  const { history, intl: { locale }, createWallet: { usersData: { eMail }, currencies, secure }, createWallet } = props

  const [step, setStep] = useState(1)
  const [error, setError] = useState('Choose something')

  const steps = [1, 2, 3]


  const handleClick = () => {
    setError(null)

    if (step === 2) {
      setError('Choose something')
    }

    if (step !== 3) {
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

    if (step === 2 && eMail.length) {
      if (!/.+@.+\.[A-Za-z]+$/.test(eMail)) {
        setError('Invalid e-mail')
        return
      }
    }

    if (!secure.length && step === 3) {
      setError('Choose something')
      return
    }
    handleClick()
  }

  return (
    <div styleName="wrapper">
      <div styleName={isMobile ? 'mobileFormBody' : 'formBody'}>
        <h2>
          <FormattedMessage
            id="createWalletHeader1"
            defaultMessage="Создайте кошелек  в три простых шага?" 
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
          {step === 2 && <SecondStep error={error} onClick={validate} setError={setError} />}
          {step === 3 && <ThirdStep error={error} onClick={validate} setError={setError} />}
        </div>
      </div>
    </div>
  )
}
export default connect({
  createWallet: 'createWallet',
})(injectIntl(withRouter(CSSModules(CreateWallet, styles, { allowMultiple: true }))))
