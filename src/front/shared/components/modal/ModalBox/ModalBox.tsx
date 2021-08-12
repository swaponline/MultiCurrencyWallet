import React, { Component } from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './ModalBox.scss'

import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'

@cssModules(styles, { allowMultiple: true })
export default class ModalBox extends Component<any, any> {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.any,
    onClose: PropTypes.func,
    whiteLogo: PropTypes.bool,
    showLogo: PropTypes.bool,
  }

  static defaultProps = {
    showLogo: true,
  }

  render() {
    const {
      title,
      children,
      onClose,
    } = this.props


    return (
      <div styleName="modal-box">
        <div styleName="header">
          {/*
          //@ts-ignore */}
          <WidthContainer styleName="headerContent">
            <div styleName="title">{title}</div>

            <CloseIcon id="modalCloseButton" styleName="closeButton" onClick={onClose} />
          </WidthContainer>
        </div>
        <div styleName="contentContainer">
          <div styleName="content">
            {children}
          </div>
        </div>
      </div>
    )
  }
}
