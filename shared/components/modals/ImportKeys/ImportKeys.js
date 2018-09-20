import React, { Component } from 'react'

import actions from 'redux/actions'

import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './ImportKeys.scss'

import Group from './Group/Group'
import { Modal } from 'components/modal'
import { FieldLabel } from 'components/forms'
import { Button } from 'components/controls'


@cssModules(styles)
export default class ImportKeys extends Component {

  state = {
    ethKey: '',
    btcKey: '',

    isSubmittedEth: false,
    isSubmittedBtc: false,

    isImportedEth: false,
    isImportedBtc: false,

    isDisabled: true,
  }

  handleEthImportKey = () => {
    const { ethKey } = this.state

    if (!ethKey || ethKey.length < 40) {
      this.setState({ isSubmittedEth: true })
      return
    }
    this.setState({ isDisabled: false })


    try {
      actions.eth.login(ethKey)
      this.setState({
        isImportedEth: true,
        isDisabled: false,
      })
    } catch (e) {
      this.setState({ isSubmittedEth: true })
    }
  }

  handleBtcImportKey = () => {
    const { btcKey } = this.state

    if (!btcKey || btcKey.length < 27) {
      this.setState({ isSubmittedBtc: true })
      return
    }
    this.setState({ isDisabled: false })


    try {
      actions.btc.login(btcKey)
      this.setState({
        isImportedBtc: true,
        isDisabled: false,
      })
    } catch (e) {
      this.setState({ isSubmittedBtc: true })
    }
  }


  handleImportKeys = () => {
    const { isDisabled } = this.state

    if (!isDisabled) {
      window.location.reload()
    }
  }

  handleCloseModal = () => {
    actions.modals.close(this.props.name)
  }

  render() {
    const { isSubmittedEth, isSubmittedBtc, isImportedEth, isImportedBtc, isDisabled } = this.state
    const linked = Link.all(this, 'ethKey', 'btcKey')

    if (isSubmittedEth) {
      linked.ethKey.check((value) => value !== '', 'Please enter ETH private key')
      linked.ethKey.check((value) => value.length > 40, 'Please valid ETH private key')
    }

    if (isSubmittedBtc) {
      linked.btcKey.check((value) => value !== '', 'Please enter BTC private key')
      linked.btcKey.check((value) => value.length > 27, 'Please valid BTC private key')
    }

    return (
      <Modal name={this.props.name} title="Import keys">
        <div styleName="modal">
          <p>This procedure will rewrite your private key. If you are not sure about it, we recommend to press cancel</p>

          <FieldLabel>Please enter eth private key</FieldLabel>
          <Group
            inputLink={linked.ethKey}
            placeholder="Key"
            disabled={isImportedEth}
            onClick={this.handleEthImportKey}
          />

          <FieldLabel>Please enter btc private key in WIF format</FieldLabel>
          <Group
            inputLink={linked.btcKey}
            placeholder="Key in WIF format"
            disabled={isImportedBtc}
            onClick={this.handleBtcImportKey}
          />

          <Button brand disabled={isDisabled} styleName="button" onClick={this.handleImportKeys}> Confirm</Button>
          <Button gray styleName="button" onClick={this.handleCloseModal}> Cancel</Button>
        </div>
      </Modal>
    )
  }
}
