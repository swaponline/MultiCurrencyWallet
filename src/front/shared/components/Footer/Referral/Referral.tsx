import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './Referral.scss'
import { FormattedMessage } from 'react-intl'
import CopyToClipboard from 'react-copy-to-clipboard'


const Referral = (props) => {
  const myRefLink = `https://swaponline.io/?promo=${props.address}`

  return (
    <div>
      <span styleName="myLink">{`${myRefLink}`}</span>
      &nbsp;&nbsp;
      <CopyToClipboard text={myRefLink} data-tut="reactour__eth_promo_address">
        <i className="far fa-copy" data-tip data-for="Copy" style={{ width: '14px' }} />
      </CopyToClipboard>
      <br />
      <br />
      <FormattedMessage
        id="ReferralLinks1" // eslint-disable-next-line
        defaultMessage="Share the link above!  Each user who visits swap through the above referral link will get up to 10 SWAP tokens.  What’s in it for you?  Each time one of those users makes a successful swap (including operations with bonus tokens), you’ll earn SWAP tokens too!"
      />{` `}
      <a
        href="https://wiki.swaponline.io/affiliate-limits/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FormattedMessage
          id="ReferralLinks2" // eslint-disable-next-line
          defaultMessage="Limits and conditions"
        />
      </a>
    </div>
  )
}

export default CSSModules(Referral, styles)
