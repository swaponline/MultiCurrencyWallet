import React from 'react'
import { withRouter } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import styles from './NotifyBlock.scss'
import feedback from 'shared/helpers/feedback'


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
    firstFunc && firstFunc()
    if (link && link.includes('http')) {
      window.location = link
    } else {
      if (link) {
        history.push(link)
      }
    }
    const text = logDescr || descr
    feedback.wallet.clickedBanner(text)
  }

  const backGroundStyle = { background: `#${background}` }
  const backGroundImgStyle = { backgroundImage: `url(${background})` }
  const style = background && background.length < 7 ? backGroundStyle : backGroundImgStyle
  return (
    <div styleName="notifyBlock" style={style} onClick={handleGoto}>
      {background && background.length > 7 ? <div styleName="notifyBlockOverlay" /> : ''}
      <div>
        <div styleName="notifyBlockIcon">
          <img src={icon} alt="" />
        </div>
        <div styleName="notifyBlockDescr">
          <span>{descr}</span>
          <span>{tooltip}</span>
        </div>
      </div>
    </div>
  )
}

export default withRouter(CSSModules(NotifyBlock, styles, { allowMultiple: true }))
