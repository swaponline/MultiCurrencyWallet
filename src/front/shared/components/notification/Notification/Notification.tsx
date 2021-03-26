import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import styles from './Notification.scss'
import { constants } from 'helpers'
import Sound from 'helpers/Sound/alert.mp4'

const isDark = localStorage.getItem(constants.localStorage.isDark)

const Notification = (props) => {
  const {
    onClick: propsOnClick,
    soundPlay = true,
    className,
    children,
    name,
    type,
  } = props
  const [isMounted, setIsMounted] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (soundPlay) {
      soundClick()
    }

    const timeout = setTimeout(closeNotification, 8000)

    return () => clearTimeout(timeout)
  }, [isMounted])

  const closeNotification = () => {
    setIsRemoved(true)
    setTimeout(() => actions.notifications.hide(name), 300)
  }

  const handleClick = () => {
    if (propsOnClick) {
      propsOnClick()
    }

    closeNotification()
  }

  const soundClick = () => {
    const audio = new Audio()
    audio.src = Sound
    audio.autoplay = true
  }

  const containerStyleName = cx('container', {
    'mounted': isMounted,
    'removed': isRemoved,
  })

  const notificationStyleName = cx('notification', {
    'mounted': isMounted,
    'removed': isRemoved,
    'ErrorNotification': type === 'ErrorNotification',
  })

  return (
    <div styleName={containerStyleName}>
      <div styleName={notificationStyleName} onClick={handleClick}>
        <div styleName="content" className={className}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default cssModules(Notification, styles, { allowMultiple: true })
