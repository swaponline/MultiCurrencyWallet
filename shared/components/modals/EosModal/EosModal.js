import React from 'react'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FieldLabel, Input } from 'components/forms'

import Link from 'sw-valuelink'

import actions from 'redux/actions'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './EosModal.scss'

@cssModules(styles)
export default class EosModal extends React.Component {

  state = {
    accountName: '',
    privateKey: '',
    error: '',
  }

  handleSubmit = async () => {
    const { accountName, privateKey } = this.state

    actions.loader.show(true)

    try {
      await actions.eos.register(accountName, privateKey)
      await actions.eos.getBalance()

      actions.modals.close(constants.modals.Eos)
    } catch (e) {
      console.error(e)
      this.setState({ error: e.toString() })
    }

    actions.loader.hide()
  }

  render() {
    const { accountName, privateKey, error } = this.state
    const { name } = this.props

    const linked = Link.all(this, 'accountName', 'privateKey')
    const isDisabled = !accountName || !privateKey

    return (
      <Modal name={name} title="EOS Login">
        <FieldLabel inRow>Account name</FieldLabel>
        <Input valueLink={linked.accountName} />
        <FieldLabel inRow>Private key</FieldLabel>
        <Input valueLink={linked.privateKey} />
        { error && (
          <div styleName="error">Sorry, error occured during activation</div>
        )
        }
        <Button
          styleName="button"
          brand
          fullWidth
          disabled={isDisabled}
          onClick={this.handleSubmit}
        >
          Login
        </Button>
      </Modal>
    )
  }
}
