import React, { Component } from 'react'

import actions from 'redux/actions'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './ModalBox.scss'

import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'



const isDark = localStorage.getItem(constants.localStorage.isDark)
@cssModules(styles, { allowMultiple: true })
export default class ModalBox extends Component<any, any> {

  props: any

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
      <div styleName={`modal-box ${isDark ? 'dark' : ''}`}>
        <div styleName="header">
          {/*
          //@ts-ignore */}
          <WidthContainer styleName="headerContent">
            <div styleName="title">{title}</div>
            {/*
            //@ts-ignore */}
            <CloseIcon styleName="closeButton" onClick={onClose} />
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
