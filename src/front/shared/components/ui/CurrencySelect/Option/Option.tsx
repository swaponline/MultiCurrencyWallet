import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Option.scss'

import CurrencyIcon from 'components/ui/CurrencyIcon/CurrencyIcon'
import config from 'app-config'


const Option = (props) => {
  let { icon, title, blockchain } = props

  return (
    <div styleName="optionrow">
      <span styleName="circle">
        <CurrencyIcon styleName="icon" name={icon} />
      </span>
      {(blockchain) ? `${title.replaceAll('*','')} (${blockchain})` : title}
    </div>
  )
}


export default cssModules(Option, styles)
