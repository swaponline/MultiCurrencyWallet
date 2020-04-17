import React, { Component } from 'react'

import actions from 'redux/actions'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './Modal.scss'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import Overlay from 'components/layout/Overlay/Overlay'
import Center from 'components/layout/Center/Center'
import Logo from 'components/Logo/Logo'


@cssModules(styles, { allowMultiple: true })
export default class Modal extends Component {

  static propTypes = {
    children: PropTypes.node,
    name: PropTypes.string.isRequired,
    title: PropTypes.any,
    showCloseButton: PropTypes.bool,
    data: PropTypes.object,
    disableClose: PropTypes.bool,
    titleUppercase: PropTypes.bool,
    onClose: PropTypes.func,
    shouldCenterVertically: PropTypes.bool,
    shouldCenterHorizontally: PropTypes.bool,
    whiteLogo: PropTypes.bool,
    showLogo: PropTypes.bool,
  }

  static defaultProps = {
    data: {},
    whiteLogo: false,
    showLogo: true,
    showCloseButton: true,
    fullWidth: false,
    disableClose: false,
    disableCloseOverlay: false,
    uppercase: false,
    shouldCenterVertically: true,
    shouldCenterHorizontally: true,
  }

  catchLocationChange = false

  componentDidMount() {
    const {
      closeOnLocationChange,
      onLocationChange,
    } = this.props

    if (closeOnLocationChange) {
      let currentLocation = window.location.hash

      this.catchLocationChange = setInterval(() => {
        if (window.location.hash != currentLocation) {
          if (typeof onLocationChange === 'function') {
            if (onLocationChange(window.location.hash)) {
              currentLocation = window.location.hash
            } else {
              clearInterval(this.catchLocationChange)
              this.close(null, true)
            }
          } else {
            clearInterval(this.catchLocationChange)
            this.close(null,true)
          }
        }
      }, 500)
    }
    
  }

  componentWillUnmount() {
    clearInterval( this.catchLocationChange )
  }

  close = (event, isLocationChange) => {
    const { name, data, onClose, disableClose } = this.props

    if (name === 'OfferModal') {
      // actions.analytics.dataEvent('orderbook-addoffer-click-exit-button')
    }

    if (!disableClose) {
      actions.modals.close(name)

      if (typeof onClose === 'function') {
        onClose(isLocationChange)
      }

      if (typeof data.onClose === 'function') {
        data.onClose(isLocationChange)
      }
    }
  }

  render() {
    const { className, whiteLogo, showLogo, title, showCloseButton, disableClose, children,
      titleUppercase, name, shouldCenterHorizontally, shouldCenterVertically, styleName, delayClose, data } = this.props

    window.addEventListener('popstate', function (e) { actions.modals.close(name) }) // eslint-disable-line

    const titleStyleName = cx('title', {
      'uppercase': titleUppercase,
    })

    return (
      <Overlay styleName={styleName}>
        <div styleName="modal" className={className}>
          {
            Boolean(title || showCloseButton) && (
              <div styleName="header">
                <WidthContainer styleName="headerContent">
                  {
                    showLogo && <Logo withLink isColored={!whiteLogo} />
                  }
                  <div styleName={titleStyleName} role="title">{title}</div>
                  {
                    showCloseButton && !disableClose && (
                      <CloseIcon styleName={`closeButton${delayClose ? ' delayClose' : ''}`} onClick={this.close} data-testid="modalCloseIcon" />
                    )
                  }
                </WidthContainer>
              </div>
            )
          }
          <div styleName="contentContainer">
            <Center scrollable centerHorizontally={shouldCenterHorizontally} centerVertically={shouldCenterVertically}>
              <div styleName="content">
                {children}
              </div>
            </Center>
          </div>
        </div>
      </Overlay>
    )
  }
}
