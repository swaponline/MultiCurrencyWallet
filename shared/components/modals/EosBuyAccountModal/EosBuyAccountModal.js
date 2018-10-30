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


@cssModules(styles)
export default class EosBuyAccountModal extends React.Component {

  state = {
    activePrivateKey: '',
    activePublicKey: '',
    accountName: '',
    price: '',
    error: ''
  }

  async componentDidMount() {
    const {
      user: {
        eosData: {
          activePrivateKey,
          activePublicKey,
          address: accountName
        }
      }
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

    return (
      <Fragment>
        <Modal name={name} title="EOS Register">
          <div>
            <FieldLabel inRow>Account name<Tooltip text="This account will be registered in EOS blockchain" /></FieldLabel>
            <Input readOnly={true} valueLink={linked.accountName} />
          </div>
          <div>
            <FieldLabel inRow>Private key<Tooltip text="Private key for active and owner permissions"/></FieldLabel>
            <Input readOnly={true} valueLink={linked.activePrivateKey} />
          </div>
          <div>
            <FieldLabel inRow>Public key<Tooltip text="Public key associated with account"/></FieldLabel>
            <Input readOnly={true} valueLink={linked.activePublicKey} />
          </div>
          <div>
            <FieldLabel inRow>Price (BTC)<Tooltip text="This amount will be withdrawn from your BTC wallet"/></FieldLabel>
            <Input readOnly={true} valueLink={linked.price} />
          </div>
          { error && (
            <div styleName="error">Sorry, error occured during activation</div>
          )}
          { activationPayment && (
            <div>
            <strong>
              Payment transaction:
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
          <Button
            styleName="button"
            brand
            fullWidth
            onClick={this.handleSubmit}
          >
            Create account
          </Button>
        </Modal>
      </Fragment>
    )
  }
}
