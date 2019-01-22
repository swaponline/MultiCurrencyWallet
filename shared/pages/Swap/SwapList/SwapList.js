import React, { Component } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { links } from 'helpers'
import { isMobile } from 'react-device-detect'

import CSSModules from 'react-css-modules'
import styles from './SwapList.scss'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles, { allowMultiple: true })
export default class SwapList extends Component {

  static propTypes = {
    data: PropTypes.object,
  }

  static defaultProps = {
    data: {},
    whiteLogo: false,
  }

  render() {
    return (
      <div styleName="stepList">
        {
          this.props.data.step >= 1 ? (
            <div styleName={this.props.data.step >= 1 && this.props.data.step < 2 ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{this.props.data.step >= 1 && this.props.data.step < 2 ? '1' : <i className="fas fa-check" />}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken34"
                  defaultMessage="Confirmation processing" />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">
                {1}
              </span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken43"
                  defaultMessage="Confirmation processing" />
              </p>
            </div>
          )
        }

        {
          this.props.data.step >= 2 || (this.props.data.step > 2 && this.props.data.step <= 8) ? (
            <div style={{ paddingTop: isMobile ? '50px' : '' }} styleName={this.props.data.step >= 2 && this.props.data.step < 5  ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{this.props.data.step >= 2 && this.props.data.step < 5 ? '2' : <i className="fas fa-check" />}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken58"
                  defaultMessage="Bitcoin deposition" />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">{2}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken67"
                  defaultMessage="Bitcoin deposition" />
              </p>
            </div>
          )
        }

        {
          this.props.data.step >= 5 ? (
            <div style={{ paddingTop: isMobile ? '100px' : '' }} styleName={this.props.data.step >= 5 && this.props.data.step < 6 ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{this.props.data.step >= 5 && this.props.data.step < 6 ? '3' : <i className="fas fa-check" />}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken80"
                  defaultMessage="Swap tokens deposition" />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">{3}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken89"
                  defaultMessage="Swap tokens deposition" />
              </p>
            </div>
          )
        }

        {
          this.props.data.step >= 6 ? (
            <div style={{ paddingTop: isMobile ? '150px' : '' }} styleName={this.props.data.step >= 6 && this.props.data.step < 7 ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{this.props.data.step >= 6 && this.props.data.step < 7 ? '4' : <i className="fas fa-check" />}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken102"
                  defaultMessage="Withdrawing swap tokens from a contract" />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">{4}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken111"
                  defaultMessage="Withdrawing swap tokens from a contract" />
              </p>
            </div>
          )
        }
        {
          this.props.data.step >= 7 ? (
            <div style={{ paddingTop: isMobile ? '200px' : '' }} styleName={this.props.data.step >= 7 ? 'stepItem active checked' : ''}>
              <span styleName="stepNumber">{this.props.data.step >= 7 ? <i className="fas fa-check" /> : ''}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken123"
                  defaultMessage="Finished!" />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">{5}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken132"
                  defaultMessage="Finished!" />
              </p>
            </div>
          )
        }
      </div>
    )
  }
}
