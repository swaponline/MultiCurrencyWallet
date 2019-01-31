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

  render() {
    const { swap, flow } = this.props

    console.log(flow)

    return (
      <div styleName="stepList">
        <div styleName={((flow.step >= 1 && flow.step < 2) && 'stepItem active') || (flow.step < 2 && 'stepItem') || 'stepItem active checked'}>
          <span styleName="stepNumber">{flow.step < 2 ? 1 : <i className="fas fa-check" />}</span>
          <p styleName="stepText">
            <FormattedMessage
              id="BtcToEthToken34"
              defaultMessage="Confirmation processing" />
          </p>
        </div>

        <div styleName={((flow.step >= 2 && flow.step < 4) && 'stepItem active') || (flow.step < 4 && 'stepItem') || 'stepItem active checked'}>
          <span styleName="stepNumber">{((flow.step >= 2 && flow.step < 4) && 2) || (flow.step < 2 && 2) || <i className="fas fa-check" />}</span>
          <p styleName="stepText">
            <FormattedMessage
              id="BtcToEthToken58"
              defaultMessage="Bitcoin deposition" />
          </p>
        </div>
        <div styleName={((flow.step >= 5 && flow.step < 6) && 'stepItem active') || (flow.step < 6 && 'stepItem') || 'stepItem active checked'}>
          <span styleName="stepNumber">{flow.step < 6 ? 3 : <i className="fas fa-check" />}</span>
          <p styleName="stepText">
            <FormattedMessage
              id="BtcToEthToken80"
              defaultMessage="{name} deposition"
              values={{ name: swap.sellCurrency === 'BTC' ? swap.buyCurrency : swap.sellCurrency }}
            />
          </p>
        </div>
        <div styleName={((flow.step >= 6 && flow.step < 7) && 'stepItem active') || (flow.step < 7 && 'stepItem') || 'stepItem active checked'}>
          <span styleName="stepNumber">{flow.step < 7 ? 4 : <i className="fas fa-check" />}</span>
          <p styleName="stepText">
            <FormattedMessage
              id="BtcToEthToken102"
              defaultMessage="Withdrawing {name} from a contract"
              values={{ name: swap.sellCurrency === 'BTC' ? swap.buyCurrency : swap.sellCurrency }}
            />
          </p>
        </div>
        <div styleName={flow.step >= 7 ? 'stepItem active checked' : 'stepItem'}>
          <span styleName="stepNumber">{flow.step >= 7 ? <i className="fas fa-check" /> : 5}</span>
          <p styleName="stepText">
            <FormattedMessage
              id="BtcToEthToken123"
              defaultMessage="Finished!" />
          </p>
        </div>
      </div>
    )
  }
}
