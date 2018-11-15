import React, { Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './Option.scss'

import CurrencyIcon from 'components/ui/CurrencyIcon/CurrencyIcon'


const Option = ({ icon, title }) => (
  <Fragment>
    <CurrencyIcon styleName="icon" name={icon} />
    {title}
  </Fragment>
)

export default cssModules(Option, styles)
