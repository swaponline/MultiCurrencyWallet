import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { localisedUrl } from '../../../../helpers/locale'
import { withRouter } from 'react-router'
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
  background,
  link,
  history
}) => {

  const handleGoto = () => {
    history.push(link)
  }

  return (
    <div
    styleName="notifyBlock"
    style={{
      background: background && background.length < 7 ? `#${background}` : `url(${background}) no-repeat`,
      backgroundSize: 'cover'
    }}
  >
    {background && background.length > 7 ? <div styleName="notifyBlockOverlay"></div> : ''}
    <div>
      <div styleName="notifyBlockIcon">
        <img src={icon} width={widthIcon} alt="" />
      </div>
      <div styleName="notifyBlockDescr">
        <span onClick={handleGoto}>{descr}</span>
        <span>{tooltip}</span>
        {
          firstBtn && <span transparent onClick={firstFunc}>
            {firstBtn}
          </span>
        }
      </div>
    </div>
    <div>
    </div>
  </div>
  )
}


export default withRouter((CSSModules(NotifyBlock, styles, { allowMultiple: true })))

