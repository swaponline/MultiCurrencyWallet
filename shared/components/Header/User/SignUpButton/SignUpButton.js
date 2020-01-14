import React, { Fragment } from 'react'

import actions from 'redux/actions'
import { constants, links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SignUpButton.scss'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'
import { getSiteData } from 'helpers'


const handleSignUp = () => {
  actions.modals.open(constants.modals.SignUp, {})
}

const projectName = () => getSiteData().projectName

const SignUpButton = ({ mobile }) => (
  <div styleName={mobile ? 'mobile' : ''}>
    {
      process.env.TESTNET ? (
        <Fragment>
          <a href={links.main} target="_blank" rel="noreferrer noopener" styleName="button" data-tip data-for="main">
            <FormattedMessage id="ADDoffer2218" defaultMessage="Mainnet" />
          </a>
          <ReactTooltip id="main" type="light" effect="solid">
            <span>
              <FormattedMessage id="ADDoffer22" defaultMessage="Start to real Swap" />
            </span>
          </ReactTooltip>
        </Fragment>
      ) :
        (
          <Fragment>
            <button styleName="button" className="data-tut-sign-up" onClick={handleSignUp} /* eslint-disable-line */ data-tip data-for="sign-up" >
              <FormattedMessage id="ADDoffer29" defaultMessage="Sign up (get up to 10$ bonus)" />
            </button>
            <ReactTooltip id="sign-up" type="light" effect="solid">
              <span>
                <FormattedMessage
                  id="ADDoffer33"
                  defaultMessage="Get subscribed for the {project} news"
                  values={{
                    project: projectName(),
                  }} />
              </span>
            </ReactTooltip>
          </Fragment>
        )
    }
  </div>
)

export default CSSModules(SignUpButton, styles)
