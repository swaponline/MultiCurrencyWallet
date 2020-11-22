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
        <span styleName="title"><FormattedMessage id="getIeo13" defaultMessage="Be one of the first users." /></span>
        <FormattedMessage
          id="getIeo21"
          defaultMessage="We will reward all users with our native {br}SWAP tokens that can be exchanged to BTC on our platform.{br} "
          values={{
            br: <br />,
          }}
        />
      </h2>
    </div>
    <div styleName="btnGroup">
      <div>
        <button styleName="button dark" onClick={handleSignUp}>
          <FormattedMessage id="getIeo22" defaultMessage="Get Started" />
        </button>
        <button styleName="button light">
          <a href="https://wiki.swaponline.io/en.pdf" target="_blank" rel="noopener noreferrer">
            <FormattedMessage id="getIeo25" defaultMessage="Read WhitePaper" />
          </a>
        </button>
      </div>
    </div>
  </div>
)

export default CSSModules(GetIeo, styles, { allowMultiple: true })
