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
import { FormattedMessage } from 'react-intl'


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
    const { name } = this.props

    const linked = Link.all(this, 'accountName', 'activePrivateKey', 'activePublicKey', 'price')

    const activationPayment = localStorage.getItem(constants.localStorage.eosActivationPayment)

    const text = [
      <FormattedMessage id="Eos71" defaultMessage="This account will be registered in EOS blockchain" />,
    ]

    const text1 = [
      <FormattedMessage id="Eos75" defaultMessage="Private key for active and owner permissions" />,
    ]

    const text2 = [
      <FormattedMessage id="Eos79" defaultMessage="Public key associated with account" />,
    ]

    const text3 = [
      <FormattedMessage id="Eos83" defaultMessage="This amount will be withdrawn from your BTC wallet" />,
    ]

    const title = [
      <FormattedMessage id="Eos87" defaultMessage="EOS Register" />,
    ]

    return (
      <Fragment>
        <Modal name={name} title={title} >
          <div styleName="margin">
            <FieldLabel inRow>
              <FormattedMessage id="EosBuyAccountModal72" defaultMessage="Account name" />
              {' '}
              <Tooltip text={text} id="EoS92" />
            </FieldLabel>
            <Input readOnly="true" valueLink={linked.accountName} styleName="input" />
          </div>
          <div styleName="margin">
            <FieldLabel inRow>
              <FormattedMessage id="EosBuyAccountModal78" defaultMessage="Private key" />
              {' '}
              <Tooltip text={text1} id="EoS90" />
            </FieldLabel>
            <Input readOnly="true" valueLink={linked.activePrivateKey} />
          </div>
          <div styleName="margin">
            <FieldLabel inRow>
              <FormattedMessage id="EosBuyAccountModal84" defaultMessage="Public key" />
              {' '}
              <Tooltip text={text2} id="EoS106" />
            </FieldLabel>
            <Input readOnly="true" valueLink={linked.activePublicKey} />
          </div>
          <div styleName="margin">
            <FieldLabel inRow>
              <FormattedMessage id="EosBuyAccountModal90" defaultMessage="Price (BTC)" />
              {' '}
              <Tooltip text={text3} id="EoS113" />
            </FieldLabel>
            <Input readOnly="true" valueLink={linked.price} />
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
