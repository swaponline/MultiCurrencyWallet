import React from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './WithdrawButton.scss'


const WithdrawButton = ({ data }) => (
  <div
    styleName="withdrawButton"
    onClick={() => {
      actions.modals.open(constants.modals.Withdraw, data)
    }}
  >
    Withdraw
  </div>
)

export default CSSModules(WithdrawButton, styles)
