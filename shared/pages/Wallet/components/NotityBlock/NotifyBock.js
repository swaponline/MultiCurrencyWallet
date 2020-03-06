import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import Button from 'components/controls/Button/Button'
import styles from './NotifyBlock.scss'

const NotifyBlock = ({
  className,
  icon,
  descr,
  tooltip,
  firstBtn,
  secondBtn,
  firstFunc,
  secondFunc,
  widthIcon,
  background
}) => (
  <div
    styleName="notifyBlock"
    style={{
      background: background.length < 7 ? `#${background}` : `url(${background}) no-repeat`,
      backgroundSize: 'cover'
    }}
  >
    <div>
      <div styleName="notifyBlockIcon">
        <img src={icon} width={widthIcon} alt="" />
      </div>
      <div styleName="notifyBlockDescr">
        <span>{descr}</span>
        <span>{tooltip}</span>
      </div>
    </div>
    {/* <div>
      {
        firstBtn && <Button white onClick={firstFunc}>
          {firstBtn}
        </Button>
      }
      {
        secondBtn && <Button transparent onClick={secondFunc}>
          {secondBtn}
        </Button>
      }

    </div> */}
  </div>
)

export default CSSModules(NotifyBlock, styles, { allowMultiple: true })
