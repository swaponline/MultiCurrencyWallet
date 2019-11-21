import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import NewButton from 'components/controls/NewButton/NewButton'
import styles from './NotifyBlock.scss'


const NotifyBlock = ({ className, icon, descr, tooltip, firstBtn, secondBtn, firstFunc, secondFunc }) => (
    <div styleName={`notifyBlock ${className}`}>
    <div>
      <div styleName="notifyBlockIcon">
        <img src={icon} alt=""/>
      </div>
      <div styleName="notifyBlockDescr">
        <p>{descr}</p>
        <p>{tooltip}</p>
      </div>
    </div>
    <div>
      <NewButton white onClick={firstFunc}>
        {firstBtn}
      </NewButton>
      <NewButton transparent onClick={secondFunc}>
        {secondBtn}
      </NewButton>
    </div>
  </div>   
)


export default CSSModules(NotifyBlock, styles,  { allowMultiple: true })
