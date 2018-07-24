import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Input as ValueLinkInput } from 'sw-valuelink'
import cx from 'classnames'
import { ignoreProps } from 'helpers'

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

  render() {
    const {
      className, inputContainerClassName, inputClassName,
      valueLink: { error }, valueLink,
      multiline, focusOnInit, disabled, readOnly, type, ...rest
    } = this.props

    const inputContainerStyleName = cx('inputContainer', {
      'withError': error,
    })

    return (
      <div styleName="root" className={className}>
        <div styleName={inputContainerStyleName} className={inputContainerClassName}>
          {
            React.createElement(multiline ? TextArea : ValueLinkInput, {
              ...ignoreProps(rest, 'styles'),
              styleName: 'input',
              className: inputClassName,
              valueLink,
              type,
              disabled: disabled || readOnly,
              autoFocus: !!focusOnInit,
              dir: 'auto',
              autoComplete: 'off',
            })
          }
        </div>
        {
          Boolean(error) && (
            <div styleName="error">
              {error}
            </div>
          )
        }
      </div>
    )
  }
}
