import React, { Component } from 'react'
import { connect } from 'redaction'

import actions from 'redux/actions'
import cx from 'classnames'
import cssModules from 'react-css-modules'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import Overlay from 'components/layout/Overlay/Overlay'
import Center from 'components/layout/Center/Center'
import styles from './Modal.scss'

type ModalProps = {
  title?: JSX.Element | string
  closeOnLocationChange?: boolean | Function
  onClose?: (isLocationChange) => boolean | void

  children: JSX.Element | JSX.Element[]
  data?: IUniversalObj
  onLocationChange?: (hash: string) => boolean
  name: string
  className?: string
  styleName?: string
  showLogo?: boolean
  whiteLogo?: boolean
  delayClose?: boolean
  disableClose?: boolean
  dashboardView?: boolean
  titleUppercase?: boolean
  showCloseButton?: boolean
  shouldCenterVertically?: boolean
  shouldCenterHorizontally?: boolean
  contentWithTabs?: boolean
}

@connect(({
  ui: { dashboardModalsAllowed },
}) => ({
  dashboardView: dashboardModalsAllowed,
}))
@cssModules(styles, { allowMultiple: true })
export default class Modal extends Component<ModalProps, object> {

  catchLocationChange = null

  componentDidMount() {
    const {
      closeOnLocationChange,
      onLocationChange,
      name,
    } = this.props

    window.addEventListener('popstate', () => actions.modals.close(name))

    if (closeOnLocationChange) {
      let currentLocation = window.location.hash

      // @ts-ignore: strictNullChecks
      this.catchLocationChange = setInterval(() => {
        if (window.location.hash != currentLocation) {
          if (typeof onLocationChange === 'function') {
            if (onLocationChange(window.location.hash)) {
              currentLocation = window.location.hash
            } else {
              // @ts-ignore: strictNullChecks
              clearInterval(this.catchLocationChange)
              this.close(null, true)
            }
          } else {
            // @ts-ignore: strictNullChecks
            clearInterval(this.catchLocationChange)
            this.close(null, true)
          }
        }
      }, 500)
    }
  }

  componentWillUnmount() {
    const { name } = this.props

    window.removeEventListener('popstate', () => actions.modals.close(name))
    // @ts-ignore: strictNullChecks
    clearInterval(this.catchLocationChange)
  }

  close = (event, isLocationChange) => {
    const { name, data, onClose, disableClose } = this.props

    if (name === 'OfferModal') {
      // actions.analytics.dataEvent('orderbook-addoffer-click-exit-button')
    }

    if (!disableClose) {
      actions.modals.close(name)

      if (onClose && typeof onClose === 'function') {
        onClose(isLocationChange)
      }

      // @ts-ignore: strictNullChecks
      if (data?.onClose && typeof data.onClose === 'function') {
        // @ts-ignore: strictNullChecks
        data.onClose(isLocationChange)
      }
    }
  }

  render() {
    const {
      className,
      title,
      showCloseButton,
      disableClose,
      children,
      titleUppercase,
      shouldCenterHorizontally,
      shouldCenterVertically,
      styleName,
      delayClose,
      dashboardView,
      contentWithTabs,
    } = this.props

    const titleStyleName = cx('title', {
      'uppercase': titleUppercase,
    })

    return (
      <Overlay dashboardView={dashboardView} styleName={styleName}>
        <div
          styleName={cx({
            modal: true,
            modal_dashboardView: dashboardView,
          })}
          className={className}
        >
          {
            Boolean(title || showCloseButton) && (
              <div styleName="header">
                {/*
                  //@ts-ignore */}
                <WidthContainer styleName="headerContent">
                  <div styleName={titleStyleName} role="title">{title}</div>
                  {
                    showCloseButton && !disableClose && (
                      <CloseIcon styleName={`closeButton ${delayClose ? 'delayClose' : ''}`} onClick={this.close} data-testid="modalCloseIcon" />
                    )
                  }
                </WidthContainer>
              </div>
            )
          }
          <div styleName={cx({
            contentContainer: true,
            contentContainer_dashboardView: dashboardView,
          })}>
            {
              dashboardView
                ? (
                  <div styleName={contentWithTabs ? 'content content_dashboardView withTabs' : 'content content_dashboardView'} className="contentHeightEvaluateHere">
                    {children}
                  </div>
                )
                : (
                  <Center scrollable centerHorizontally={shouldCenterHorizontally} centerVertically={shouldCenterVertically}>
                    <div styleName={contentWithTabs ? 'content withTabs' : 'content'}>
                      {children}
                    </div>
                  </Center>
                )
            }
          </div>
        </div>
      </Overlay>
    )
  }
}
