import React from 'react'
import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './styles.scss'

import { getSiteData } from 'helpers'


/* eslint-disable */
const Quote = ({ }) => {
  const href = "https://blog.qtum.org/atomic-cross-chain-swap-on-qtum-7e756a890ed7"
  const { projectName } = getSiteData()

  return (
    <div styleName="container">
      <div styleName="header">
        &#34;
      <FormattedMessage
          id="Quote"
          defaultMessage="The {project} project realizes swaps among Bitcoin-like, Ethereum-like, and made a product for users to execute swaps"
          values={{
            project: projectName,
          }}
        />
        &#34;
    </div>
      <a href={href} title={href} target="_blank" rel="noopener noreferrer" styleName="href">
        <b>
          — QTUM official Atomic Swap research
        <span> https://blog.qtum.org/atomic-cross-chain-swap-on-qtum-7e756a890ed7</span>
        </b>
      </a>
    </div>
  )
}
/* eslint-enable */

export default CSSModules(Quote, styles, { allowMultiple: true })
