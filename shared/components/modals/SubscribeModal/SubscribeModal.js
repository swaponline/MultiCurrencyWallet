import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './SubscribeModal.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'


const title = defineMessages({
  subscribeModal: {
    id: 'Subscribe55',
    defaultMessage: 'Subscribe',
  },
})

@connect(
  ({
    user: { ethData, btcData },
  }) => ({
    ethAddress: ethData.address,
    btcAddress: btcData.address,
  })
)
@injectIntl
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

    const result = await actions.firebase.subscribe({
      ethAddress,
      btcAddress,
      gaID: gaTracker !== undefined ? gaTracker.get('clientId') : 'None',
    })

    this.setState(() => ({ isSubscribed: result }))
  }

  render() {
    const { isSubscribed, isSubmited } = this.state
    const { name, intl } = this.props

    return (
      <Modal name={name} title={intl.formatMessage(title.subscribeModal)}>
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
