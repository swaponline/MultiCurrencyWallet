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
    const { swap, flow } = this.props

    return (
      <div styleName="stepList">
        {
          this.props.flow.step >= 1 ? (
            <div styleName={flow.step >= 1 && flow.step < 2 ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{flow.step >= 1 && flow.step < 2 ? '1' : <i className="fas fa-check" />}</span>
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
          flow.step >= 2 || (flow.step > 2 && flow.step <= 8) ? (
            <div style={{ paddingTop: isMobile ? '50px' : '' }} styleName={flow.step >= 2 && flow.step < 4  ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{flow.step >= 2 && flow.step < 4 ? '2' : <i className="fas fa-check" />}</span>
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
          this.props.flow.step >= 5 ? (
            <div style={{ paddingTop: isMobile ? '100px' : '' }} styleName={flow.step >= 4 && flow.step < 6 ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{flow.step >= 4 && flow.step < 6 ? '3' : <i className="fas fa-check" />}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken80"
                  defaultMessage="{name} deposition"
                  values={{ name: swap.sellCurrency === 'BTC' ? swap.buyCurrency : swap.sellCurrency }}
                />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">{3}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken89"
                  defaultMessage="{name} deposition"
                  values={{ name: swap.sellCurrency === 'BTC' ? swap.buyCurrency : swap.sellCurrency }}
                />
              </p>
            </div>
          )
        }

        {
          this.props.flow.step >= 6 ? (
            <div style={{ paddingTop: isMobile ? '150px' : '' }} styleName={flow.step >= 6 && flow.step < 7 ? 'stepItem active' : 'stepItem active checked'}>
              <span styleName="stepNumber">{flow.step >= 6 && flow.step < 7 ? '4' : <i className="fas fa-check" />}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken102"
                  defaultMessage="Withdrawing {name} from a contract"
                  values={{ name: swap.sellCurrency === 'BTC' ? swap.buyCurrency : swap.sellCurrency }}
                />
              </p>
            </div>
          ) : (
            <div styleName="stepItem">
              <span styleName="stepNumber">{4}</span>
              <p styleName="stepText">
                <FormattedMessage
                  id="BtcToEthToken111"
                  defaultMessage="Withdrawing {name} from a contract"
                  values={{ name: swap.sellCurrency === 'BTC' ? swap.buyCurrency : swap.sellCurrency }}
                />
              </p>
            </div>
          )
        }
        {
          this.props.flow.step >= 7 ? (
            <div style={{ paddingTop: isMobile ? '200px' : '' }} styleName={this.props.flow.step >= 7 ? 'stepItem active checked' : ''}>
              <span styleName="stepNumber">{this.props.flow.step >= 7 ? <i className="fas fa-check" /> : ''}</span>
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
