import React, { Component } from 'react'

import actions from 'redux/actions'

import bitcoin from 'bitcoinjs-lib'

import Link from 'sw-valuelink'
import { btc, constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './ImportKeys.scss'

import Group from './Group/Group'
import { Modal } from 'components/modal'
import { FieldLabel } from 'components/forms'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'


const title = defineMessages({
  Import: {
    id: 'Import',
    defaultMessage: 'Import keys',
  },
})

@injectIntl

@cssModules(styles)
export default class ImportKeys extends Component {

  state = {
    ethKey: '',
    btcKey: '',
    ltcKey: '',
    // xlmKey: '',

    isSubmittedEth: false,
    isSubmittedBtc: false,
    isSubmittedLtc: false,
    // isSubmittedXlm: false,

    isImportedEth: false,
    isImportedBtc: false,
    isImportedLtc: false,
    // isImportedXlm: false,

    isDisabled: true,
    keySave: false,
  }

  componentWillMount() {
    const saveKeys = JSON.parse(localStorage.getItem(constants.localStorage.privateKeysSaved))

    if (saveKeys) {
      this.setState(() => ({ keySave: true }))
    }
  }

  componentDidMount() {
    this.checkAnyImport()
  }

  handleEthImportKey = () => {
    let { ethKey } = this.state

    if (!ethKey || ethKey.length < 40) {
      this.setState({ isSubmittedEth: true })
      return
    }

    const withOx = ethKey.substring(0, 2)

    if (withOx !== '0x') {
      ethKey = `0x${ethKey}`
    }

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

    try {
      bitcoin.ECPair.fromWIF(btcKey, btc.network) // eslint-disable-line
    } catch (e) {
      this.setState({ isSubmittedBtc: true })
      return false
    }

    if (!btcKey || btcKey.length < 27) {
      this.setState({ isSubmittedBtc: true })
      return
    }


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

  handleLtcImportKey = () => {
    const { ltcKey } = this.state

    if (!ltcKey || ltcKey.length < 27) {
      this.setState({ isSubmittedLtc: true })
      return
    }

    try {
      actions.ltc.login(ltcKey)
      this.setState({
        isImportedLtc: true,
        isDisabled: false,
      })
    } catch (e) {
      this.setState({ isSubmittedLtc: true })
    }
  }
  /*
  handleXlmImportKey = () => {
    const { xlmKey } = this.state

    if (!xlmKey) {
      this.setState({ isSubmittedXlm: true })
      return
    }

    try {
      actions.xlm.login(xlmKey)
      this.setState({
        isImportedXlm: true,
        isDisabled: false,
      })
    } catch (e) {
      this.setState({ isSubmittedXlm: true })
    }
  }
  */
  handleImportKeys = () => {
    this.handleCloseModal()
    localStorage.setItem(constants.localStorage.testnetSkipPKCheck, true)
    window.location.reload()
  }

  handleCloseModal = () => {
    const { name, data } = this.props

    actions.modals.close(name)
    if (typeof data.onClose === 'function') {
      data.onClose()
    }
  }

  checkAnyImport = () => {
    const { isSubmittedEth, isSubmittedBtc, isSubmittedLtc /* , isSubmittedXlm */ } = this.state

    if (isSubmittedEth || isSubmittedBtc || isSubmittedLtc /* || isSubmittedXlm */) {
      this.setState(() => ({ isDisabled: false }))
    }
  }

  render() {
    const {
      isSubmittedEth, isSubmittedBtc, isSubmittedLtc, /* isSubmittedXlm, */
      isImportedEth, isImportedBtc, isImportedLtc, /* isImportedXlm, */ isDisabled, keySave,
    } = this.state

    const { intl, data } = this.props

    const linked = Link.all(this, 'ethKey', 'btcKey', 'ltcKey' /* , 'xlmKey' */)

    if (isSubmittedEth) {
      linked.ethKey.check((value) => value !== '', <FormattedMessage id="importkeys172" defaultMessage="Please enter ETH private key" />)
      linked.ethKey.check((value) => value.length > 40, <FormattedMessage id="importkeys173" defaultMessage="Please valid ETH private key" />)
    }

    if (isSubmittedBtc) {
      linked.btcKey.check((value) => value !== '', <FormattedMessage id="importkeys118" defaultMessage="Please enter BTC private key" />)
      linked.btcKey.check((value) => value.length > 27, <FormattedMessage id="importkeys119" defaultMessage="Please valid BTC private key" />)
      linked.btcKey.check(() =>
        this.handleBtcImportKey(), <FormattedMessage id="importkeys190" defaultMessage="Something went wrong. Check your private key, network of this address and etc." />)
    }

    if (isSubmittedLtc) {
      linked.ltcKey.check((value) => value !== '', 'Please enter LTC private key')
      linked.ltcKey.check((value) => value.length > 27, 'Please valid LTC private key')
    }
    /*
    if (isSubmittedXlm) {
      linked.btcKey.check((value) => value !== '', <FormattedMessage id="importkeys187" defaultMessage="Please enter XLM private key" />)
    }
    */
    return (
      <Modal name={this.props.name} title={intl.formatMessage(title.Import)} data={data}>
        <div styleName="modal">
          <p>
            <FormattedMessage id="ImportKeys107" defaultMessage="This procedure will rewrite your private key. If you are not sure about it, we recommend to press cancel" />
          </p>
          <FieldLabel>
            <FormattedMessage id="ImportKeys110" defaultMessage="Please enter ETH private key" />
          </FieldLabel>
          <Group
            inputLink={linked.ethKey}
            placeholder="Key"
            disabled={isImportedEth}
            onClick={this.handleEthImportKey}
          />
          <FieldLabel>
            <FormattedMessage id="ImportKeys120" defaultMessage="Please enter BTC private key in WIF format" />
          </FieldLabel>
          <Group
            inputLink={linked.btcKey}
            placeholder="Key in WIF format"
            disabled={isImportedBtc}
            onClick={this.handleBtcImportKey}
          />

          <FormattedMessage id="ImportKeys205" defaultMessage="Please enter LTC private key in WIF format">
            {message => <FieldLabel>{message}</FieldLabel>}
          </FormattedMessage>
          <Group
            inputLink={linked.ltcKey}
            placeholder="Key in WIF format"
            disabled={isImportedLtc}
            onClick={this.handleLtcImportKey}
          />
          {
          /*
          <FormattedMessage id="ImportKeys176" defaultMessage="Please enter xlm private key">
            {message => <FieldLabel>{message}</FieldLabel>}
          </FormattedMessage>
          <Group
            inputLink={linked.xlmKey}
            placeholder="Key"
            disabled={isImportedXlm}
            onClick={this.handleXlmImportKey}
          />
          */
          }
          {
            !keySave && (
              <span styleName="error">
                <FormattedMessage id="errorImportKeys" defaultMessage=" Please save your private keys" />
              </span>
            )
          }
          <Button brand disabled={isDisabled} styleName="button" onClick={this.handleImportKeys}>
            <FormattedMessage id="ImportKeys130" defaultMessage="Confirm" />
          </Button>
          <Button gray styleName="button" onClick={this.handleCloseModal}>
            <FormattedMessage id="ImportKeys133" defaultMessage="Cancel" />
          </Button>
        </div>
      </Modal>
    )
  }
}
