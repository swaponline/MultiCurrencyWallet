import React, { Component, Fragment } from 'react'

import styles from './FailControler.scss'
import cssModules from 'react-css-modules'

import CopyToClipboard from 'react-copy-to-clipboard'
import { FormattedMessage } from 'react-intl'
import { BigNumber } from 'bignumber.js'

import Button from 'components/controls/Button/Button'
import Timer from 'components/Timer/Timer'

import config from 'app-config'


const isWidgetBuild = config && config.isWidget

@cssModules(styles)
export default class FailControler extends Component {
  render() {
    const { ethAddress, message } = this.props

    return (
      <div styleName="main">
        <CopyToClipboard text={ethAddress}>
          <div>
            <div styleName="warning">
              <i className="fas fa-exclamation-triangle" />
            </div>
            <Fragment>
              <h3 styleName="failHeading">
                <FormattedMessage
                  id="FailControler68"
                  defaultMessage="Error in the execution of the token contract!{br}{br}Perhaps there is an additional commission on the contract side or the error occured for another reason{br}{br}{message}"
                  values={{
                    br: <br />,
                    message: message,
                  }}
                />
              </h3>
            </Fragment>
          </div>
        </CopyToClipboard>
      </div>
    )
  }
}
