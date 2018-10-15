import React, { Fragment } from 'react'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FieldLabel, Input } from 'components/forms'

import Link from 'sw-valuelink'

import actions from 'redux/actions'
import { constants, eos } from 'helpers'
import { getState } from 'redux/core'

import cssModules from 'react-css-modules'
import styles from './EosBuyAccountModal.scss'
import Tooltip from 'components/ui/Tooltip/Tooltip'


@cssModules(styles)
export default class EosBuyAccountModal extends React.Component {

  state = {
    masterPrivateKey: '',
    accountName: '',
    publicKey: '',
    price: '',
    error: '',
    transactionId: ''
  }

  async componentDidMount() {
    const { masterPrivateKey, publicKey, accountName, price } = await actions.eos.prepareAccount()

    this.setState({ masterPrivateKey, accountName, publicKey, price })
  }

  handleSubmit = async () => {
    const { masterPrivateKey, accountName, transactionId } = this.state

    actions.loader.show(true)

    try {
      const { paymentTxId } = await actions.eos.buyAccount(masterPrivateKey, transactionId)
      this.setState({ transactionId: paymentTxId })

      await actions.eos.getBalance()
      actions.modals.close(constants.modals.EosBuyAccount)
    } catch (e) {
      console.error(e)
      this.setState({error: e.toString()})
    } finally {
      actions.loader.hide()
    }
  }

  render() {
    const { error, masterPrivateKey, accountName, publicKey, price } = this.state
    const { name } = this.props

    const linked = Link.all(this, 'accountName', 'publicKey', 'price', 'masterPrivateKey')

    return (
      <Fragment>
        <Modal name={name} title="EOS Register">
          <div>
            <FieldLabel inRow>Account name <Tooltip text="Your EOS Account name, please save it in a safe place" /></FieldLabel>
            <Input readOnly={true} valueLink={linked.accountName} />
          </div>
          <div>
            <FieldLabel inRow>Master private key <Tooltip text="Your EOS secret key, please save it in a safe place"/></FieldLabel>
            <Input readOnly={true} valueLink={linked.masterPrivateKey} />
          </div>
          <div>
            <FieldLabel inRow>Active public key <Tooltip text="Your EOS public key, please save it in a safe place"/></FieldLabel>
            <Input readOnly={true} valueLink={linked.publicKey} />
          </div>
          <div>
            <FieldLabel inRow>Price (BTC) <Tooltip text="Account creation fee "/></FieldLabel>
            <Input readOnly={true} valueLink={linked.price} />
          </div>
          { error && (
            <div styleName="error">Sorry, error occured during activation</div>
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
