import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Input as ValueLinkInput } from 'sw-valuelink'
import cx from 'classnames'
import { ignoreProps } from 'helpers'
import reducers from 'redux/core/reducers'
import { isMobile } from 'react-device-detect'

import cssModules from 'react-css-modules'
import styles from './Input.scss'

import TextArea from 'components/forms/TextArea/TextArea'


@cssModules(styles, { allowMultiple: true })
export default class Input extends Component {

  static propTypes = {
    className: PropTypes.string,
    rootClassName: PropTypes.string,
    inputClassName: PropTypes.string,
    placeholder: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    type: PropTypes.string,
    valueLink: PropTypes.object.isRequired,
    focusOnInit: PropTypes.bool,
    multiline: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    icon: PropTypes.bool,
    intl: PropTypes.object,
  }

  static defaultProps = {
    focusOnInit: false,
    multiline: false,
    disabled: false,
    readOnly: false,
    required: false,
    type: 'text',
  }

  handleFocus = () => {
    const { onFocus } = this.props

    if (onFocus) {
      onFocus()
    }
    reducers.inputActive.setInputActive(true)
  }

  handleBlur = () => {
    const { onBlur } = this.props

    if (onBlur) {
      onBlur()
    }
    reducers.inputActive.setInputActive(false)
  }

  render() {
    const {
      className, inputContainerClassName, inputClassName, errorStyle,
      valueLink: { error }, valueLink, dontDisplayError, inputCustomStyle,
      multiline, focusOnInit, disabled, readOnly, type, usd, ...rest
    } = this.props

    const inputContainerStyleName = cx('inputContainer', {
      'withError': error,
    })

    const focusEvent = !isMobile ? {} : {
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
    }

    return (
      <div styleName="root" className={className}>
        <div styleName={inputContainerStyleName} className={inputContainerClassName}>
          {
            React.createElement(multiline ? TextArea : ValueLinkInput, {
              ...ignoreProps(rest, 'styles'),
              styleName: errorStyle ? 'input inputError' : 'input',
              className: inputClassName,
              style: inputCustomStyle,
              valueLink,
              type,
              disabled: disabled || readOnly,
              autoFocus: !!focusOnInit,
              dir: 'auto',
              autoComplete: 'off',
              ...focusEvent,
            })
          }
          { usd > 0 &&
            <p styleName="textUsd" >{`~${usd}`}$</p>
          }
        </div>
        {
          Boolean(error && !dontDisplayError) && (
            <div styleName="error">
              {error}
            </div>
          )
        }
      </div>
    )
  }
}
