import React, { Fragment } from 'react'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FieldLabel, Input } from 'components/forms'

import Link from 'sw-valuelink'

import config from 'app-config'
import actions from 'redux/actions'
import { constants, eos } from 'helpers'
import { getState } from 'redux/core'

import cssModules from 'react-css-modules'
import styles from './EosBuyAccountModal.scss'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'


const title = defineMessages({
  titleEosBuy: {
    id: 'Eos87',
    defaultMessage: 'EOS Register',
  },
})

@injectIntl
@cssModules(styles)
export default class EosBuyAccountModal extends React.Component {

  state = {
    activePrivateKey: '',
    activePublicKey: '',
    accountName: '',
    price: '',
    error: '',
  }

  async componentDidMount() {
    const {
      user: {
        eosData: {
          activePrivateKey,
          activePublicKey,
          address: accountName,
        },
      },
    } = getState()

    const { buyAccountPriceInBTC: price } = config.api.eos

    this.setState({ activePrivateKey, activePublicKey, accountName, price })
  }

  handleSubmit = async () => {
    actions.loader.show(true)

    try {
      await actions.eos.buyAccount()

      actions.modals.close(constants.modals.EosBuyAccount)
    } catch (e) {
      console.error(e)
      this.setState({ error: e.toString() })
    }

    actions.loader.hide()
  }

  render() {
    const { error, activePrivateKey, activePublicKey, accountName, price } = this.state
    const { name, intl } = this.props

    const linked = Link.all(this, 'accountName', 'activePrivateKey', 'activePublicKey', 'price')
    const activationPayment = localStorage.getItem(constants.localStorage.eosActivationPayment)

    return (
      <Fragment>
        <Modal name={name} title={intl.formatMessage(title.titleEosBuy)}>
          <div styleName="margin">
            <FieldLabel inRow>
              <FormattedMessage id="EosBuyAccountModal72" defaultMessage="Account name" />
              {' '}
              <Tooltip>
                <FormattedMessage id="Eos71" defaultMessage="This account will be registered in EOS blockchain" />
              </Tooltip>
            </FieldLabel>
            <Input readOnly valueLink={linked.accountName} styleName="input" />
          </div>
          <div styleName="margin">
            <FieldLabel inRow>
              <FormattedMessage id="EosBuyAccountModal78" defaultMessage="Private key" />
              {' '}
              <Tooltip id="EoS90">
                <FormattedMessage id="Eos75" defaultMessage="Private key for active and owner permissions" />
              </Tooltip>
            </FieldLabel>
            <Input readOnly valueLink={linked.activePrivateKey} />
          </div>
          <div styleName="margin">
            <FieldLabel inRow>
              <FormattedMessage id="EosBuyAccountModal84" defaultMessage="Public key" />
              {' '}
              <Tooltip id="EoS106">
                <FormattedMessage id="Eos79" defaultMessage="Public key associated with account" />
              </Tooltip>
            </FieldLabel>
            <Input readOnly valueLink={linked.activePublicKey} />
          </div>
          <div styleName="margin">
            <FieldLabel inRow>
              <FormattedMessage id="EosBuyAccountModal90" defaultMessage="Price (BTC)" />
              {' '}
              <Tooltip id="EoS113">
                <FormattedMessage id="Eos83" defaultMessage="This amount will be withdrawn from your BTC wallet" />
              </Tooltip>
            </FieldLabel>
            <Input readOnly valueLink={linked.price} />
          </div>
          { error && (
            <div styleName="error">
              <FormattedMessage id="EosBuyAccountModal103" defaultMessage="Sorry, error occurred during activation, try again" />
            </div>
          )}
          { activationPayment && (
            <div>
              <strong>
                <FormattedMessage id="EosBuyAccountModal109" defaultMessage="Payment transaction:" />
                <a
                  href={`${config.link.bitpay}/tx/${activationPayment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {activationPayment}
                </a>
              </strong>
            </div>
          )}

          <Button styleName="button" brand fullWidth onClick={this.handleSubmit}>
            <FormattedMessage id="EosBuyAccountModal114" defaultMessage="Create account" />
          </Button>
        </Modal>
      </Fragment>
    )
  }
}
