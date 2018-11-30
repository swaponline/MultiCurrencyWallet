import React from 'react'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FieldLabel, Input } from 'components/forms'

import Link from 'sw-valuelink'

import actions from 'redux/actions'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './EosRegisterModal.scss'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'


@cssModules(styles)
export default class EosRegisterModal extends React.Component {

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

      actions.modals.close(constants.modals.EosRegister)
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

    const text = [
      <FormattedMessage id="Eos53" defaultMessage="Enter your EOS account name" />,
    ]

    const text1 = [
      <FormattedMessage id="Eos57" defaultMessage="Enter private key for active permission" />,
    ]

    const title = [
      <FormattedMessage id="Eos61" defaultMessage="EOS Login" />,
    ]

    return (
      <Modal name={name} title={title}>
        <FieldLabel inRow>
          <FormattedMessage id="EosRegAccountModal54" defaultMessage="Account name" />
          <Tooltip text={text} id="EoSR92" />
        </FieldLabel>
        <Input valueLink={linked.accountName} />
        <FieldLabel inRow>
          <FormattedMessage id="EosRegAccountModal58" defaultMessage="Active private key" />
          <Tooltip text={text1} id="EoSR69" />
        </FieldLabel>
        <Input valueLink={linked.privateKey} />
        { error && (
          <div styleName="error">
            <FormattedMessage id="EosRegAccountModal63" defaultMessage="Sorry, error occurred during activation" />
          </div>
        )
        }
        <Button styleName="button" brand fullWidth disabled={isDisabled} onClick={this.handleSubmit}>
          <FormattedMessage id="EosRegAccountModal70" defaultMessage="Login" />
        </Button>
      </Modal>
    )
  }
}
