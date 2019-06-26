import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Option.scss'

import CurrencyIcon from 'components/ui/CurrencyIcon/CurrencyIcon'


const Option = ({ icon, title }) => (
  <div styleName="optionrow">
    <CurrencyIcon styleName="icon" name={icon} />
    {title}
  </div>
)


export default cssModules(Option, styles)
