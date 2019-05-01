/* eslint-disable max-len */
import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './Referral.scss'
import { FormattedMessage } from 'react-intl'
import CopyToClipboard from 'react-copy-to-clipboard'


const Referral = (props) => {
  const myRefLink = `https://Atomicswapwallet.io/?promo=${props.address}`

  return (
    <div styleName="Referral">
      {/* <span styleName="myLink">{`${myRefLink}`}</span>
      &nbsp;&nbsp;
      <CopyToClipboard text={myRefLink} data-tut="reactour__eth_promo_address">
        <i className="far fa-copy" data-tip data-for="Copy" style={{ width: '14px' }} />
      </CopyToClipboard>
      <br />
      <br />
      <FormattedMessage
        id="ReferralLinks1" // eslint-disable-next-line
        defaultMessage="Share or send link on this page: every user who comes via your referral link gets up to 10 SWAP tokens. Moreover, you will earn SWAP tokens for every his ir her succesful swap (including operations with bonus tokens!)"
      /> */}
    </div>
  )
}

export default CSSModules(Referral, styles)
