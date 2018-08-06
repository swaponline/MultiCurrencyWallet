import React, { Component } from 'react'

import actions from 'redux/actions'
import bitcoin from 'bitcoinjs-lib'

import Link from 'sw-valuelink'
import { constants } from 'helpers'

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
    isValidNetwork: false,
    isDisabled: true,
  }

  handleEthImportKey = () => {
    const { ethKey } = this.state

    console.log(ethKey.length < 40)

    if (!ethKey || ethKey.length < 40) {
      this.setState({
        isSubmittedEth: true,
      })
    } else {
      this.setState({
        isDisabled: false,
        isImportedEth: true,
      })
    }
  }

  handleBtcImportKey = () => {
    const { btcKey } = this.state

    const network = (
      process.env.MAINNET
        ? bitcoin.networks.bitcoin
        : bitcoin.networks.testnet
    )

    if (!btcKey || btcKey.length < 27) {
      this.setState({
        isSubmittedBtc: true,
      })
    } else {
      this.setState({
        isDisabled: false,
        isImportedBtc: true,
      })
    }

    try {
      new bitcoin.ECPair.fromWIF(btcKey, network) // eslint-disable-line
    } catch (e) {
      this.setState({
        isValidNetwork: true,
      })
    }
  }

  handleImportKeys = () => {
    const { ethKey, btcKey, isDisabled, isImportedEth, isImportedBtc } = this.state

    if (!isDisabled) {
      isImportedEth && localStorage.setItem(constants.privateKeyNames.eth, ethKey)
      isImportedBtc && localStorage.setItem(constants.privateKeyNames.btc, btcKey)
      window.location.reload()
    }
  }

  handleCloseModal = () => {
    actions.modals.close(this.props.name)
  }

  render() {
    const { isSubmittedEth, isSubmittedBtc, isValidNetwork, isDisabled, isImportedBtc, isImportedEth } = this.state
    const linked = Link.all(this, 'ethKey', 'btcKey')

    if (isSubmittedEth) {
      linked.ethKey.check((value) => value !== '', 'Please enter ETH private key')
      linked.ethKey.check((value) => value.length > 27, 'Please valid ETH private key')
    }

    if (isSubmittedBtc) {
      linked.btcKey.check((value) => value !== '', 'Please enter BTC private key')
      linked.btcKey.check((value) => value.length > 40, 'Please valid BTC private key')
    }

    if (isValidNetwork) {
      linked.btcKey.check((value) => !value, 'Please enter another network private key')
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
