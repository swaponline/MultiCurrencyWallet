import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import styles from './CreateWallet.scss'

import { connect } from 'redaction'

import { FormattedMessage, injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import links from 'helpers/links'
import { localisedUrl } from 'helpers/locale'

import check from './colorsIcons/check'
import FirstStep from './Steps/FirstStep'
import SecondStep from './Steps/SecondStep'
import ThirdStep from './Steps/ThirdStep'


const color = (step, el) => {
  if (step === el) {
    return 'purple'
  } else if (step > el) {
    return 'green'
  }
  return ''
}
const CreateWallet = (props) => {
  const [step, setStep] = useState(1)
  const steps = [1, 2, 3]
  const { history, intl: { locale }, createWallet } = props


  const handleClick = () => {
    if (step !== 3) {
      // if(step === 2) {
      //   //!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
      //
      // }
      return setStep(step + 1)
    }
    history.push(localisedUrl(locale, '/'))
  }

  return (
    <div styleName="wrapper">
      <div styleName="formBody">
        <h2>
          <FormattedMessage id="createWalletHeader1" defaultMessage="Create the wallet by 3 simple steps?" />
        </h2>
        <div styleName="inLine">
          {steps.map(el => (
            <div styleName={`stepNumber ${color(step, el)}`}>
              {step > el ? check() : el}
            </div>
          ))}
        </div>
        <div>
          {step === 1 && <FirstStep />}
          {step === 2 && <SecondStep />}
          {step === 3 && <ThirdStep />}
          <button styleName="continue" onClick={handleClick}>
            {step === 3 ?
              <FormattedMessage id="createWalletButton3" defaultMessage="Create Wallet" /> :
              <FormattedMessage id="createWalletButton1" defaultMessage="Continue" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
export default connect({
  createWallet: 'createWallet',
})(injectIntl(withRouter(CSSModules(CreateWallet, styles, { allowMultiple: true }))))
