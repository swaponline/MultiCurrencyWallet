import React from 'react'

import styles from './GetIeo.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'
import actions from 'redux/actions'
import { constants, links } from 'helpers'


const handleSignUp = () => {
  actions.modals.open(constants.modals.SignUp, {})
}

const href =
  (<a href="https://swap.online/exchange/swap-to-btc" target="_blank" rel="noopener noreferrer">
    <FormattedMessage id="getIeo17" defaultMessage="Exchange SWAP token to BTC through our service" />
  </a>)// eslint-disable-line

const GetIeo = () => (
  <div styleName="container">
    <div styleName="text">
      <h2>
        <span styleName="title"><FormattedMessage id="getIeo13" defaultMessage="Be one of the first users." /></span>
        <FormattedMessage
          id="getIeo21"
          defaultMessage="We will reward all users with our native {br}SWAP tokens that can be exchanged to BTC on our platform.{br} "
          values={{
            br: <br />,
          }}
        />
        <span styleName="steps">
          <FormattedMessage
            id="getIeo29"
            defaultMessage="1. Click {bold}; 2. Allow push notifications{br} 3. Wait 5-10 min; 4. {href}"
            values={{
              br: <br />,
              bold: <b onClick={handleSignUp}>Get started </b>,
              href,
            }}
          />
        </span>
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
