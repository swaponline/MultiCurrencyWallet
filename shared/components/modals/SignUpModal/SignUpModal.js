import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment/moment'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { request } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './SignUpModal.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'


const title = defineMessages({
  signUpModal: {
    id: 'SignUpModal55',
    defaultMessage: 'Sign up',
  },
})

@connect(
  ({
    user: { ethData, btcData },
    signUp: { isSigned },
  }) => ({
    ethAddress: ethData.address,
    btcAddress: btcData.address,
    isSigned,
  })
)
@injectIntl
@cssModules(styles)
export default class SignUpModal extends React.Component {

  static propTypes = {
    name: PropTypes.string,
  }

  state = {
    isSubmited: false,
  }

  componentDidMount() {
    actions.analytics.dataEvent('sign up')
  }

  handleSubmit = async () => {
    const { name, ethAddress, btcAddress } = this.props
    const gaTracker = actions.analytics.getTracker()
    const ipInfo = await actions.firebase.getIPInfo()
    const date = moment().format('DD-MM-YYYY')
    const data = {
      ...ipInfo,
      date,
      ethAddress,
      btcAddress,
      gaID: gaTracker !== undefined ? gaTracker.get('clientId') : 'None',
    }

    this.setState(() => ({ isSubmited: true }))

    const result = await actions.firebase.signUp(data)

    this.setState(() => ({ isSubmited: result }))
  }

  close = () => {
    const { name, data } = this.props

    actions.modals.close(name)
    if (typeof data.onClose === 'function') {
      data.onClose()
    }
  }

  render() {
    const { isSubmited } = this.state
    const { name, intl, data, isSigned } = this.props

    return (
      <Modal name={name} title={intl.formatMessage(title.signUpModal)} disableClose={!isSigned} data={data}>
        {
          isSigned ? (
            <Fragment>
              <p styleName="thanks">
                <FormattedMessage id="SignUpModal000" values={{ br: <br />  }} defaultMessage="Thanks!{br}You will receive a notification" />
              </p>
              <Button styleName="button" brand fullWidth onClick={this.close}>
                <FormattedMessage id="SignUpModal001" defaultMessage="Go to my wallet" />
              </Button>
            </Fragment>
          ) : (
            <Fragment>
              <Button styleName="button" brand fullWidth disabled={isSubmited} onClick={this.handleSubmit}>
                {
                  isSubmited ? (
                    <FormattedMessage id="SignUpModal002" defaultMessage="Wait please" />
                  ) : (
                    <FormattedMessage id="SignUpModal003" defaultMessage="Allow notifications" />
                  )
                }
              </Button>
              <p styleName="button-info">
                <FormattedMessage
                  id="SignUpModal004"
                  values={{ br: <br />  }}
                  defaultMessage="You will receive notifications regarding updates with your account (orders, transactions){br}and monthly updates about our project" />
              </p>
              {
                !isSubmited && (
                  <div styleName="cancel-wrapper">
                    <Button styleName="cancel" onClick={this.close}>
                      <FormattedMessage id="SignUpModal005" defaultMessage="No, thanks" />
                    </Button>
                  </div>
                )
              }
            </Fragment>
          )
        }
      </Modal>
    )
  }
}
