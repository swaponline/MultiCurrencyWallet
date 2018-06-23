import React from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './WithdrawButton.scss'


const WithdrawButton = ({ title, data }) => (
  <div
    styleName="withdrawButton"
    onClick={() => {

      actions.analytics.dataEvent('balances-withdraw-'+data.currency.toLowerCase())
      actions.modals.open(constants.modals.Withdraw, data)
    }}
  >
    {title}
  </div>
)

export default CSSModules(WithdrawButton, styles)
