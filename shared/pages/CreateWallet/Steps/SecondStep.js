import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import reducers from 'redux/core/reducers'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from 'react-intl'

import Explanation from '../Explanation'
import { isMobile } from 'react-device-detect'

import { subHeaderText1,
  cupture1,
  subHeaderText2,
  cupture2,
  subHeaderText3,
  cupture3,
} from './texts'


const CreateWallet = (props) => {
  const { intl: { locale }, onClick, error, setError } = props
  const [inputValue, setInputValue] = useState({
    userName: '',
    eMail: '',
  })
  const inputs = [
    { name: 'userName', placeHolder: locale === 'en' ? 'User name' : 'Имя пользователя' },
    { name: 'eMail', placeHolder: locale === 'en' ? 'e-Mail' : 'Эл. почта' },
  ]

  const onChange = e => {
    const { target: { value, name } } = e
    const dataToReturn = { ...inputValue, [name]: value }
    setError(null)
    setInputValue(dataToReturn)
    reducers.createWallet.newWalletData({ type: 'usersData', data: dataToReturn })
  }

  return (
    <div>
      {!isMobile &&
        <Explanation step={1} subHeaderText={subHeaderText1()} notMain>
          {cupture1()}
        </Explanation>
      }
      <div>
        <div>
          <Explanation step={2} subHeaderText={subHeaderText2()}>
            {cupture2()}
          </Explanation>
          <div styleName="inputWrapper">
            {inputs.map(el => {
              const { name, placeHolder } = el
              return (
                <input name={name} onChange={onChange} styleName="secondStepInput" placeholder={placeHolder} type="email" />
              )
            })}
            {error && <b styleName="error">{error}</b>}
          </div>
        </div>
        <button styleName="continue" onClick={onClick} disabled={error}>
          <FormattedMessage id="createWalletButton1" defaultMessage="Продолжить" />
        </button>
        <br />
        {!isMobile &&
          <div styleName="notYet" onClick={onClick}>
            <FormattedMessage id="createWalleLater" defaultMessage="Не сейчас" />
          </div>
        }
      </div>
      {!isMobile &&
        <Explanation step={3} subHeaderText={subHeaderText3()} notMain>
          {cupture3()}
        </Explanation>
      }
    </div>
  )
}
export default injectIntl(CSSModules(CreateWallet, styles, { allowMultiple: true }))
