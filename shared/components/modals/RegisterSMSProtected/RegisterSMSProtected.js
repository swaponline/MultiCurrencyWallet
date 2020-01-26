import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'

import typeforce from 'swap.app/util/typeforce'
// import { isCoinAddress } from 'swap.app/util/typeforce'
import minAmount from 'helpers/constants/minAmount'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'


@injectIntl
@connect(
  ({
    user: { btcMultisigSMSData },
  }) => ({
    items: [btcMultisigSMSData],
  })
)
@cssModules(styles, { allowMultiple: true })
export default class RegisterSMSProtected extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor() {
    super()



    this.state = {
      phone: '',
      step: 'enterPhone',
      error: false,
      smsCode: '',
      smsConfirmed: false,
      isShipped: false,
    }
  }

  handleSendSMS = async () => {
    this.setState({ isShipped: true, error: false })
    const result = await actions.btcmultisig.beginRegisterSMS(this.state.phone)
    console.log(result)
    if (result && result.answer && result.answer == 'ok') {
      this.setState({ isShipped: false, step: 'enterCode' })
    } else {
      this.setState({ isShipped: false, error: (result.error) ? result.error : 'Unknown error' })
    }
  }

  handleCheckSMS = async () => {
    this.setState({ isShipped: true, error: false })
    const result = await actions.btcmultisig.confirmRegisterSMS(this.state.phone, this.state.smsCode)

    if (result && result.answer && result.answer == 'ok') {
      this.setState({ isShipped: false, step: 'ready' })
    } else {
      if (result.error == 'Already registered') {
        this.setState({ isShipped: false, step: 'ready' })
      } else {
        this.setState({ isShipped: false, error: (result.error) ? result.error : 'Unknown error' })
      }
    }
  }

  handleFinish = async () => {
    const { name } = this.props

    actions.btcmultisig.enableWalletSMS()
    actions.modals.close(name)
    if (this.props.data.callback) {
      this.props.data.callback()
    }
  }

  render() {
    const { phone, step, error, smsCode, smsConfirmed, isShipped } = this.state
    const { name, intl } = this.props

    const linked = Link.all(this, 'phone', 'smsCode')

    const title = defineMessages({
      registerSMSModal: {
        id: 'registerSMSProtectedTitle',
        defaultMessage: `Activate SMS Protected Wallet`,
      },
    })

    return (
      <Modal name={name} title={`${intl.formatMessage(title.registerSMSModal)}`}>
        {(step === 'enterPhone') &&
          <Fragment>
            <div styleName="highLevel">
              <label styleName="label">Your phone:</label>
              <span style={{ marginBottom: '20px' }} >
                <Input styleName="input inputMargin25" valueLink={linked.phone} placeholder={`Enter your phone`} focusOnInit />
              </span>
              {error &&
                <div styleName="rednote">
                  `${error}`
                </div>
              }
            </div>
            <Button styleName="button" blue fullWidth disabled={isShipped} onClick={this.handleSendSMS}>
              {isShipped
                ? (
                  <Fragment>
                    <FormattedMessage id="registerSMSModalProcess" defaultMessage="Processing ..." />
                  </Fragment>
                )
                : (
                  <Fragment>
                    <FormattedMessage id="registerSMSModalSendSMS" defaultMessage="Send SMS" />
                  </Fragment>
                )
              }
            </Button>
          </Fragment>
        }
        {(step === 'enterCode') &&
          <Fragment>
            <div styleName="highLevel">
              <label styleName="label">Enter code from SMS:</label>
              <Input styleName="input inputMargin25" valueLink={linked.smsCode} focusOnInit placeholder={`Enter code from SMS`} />
              {error &&
                <div styleName="rednote">
                  {error}
                </div>
              }
            </div>
            <Button styleName="button" blue fullWidth disabled={isShipped} onClick={this.handleCheckSMS}>
              {isShipped
                ? (
                  <Fragment>
                    <FormattedMessage id="registerSMSModalProcess" defaultMessage="Processing ..." />
                  </Fragment>
                )
                : (
                  <Fragment>
                    <FormattedMessage id="registerSMSModalSendSMS165" defaultMessage="Confirm" />
                  </Fragment>
                )
              }
            </Button>
          </Fragment>
        }
        {(step === 'ready') &&
          <Fragment>
            <div styleName="highLevel">
              <FieldLabel inRow>
                <span style={{ fontSize: '16px' }}>
                  <FormattedMessage id="registerSMSModalReady" defaultMessage="Your protected wallet activated" />
                </span>
              </FieldLabel>
            </div>
            <Button styleName="buttonFull" brand fullWidth onClick={this.handleFinish}>
              <Fragment>
                <FormattedMessage id="registerSMSModalFinish" defaultMessage="Finish" />
              </Fragment>
            </Button>
          </Fragment>
        }
      </Modal>
    )
  }
}
