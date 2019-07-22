import React from 'react'

import styles from './GetIeo.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'
import actions from 'redux/actions'
import { constants, links } from 'helpers'


const handleSignUp = () => {
  actions.modals.open(constants.modals.SignUp, {})
}

const GetIeo = () => (
  <div styleName="container">
    <div styleName="text">
      <h2>
        <span styleName="title"><FormattedMessage id="getIeo13" defaultMessage="Why Swap.Online?" /></span>
        <FormattedMessage
          id="getIeo13"
          defaultMessage="Create accaunt for get advantage{br} at the start + free SWAP token{br} for test our product (can be exchanged to bitcoin)"
          values={{ br: <br /> }} />
      </h2>
    </div>
    <div styleName="btnGroup">
      <div>
        <button styleName="button dark" onClick={handleSignUp}>
          <FormattedMessage id="getIeo22" defaultMessage="Get Started" />
        </button>
        <button styleName="button light">
          <a href="https://wiki.swap.online/en.pdf" target="_blank" rel="noopener noreferrer">
            <FormattedMessage id="getIeo25" defaultMessage="Read WhitePaper" />
          </a>
        </button>
      </div>
    </div>
  </div>
)

export default CSSModules(GetIeo, styles, { allowMultiple: true })
