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

  constructor({ flow, step, swap, styles }) {
    super()

    this.swap = swap

    this.state = {
      swap,
      flow: this.swap.flow.state,
    }
  }

  componentDidMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  handleFlowStateUpdate = (values) => {
    this.setState({
      flow: values,
    })
  }

  render() {
    const { data: { step }, sellCurrency, buyCurrency } = this.props
    const { flow, swap } = this.state

    return (
      <div styleName="stepList">
        {
          this.state.flow.step >= 1 ? (
            <div styleName={this.state.flow.step === 1 ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{this.state.flow.step === 1 ? '1' : <i className="fas fa-check" />}</span>
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
          this.state.flow.step >= 2 || (this.state.flow.step > 2 && this.state.flow.step <= 8) ? (
            <div style={{ paddingTop: isMobile ? '50px' : '' }} styleName={this.state.flow.step >= 2 && this.state.flow.step < 5  ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{this.state.flow.step >= 2 && this.state.flow.step < 5 ? '2' : <i className="fas fa-check" />}</span>
              <p styleName="stepText">
                <FormattedMessage id="swapList97" defaultMessage="{Currency} deposition" values={{ Currency: sellCurrency === 'BTC' ? sellCurrency : buyCurrency }} />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">{2}</span>
              <p styleName="stepText">
                <FormattedMessage id="swapList97" defaultMessage="{Currency} deposition" values={{ Currency: sellCurrency === 'BTC' ? sellCurrency : buyCurrency }} />
              </p>
            </div>
          )
        }

        {
          this.state.flow.step >= 5 ? (
            <div style={{ paddingTop: isMobile ? '100px' : '' }} styleName={this.state.flow.step === 5 ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{this.state.flow.step === 5 ? '3' : <i className="fas fa-check" />}</span>
              <p styleName="stepText">
                <FormattedMessage id="swapList97" defaultMessage="{Currency} deposition" values={{ Currency: sellCurrency === 'BTC' ? buyCurrency : sellCurrency }} />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">{3}</span>
              <p styleName="stepText">
                <FormattedMessage id="swapList97" defaultMessage="{Currency} deposition" values={{ Currency: sellCurrency === 'BTC' ? buyCurrency : sellCurrency }} />
              </p>
            </div>
          )
        }

        {
          this.state.flow.step >= 6 ? (
            <div style={{ paddingTop: isMobile ? '150px' : '' }} styleName={this.state.flow.step === 6 ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{this.state.flow.step === 6 ? '4' : <i className="fas fa-check" />}</span>
              <p styleName="stepText">
                <FormattedMessage id="BtcToEthToken102" defaultMessage="Withdrawing {Currency} from a contract" values={{ Currency: buyCurrency }} />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">{4}</span>
              <p styleName="stepText">
                <FormattedMessage id="BtcToEthToken111" defaultMessage="Withdrawing {Currency} from a contract" values={{ Currency: buyCurrency }} />
              </p>
            </div>
          )
        }
        {
          this.state.flow.step >= 7 ? (
            <div style={{ paddingTop: isMobile ? '200px' : '' }} styleName={this.state.flow.step >= 7 ? 'stepItem active checked' : ''}>
              <span styleName="stepNumber">{this.state.flow.step >= 7 ? <i className="fas fa-check" /> : ''}</span>
              <p styleName="stepText">
                <FormattedMessage id="BtcToEthToken123" defaultMessage="Finished!" />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">{5}</span>
              <p styleName="stepText">
                <FormattedMessage id="BtcToEthToken132" defaultMessage="Finished!" />
              </p>
            </div>
          )
        }
      </div>
    )
  }
}
