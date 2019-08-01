import React from 'react'
import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './styles.scss'

/* eslint-disable */
const Quote = ({}) => {
  const href = "https://blog.qtum.org/atomic-cross-chain-swap-on-qtum-7e756a890ed7"
  return (
  <div className="container" style={{ paddingBottom: "60px" }}>
    <div styleName="header">
      &#34;
      <FormattedMessage
        id="Quote"
        defaultMessage="The swap.online project realizes swaps among Bitcoin-like, Ethereum-like, and EOS cryptocurrencies, and made a product for users to execute swaps"
      />
      &#34;
    </div>
    <b>
      <a href={href} title={href} target="_blank" rel="noopener noreferrer" styleName="href">
        — QTUM official Atomic Swap research
        <span styleName="orange">https://blog.qtum.org/atomic-cross-chain-swap-on-qtum-7e756a890ed7</span>
      </a>
    </b>
  </div>
)}
/* eslint-enable */

export default CSSModules(Quote, styles, { allowMultiple: true })
