import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './ModalContainer.scss'

import Overlay from 'components/layout/Overlay/Overlay'
import Center from 'components/layout/Center/Center'


@cssModules(styles, { allowMultiple: true })
export default class ModalContainer extends Component<any, any> {

  static propTypes = {
    children: PropTypes.any.isRequired,
    fullWidth: PropTypes.bool,
    disableClose: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
  }

  handleMount = (el) => {
    if (el) {
      setTimeout(() => {
        el.classList.add(styles.mounted)
      }, 0)
    }
  }

  close = () => {
    const { disableClose, onClose } = this.props

    if (!disableClose) {
      onClose()
    }
  }

  render() {
    const { children, fullWidth } = this.props

    // TODO move overflow to Modal from Center
    const modalContainerStyleName = cx('modalContainer', {
      'fullWidth': fullWidth,
    })

    return (
      //@ts-ignore 
      <Overlay>
        {/*
        //@ts-ignore */}
        <Center scrollable>
          <div
            styleName={modalContainerStyleName}
            ref={this.handleMount}
          >
            {children}
          </div>
        </Center>
      </Overlay>
    )
  }
}
