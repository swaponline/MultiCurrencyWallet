import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Option.scss'

import CurrencyIcon from 'components/ui/CurrencyIcon/CurrencyIcon'


const Option = ({ icon, title }) => (
  <div styleName="optionrow">
    <span styleName="circle">
      {/*
      //@ts-ignore */}
      <CurrencyIcon styleName="icon" name={icon} />
    </span>
    {title}
  </div>
)


export default cssModules(Option, styles)
