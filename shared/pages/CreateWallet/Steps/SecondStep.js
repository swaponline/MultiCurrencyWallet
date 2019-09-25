import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import reducers from 'redux/core/reducers'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from 'react-intl'

import Check from '../colorsIcons/check'
import Explanation from '../Explanation'


const subHeaderText = () => (
  <FormattedMessage
    id="createWalletSubHeader2"
    defaultMessage="Enter the user name and e-mail"
  />
)

const CreateWallet = (props) => {
  const { intl: { locale } } = props
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

    setInputValue(dataToReturn)
    reducers.createWallet.newWalletData({ type: 'usersData', data: dataToReturn })
  }

  return (
    <div>
      <Explanation subHeaderText={subHeaderText()}>
        <FormattedMessage
          id="createWalletCapture2"
          defaultMessage="You will receive notifications of completed transactions from your wallet"
        />
      </Explanation>
      <div styleName="inputWrapper">
        {inputs.map(el => {
          const { name, placeHolder } = el
          return (
            <input name={name} onChange={onChange} styleName="secondStepInput" placeHolder={placeHolder} name={name} type="text" />
          )
        })}
      </div>
    </div>
  )
}
export default injectIntl(CSSModules(CreateWallet, styles, { allowMultiple: true }))
