import React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import styles from './NotifyBlock.scss'
import feedback from 'shared/helpers/feedback'


interface INotifyBlockProps {
  className?: string
  background: string
  icon?: string
  text: JSX.Element | string
  feedbackText?: string
  onPress?: () => void
  link?: string
}

const NotifyBlock = (props: INotifyBlockProps & RouteComponentProps) => {
  const {
    className,
    icon,
    text,
    onPress,
    background,
    link,
    feedbackText,
    history,
  } = props

  const handleClick = () => {
    onPress && onPress()

    if (link && link.includes('http')) {
      window.location.href = link
    } else {
      if (link) {
        history.push(link)
      }
    }

    const textToSend = feedbackText || text
    feedback.wallet.clickedBanner(textToSend)
  }

  const backGroundStyle = { background: `#${background}` }
  const backGroundImgStyle = { backgroundImage: `url(${background})` }
  const style = background && background.length < 7 ? backGroundStyle : backGroundImgStyle

  return (
    <div styleName="notifyBlock" style={style} onClick={handleClick}>
      {background && background.length > 7 ? <div styleName="notifyBlockOverlay" /> : ''}
      <div>
        <div styleName="notifyBlockIcon">
          <img src={icon} alt="" />
        </div>
        <div styleName="notifyBlockDescr">
          <span>{text}</span>
        </div>
      </div>
    </div>
  )
}


export default withRouter(CSSModules(NotifyBlock, styles, { allowMultiple: true }))
