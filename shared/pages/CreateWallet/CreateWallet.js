import React, { useState, useEffect } from 'react'

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
import NewButton from '../../components/controls/NewButton/NewButton'
import FirstStep from './Steps/FirstStep'
import SecondStep from './Steps/SecondStep'

import { color } from './chooseColor'
import { constants, localStorage } from 'helpers'


const styleBtn = { backgroundColor: '#f0eefd', color: '#6144E5' }
const defaultColors = { backgroundColor: '#6144E5' }

const CreateWallet = (props) => {
  const { history, intl: { locale }, createWallet: { usersData: { eMail }, currencies, secure }, location: { pathname } } = props
  const allCurrencies = props.currencies.items

  useEffect(
    () => {
      const singleCurrecny = pathname.split('/')[2]

      if (singleCurrecny) {

        const hiddenList = localStorage.getItem('hiddenCoinsList')

        if (!hiddenList.includes(singleCurrecny.toUpperCase())) {
          setExist(true)
        }
      }
    },
    [pathname],
  )

  const [step, setStep] = useState(1)
  const [error, setError] = useState('Choose something')
  const [isExist, setExist] = useState(false)
  const steps = [1, 2]

  const goHome = () => {
    history.push(localisedUrl(locale, '/wallet'))
  }

  const handleClick = () => {
    setError(null)
    if (step !== 2 && !singleCurrecnyData) {
      reducers.createWallet.newWalletData({ type: 'step', data: step + 1 })
      return setStep(step + 1)
    }
    localStorage.setItem(constants.localStorage.isWalletCreate, true)
    goHome()
  }

  const handleImportKeys = () => {
    actions.modals.open(constants.modals.ImportKeys, {})
  }

  const validate = () => {
    setError(null)
    if (!Object.values(currencies).includes(true) && step === 1) {
      setError('Choose something')

      return
    }

    if (!secure.length && (step === 2 || singleCurrecnyData)) {
      setError('Choose something')
      return
    }
    if (step === 2 || singleCurrecnyData) {

      switch (secure) {
        case 'withoutSecure':
          Object.keys(currencies).forEach(el => {
            if (currencies[el]) {
              actions.core.markCoinAsVisible(el.toUpperCase())
            }
          })
          handleClick()
          break
        case 'sms':
          if (currencies.BTC) {
            if (!actions.btcmultisig.checkSMSActivated()) {
              actions.modals.open(constants.modals.RegisterSMSProtected, {
                callback: () => {
                  actions.core.markCoinAsVisible('BTC (SMS-Protected)')
                  handleClick()
                },
              })
            } else {
              actions.core.markCoinAsVisible('BTC (SMS-Protected)')
            }
          }
          break;
        case 'multisignature':
          if (currencies.BTC) {
            actions.core.markCoinAsVisible('BTC (Multisig)')
            handleClick()
          }
          break
        default:
          console.warn('unconnected secure type')
      }
    }
    handleClick()
  }

  const singleCurrecny = pathname.split('/')[2]
  let singleCurrecnyData

  if (singleCurrecny) {
    singleCurrecnyData = allCurrencies.find(({ name }) => name === singleCurrecny.toUpperCase())
    if (singleCurrecnyData) {
      currencies[singleCurrecny.toLowerCase()] = true
    }
  }

  if (isExist) {
    goHome()
  }
  return (
    <div styleName="wrapper">
      <div styleName={isMobile ? 'mobileFormBody' : 'formBody'}>
        <h2>
          <FormattedMessage
            id="createWalletHeader1"
            defaultMessage="Создание кошелька"
          />
          {' '}{singleCurrecny && singleCurrecny.toUpperCase()}
        </h2>
        <div styleName="buttonWrapper">
          <NewButton blue onClick={handleImportKeys}>
            <FormattedMessage
              id="ImportKeysBtn"
              defaultMessage="Импортировать"
            />
          </NewButton>
        </div>
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
