import React, { Component } from 'react'
import actions from 'redux/actions'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './Modal.scss'

import ModalContainer from 'components/modal/ModalContainer/ModalContainer'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'


@cssModules(styles, { allowMultiple: true })
export default class Modal extends Component {

  static propTypes = {
    children: PropTypes.node,
    name: PropTypes.string.isRequired,
    id: PropTypes.string,
    title: PropTypes.any,
    className: PropTypes.string,
    showCloseButton: PropTypes.bool,
    data: PropTypes.object,
    fullWidth: PropTypes.bool,
    disableClose: PropTypes.bool,
    disableCloseOverlay: PropTypes.bool,
    titleUppercase: PropTypes.bool,
    onClose: PropTypes.func,
    onClick: PropTypes.func,
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
    const { name, className, onClick, title, showCloseButton, fullWidth,
      disableCloseOverlay, disableClose, children, id, titleUppercase } = this.props

    const titleStyleName = cx('title', {
      'uppercase': titleUppercase,
    })

    return (
      <ModalContainer
        name={name}
        fullWidth={fullWidth}
        disableClose={disableCloseOverlay}
        onClose={this.close}
      >
        <div styleName="modal" className={className} onClick={onClick} id={id}>
          {
            Boolean(title || showCloseButton) && (
              <div styleName="header">
                {
                  showCloseButton && !disableClose && (
                    <CloseIcon styleName="closeButton" onClick={this.close} data-testid="modalCloseIcon" />
                  )
                }
                <div styleName={titleStyleName}>{title}</div>
              </div>
            )
          }
          <div styleName="content">
            {children}
          </div>
        </div>
      </ModalContainer>
    )
  }
}
