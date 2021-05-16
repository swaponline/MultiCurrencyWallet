import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import styles from './Notification.scss'
import { constants } from 'helpers'
import Sound from 'helpers/Sound/alert.mp4'
import { RemoveButton } from 'components/controls'

const isDark = localStorage.getItem(constants.localStorage.isDark)

const Notification = (props) => {
  const {
    soundPlay = true,
    className,
    children,
    name,
    type,
  } = props
  const [isMounted, setIsMounted] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)

  const closeOnEscapeKey = (event) => {
    if (event.key === 'Escape') {
      closeNotification()
    }
  }

  useEffect(() => {
    setIsMounted(true)

    if (soundPlay) {
      soundClick()
    }

    document.addEventListener('keydown', closeOnEscapeKey)
    const timeout = setTimeout(closeNotification, 8000)

    return () => {
      document.removeEventListener('keydown', closeOnEscapeKey)
      clearTimeout(timeout)
    }
  }, [isMounted])

  const closeNotification = () => {
    setIsRemoved(true)
    setTimeout(() => actions.notifications.hide(name), 300)
  }

  const soundClick = () => {
    const audio = new Audio()
    audio.src = Sound
    audio.autoplay = true
  }

  const containerStyleName = cx('container', {
    'mounted': isMounted,
    'removed': isRemoved,
    'dark': isDark,
  })

  const notificationStyleName = cx('notification', {
    'mounted': isMounted,
    'removed': isRemoved,
    'errorNotification': type === 'ErrorNotification',
  })

  return (
    <div styleName={containerStyleName}>
      <div styleName={notificationStyleName}>
        <div styleName="content" className={className}>
          {children}
        </div>

        <RemoveButton onClick={closeNotification} />
      </div>
    </div>
  )
}

export default cssModules(Notification, styles, { allowMultiple: true })
