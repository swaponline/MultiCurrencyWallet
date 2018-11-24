import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Hidebtn.scss'
import cx from 'classnames'


const Hidebtn = (props) => {

const {
  children,
  className,
  brand,
  ...rest,
} = props

const styleName = cx('Hidebtn', {
  'brand': brand,
})

  return (
    <button styleName={styleName} className={className} {...rest}>
      {children}
    </button>
  )
}


export default CSSModules(Hidebtn, styles, { allowMultiple: true })
