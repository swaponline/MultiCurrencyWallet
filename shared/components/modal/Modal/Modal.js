import React, { Component } from 'react'
import ClickOutside from 'react-click-outside'

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

  close = () => {
    const { name, data, onClose, disableClose } = this.props

    if (name === 'OfferModal') {
      actions.analytics.dataEvent('orderbook-addoffer-click-exit-button')
    }

    if (!disableClose) {
      actions.modals.close(name)

      if (typeof onClose === 'function') {
        onClose()
      }

      if (typeof data.onClose === 'function') {
        data.onClose()
      }
    }
  }

  render() {
    const {
      className,
      whiteLogo,
      showLogo,
      title,
      showCloseButton,
      disableClose,
      children,
      titleUppercase,
      name,
      shouldCenterHorizontally,
      shouldCenterVertically,
    } = this.props

    const titleStyleName = cx('title', {
      'uppercase': titleUppercase,
    })

    return (
      <ClickOutside onClickOutside={() => {
        actions.modals.close(name)
      }}>
        <Overlay>
          <div styleName="modal" className={className}>
            {
              Boolean(title || showCloseButton) && (
                <div styleName="header">
                  <WidthContainer styleName="headerContent">
                    {
                      showLogo &&
                      <Logo colored={!whiteLogo} />
                    }
                    <div styleName={titleStyleName} role="title">{title}</div>
                    {
                      showCloseButton && !disableClose && (
                        <CloseIcon styleName="closeButton" onClick={this.close} data-testid="modalCloseIcon" />
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
      </ClickOutside>
    )
  }
}
