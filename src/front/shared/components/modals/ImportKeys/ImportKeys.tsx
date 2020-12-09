import React, { Component } from 'react'

import actions from 'redux/actions'

import * as bitcoin from 'bitcoinjs-lib'

import Link from 'local_modules/sw-valuelink'
import { btc, constants, links } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './ImportKeys.scss'

import Group from './Group/Group'
import { Modal } from 'components/modal'
import { FieldLabel } from 'components/forms'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import config from 'helpers/externalConfig'

const title = defineMessages({
  Import: {
    id: 'Import',
    defaultMessage: 'Import keys',
  },
})

@injectIntl
@cssModules(styles)
export default class ImportKeys extends Component<any, any> {
  state = {
    ethKey: '',
    btcKey: '',

    isSubmittedEth: false,
    isSubmittedBtc: false,

    isImportedEth: false,
    isImportedBtc: false,

    isDisabled: true,
    keySave: false,
    onCloseLink: links.wallet,
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

  handleGoTo = (goToLink) => {
    const {
      intl: { locale },
    } = this.props

    window.location.hash = localisedUrl(locale, goToLink)
    window.location.reload()
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
      //@ts-ignore
      actions.eth.login(ethKey)
      this.setState({
        isImportedEth: true,
        isDisabled: false,
      })
      actions.core.markCoinAsVisible('ETH', true)
      this.setState({
        onCloseLink: links.EthWallet,
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
      //@ts-ignore
      actions.btc.login(btcKey)
      this.setState({
        isImportedBtc: true,
        isDisabled: false,
      })
      actions.core.markCoinAsVisible('BTC', true)
      this.setState({
        onCloseLink: links.BtcWallet,
      })
    } catch (e) {
      console.log(e)
      this.setState({ isSubmittedBtc: true })
    }
  }

  handleImportKeys = () => {
    this.handleCloseModal()
    //@ts-ignore
    localStorage.setItem(constants.localStorage.testnetSkipPKCheck, true)
    //@ts-ignore
    localStorage.setItem(constants.localStorage.isWalletCreate, true)

    setTimeout(() => {
      const { onCloseLink } = this.state
      const { isImportedBtc, isImportedEth } = this.state

      if ([isImportedBtc, isImportedEth].filter((i) => i).length > 1) {
        this.handleGoTo(links.home)
      } else {
        this.handleGoTo(onCloseLink)
      }
    }, 500)
  }

  handleCloseModal = () => {
    const { name, data } = this.props

    actions.modals.close(name)
    if (typeof data.onClose === 'function') {
      data.onClose()
    }
  }

  checkAnyImport = () => {
    const { isSubmittedEth, isSubmittedBtc } = this.state

    if (isSubmittedEth || isSubmittedBtc) {
      this.setState(() => ({ isDisabled: false }))
    }
  }

  render() {
    const {
      isSubmittedEth,
      isSubmittedBtc,
      isImportedEth,
      isImportedBtc,
      isDisabled,
      keySave,
    } = this.state

    const { intl, data } = this.props

    const linked = Link.all(this, 'ethKey', 'btcKey')

    if (isSubmittedEth) {
      linked.ethKey.check(
        (value) => value !== '',
        <FormattedMessage id="importkeys172" defaultMessage="Please enter ETH private key" />
      )
      linked.ethKey.check(
        (value) => value.length > 40,
        <FormattedMessage id="importkeys173" defaultMessage="Please valid ETH private key" />
      )
    }

    if (isSubmittedBtc) {
      linked.btcKey.check(
        (value) => value !== '',
        <FormattedMessage id="importkeys118" defaultMessage="Please enter BTC private key" />
      )
      linked.btcKey.check(
        (value) => value.length > 27,
        <FormattedMessage id="importkeys119" defaultMessage="Please valid BTC private key" />
      )
      linked.btcKey.check(
        () => this.handleBtcImportKey(),
        <FormattedMessage
          id="importkeys190"
          defaultMessage="Something went wrong. Check your private key, network of this address and etc."
        />
      )
    }

    return (
      <Modal
        name={this.props.name}
        title={intl.formatMessage(title.Import)}
        data={data}
        //@ts-ignore */
        onClose={this.state.onClose}
      >
        <div styleName="modal" className="ym-hide-content">
          <p>
            <FormattedMessage
              id="ImportKeys107"
              defaultMessage="This procedure will rewrite your private key. If you are not sure about it, we recommend to press cancel"
            />
          </p>
          {(!config.opts.curEnabled || config.opts.curEnabled.eth) && (
            <>
              <FieldLabel positionStatic>
                <FormattedMessage
                  id="ImportKeys110"
                  defaultMessage="Please enter ETH private key"
                />
              </FieldLabel>
              <Group
                inputLink={linked.ethKey}
                placeholder="Key"
                disabled={isImportedEth}
                onClick={this.handleEthImportKey}
              />
            </>
          )}
          {(!config.opts.curEnabled || config.opts.curEnabled.btc) && (
            <>
              <FieldLabel positionStatic>
                <FormattedMessage
                  id="ImportKeys120"
                  defaultMessage="Please enter BTC private key in WIF format"
                />
              </FieldLabel>
              <Group
                inputLink={linked.btcKey}
                placeholder="Key in WIF format"
                disabled={isImportedBtc}
                onClick={this.handleBtcImportKey}
              />
            </>
          )}
          {!keySave && (
            <span styleName="error">
              <FormattedMessage
                id="errorImportKeys"
                defaultMessage=" Please save your private keys"
              />
            </span>
          )}
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
