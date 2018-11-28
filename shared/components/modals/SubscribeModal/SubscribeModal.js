import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './SubscribeModal.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import { FormattedMessage } from 'react-intl'


@connect(
  ({
    user: { ethData, btcData },
  }) => ({
    ethAddress: ethData.address,
    btcAddress: btcData.address,
  })
)
@cssModules(styles)
export default class SubscribeModal extends React.Component {

  static propTypes = {
    name: PropTypes.string,
  }

  state = {
    isSubscribed: false,
    isSubmited: false,
  }

  handleSubmit = async () => {
    const { name, ethAddress, btcAddress } = this.props
    const gaTracker = actions.analytics.getTracker()

    this.setState(() => ({ isSubmited: true }))

    const result = await actions.pushNotification.registrationFirebase({
      eth: ethAddress,
      btc: btcAddress,
      gaID: gaTracker !== undefined ? gaTracker.get('clientId') : 'None',
    })

    this.setState(() => ({ isSubscribed: result }))
  }

  render() {
    const { isSubscribed, isSubmited } = this.state
    const { name } = this.props

    return (
      <Modal name={name} title="Subscribe">
        {
          isSubscribed ? (
            <p styleName="thanks">
              <FormattedMessage id="SubscribeModal000" values={{ br: <br />  }} defaultMessage="Thanks!{br}When we send the token you will receive a notification" />
            </p>
          ) : (
            <div>
              <p styleName="title">
                <FormattedMessage id="SubscribeModal001" defaultMessage="Join whitelist and get 1 SWAP token" />
              </p>
              <Button styleName="button" brand fullWidth disabled={isSubmited} onClick={this.handleSubmit}>
                {
                  isSubmited ? (
                    <FormattedMessage id="SubscribeModal002" defaultMessage="Wait please" />
                  ) : (
                    <FormattedMessage id="SubscribeModal003" defaultMessage="Join whitelist" />
                  )
                }
              </Button>
              <p styleName="button-info">
                <FormattedMessage id="SubscribeModal004" defaultMessage="click on this button to allow push notifications" />
              </p>
            </div>
          )
        }
      </Modal>
    )
  }
}
