import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import styles from './Notification.scss'
import Sound from 'helpers/Sound/alert.mp4'
import { RemoveButton } from 'components/controls'

const Notification = (props) => {
  const {
    soundPlay = true,
    className,
    children,
    name,
    type,
    timeout,
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

    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined

    if (timeout !== false) {
      timeoutId = setTimeout(
        closeNotification,
        timeout === undefined ? 8000 : timeout
      )
    }

    return () => {
      document.removeEventListener('keydown', closeOnEscapeKey)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isMounted, timeout])

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
  })

  const notificationStyleName = cx('notification', {
    'mounted': isMounted,
    'removed': isRemoved,
    'errorNotification': type === 'ErrorNotification',
    'warning': type === 'warning'
  })

  return (
    <div id="notificationModal" styleName={containerStyleName}>
      <div styleName={notificationStyleName}>
        <div styleName="content" className={className}>
          {children}
        </div>

        <RemoveButton id="notificationCloseButton" onClick={closeNotification} />
      </div>
    </div>
  )
}

export default cssModules(Notification, styles, { allowMultiple: true })
