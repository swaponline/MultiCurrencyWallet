import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { localisedUrl } from '../../../../helpers/locale'
import { withRouter } from 'react-router'
import CSSModules from 'react-css-modules'
import Button from 'components/controls/Button/Button'
import styles from './NotifyBlock.scss'

const NotifyBlock = ({
  icon,
  descr,
  tooltip,
  firstFunc,
  background,
  link,
  history,
  logDescr,
}) => {
  const handleGoto = () => {
    console.log('descr', descr)
    console.log('hostname', window.location.hostname)
    firstFunc && firstFunc()
    if (link && link.includes('http')) {
      window.location = link;
    } else {
      if (link) history.push(link)
    }
    try {
      axios({
        url: `https://noxon.wpmix.net/counter.php?msg=${(logDescr) ? logDescr : descr}host=${window.location.hostname}`,
        method: 'post',
      }).catch(e => console.error(e))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div
      styleName="notifyBlock"
      style={{
        background: background && background.length < 7 ? `#${background}` : `url(${background}) no-repeat`,
      }}
      onClick={handleGoto}
    >
      {background && background.length > 7 ? <div styleName="notifyBlockOverlay"></div> : ''}
      <div>
        <div styleName="notifyBlockIcon">
          <img src={icon} alt="" />
        </div>
        <div styleName="notifyBlockDescr">
          <span >{descr}</span>
          <span>{tooltip}</span>
        </div>
      </div>
    </div>
  )
}

export default withRouter(CSSModules(NotifyBlock, styles, { allowMultiple: true }))
