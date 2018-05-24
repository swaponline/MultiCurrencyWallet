import React, { Component } from 'react'
import actions from 'redux/actions'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './Modal.scss'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import Overlay from 'components/layout/Overlay/Overlay'
import Logo from 'components/Logo/Logo'
import Center from 'components/layout/Center/Center'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'


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
  }

  static defaultProps = {
    data: {},
    showCloseButton: true,
    fullWidth: false,
    disableClose: false,
    disableCloseOverlay: false,
    uppercase: false,
  }

  close = () => {
    const { name, data, onClose, disableClose } = this.props

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
    const { title, showCloseButton, disableClose, children, titleUppercase } = this.props

    const titleStyleName = cx('title', {
      'uppercase': titleUppercase,
    })

    return (
      <Overlay>
        <div styleName="modal">
          {
            Boolean(title || showCloseButton) && (
              <div styleName="header">
                <WidthContainer styleName="headerContent">
                  <Logo colored />
                  <div styleName={titleStyleName}>{title}</div>
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
            <Center scrollable>
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
