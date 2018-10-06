import React from 'react'
import PropTypes from 'prop-types'
import Link from 'sw-valuelink'
import cx from 'classnames'

import CSSModules from 'react-css-modules'
import styles from './Field2.scss'

import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'


@CSSModules(styles, { allowMultiple: true })
export default class Field2 extends React.Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    privateKey: PropTypes.string.isRequired,
    valueLink: PropTypes.object.isRequired,
  }

  state = {
    value: '',
    error: false,
    success: false,
  }

  handleCheck = () => {
    const { value, error, success } = this.state
    const { valueLink, privateKey } = this.props

    if (error || success) {
      return
    }

    if (value !== privateKey) {
      this.setState({
        error: true,
      })
    }
    else {
      valueLink.set(true)
      this.setState({
        success: true,
      })
    }
  }

  render() {
    const { error, success } = this.state
    const { label } = this.props

    const linkedValue = Link.state(this, 'value')

    return (
      <div styleName="container">
        <div styleName="section">
          <div styleName="label">{label.toUpperCase()}</div>
          <Input
            styleName={cx('input', { 'errorInput': error })}
            placeholder="Write private key here..."
            valueLink={linkedValue}
            disabled={error}
          />
          <Button
            styleName="button"
            white={!success}
            green={success}
            onClick={this.handleCheck}
          >
            {success ? 'OK' : 'Check'}
          </Button>
        </div>
        {
          error && (
            <React.Fragment>
              <i className="fas fa-times" styleName="errorIcon" />
              <div styleName="error">INVALID PRIVATE KEY! You should pass correct value! Reload page and enter key again</div>
            </React.Fragment>
          )
        }
      </div>
    )
  }
}
