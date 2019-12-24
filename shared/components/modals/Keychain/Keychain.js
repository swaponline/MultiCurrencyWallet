import React, { Component } from 'react'

import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './Keychain.scss'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import * as keychainjs from 'keychain.js'
import { getState } from 'redux/core'
import { constants, web3, api, apiLooper } from 'helpers'


const title = defineMessages({
  Keychain: {
    id: 'Keychain',
    defaultMessage: 'KeyChain Activation',
  },
})

@injectIntl
@CSSModules(styles)
export default class Keychain extends Component {
  constructor(props) {
    super(props)
    this.state = {
      otherError: null,
      keychainInstalled: true,
      downloadUrl: '',
      tagName: '',
      keychainVersion: '',
      isLoading: false,
      positiveBalanceError: false,
      keychainIsLoadingLong: false,
    }
  }

  getBalance() {
    const { currency } = this.props.data
    if (currency === 'ETH') {
      const { address } = getState().user.ethData
      return web3.eth.getBalance(address)
        .then(result => web3.utils.fromWei(result))
    }
    const { address } = getState().user.btcData
    return apiLooper.get('bitpay', `/addr/${address}`)
      .then(({ balance }) => balance)
  }

  async componentWillMount() {
    this.setState({ isLoading: true })
    let keychainInstalled = true
    try {
      await keychainjs.Keychain.create()
    } catch (e) {
      keychainInstalled = false
    }
    this.setState({ keychainInstalled })
    if (!keychainInstalled) {
      try {
        const fetchTagResult = await fetch('https://api.github.com/repos/arrayio/array-io-keychain/tags')
        const fetchTagResultJson = await fetchTagResult.json()
        this.setState({ tagName: fetchTagResultJson[0].name })
        const fetchReleaseResult = await fetch(`https://api.github.com/repos/arrayio/array-io-keychain/releases/tags/${this.state.tagName}`)
        const fetchReleaseResultJson = await fetchReleaseResult.json()
        this.setState({ downloadUrl: fetchReleaseResultJson.assets[0].browser_download_url })
      } catch (e) {
        this.setState({ otherError: e })
      }
    }
    const balance = await this.getBalance()
    this.setState({ positiveBalanceError: balance > 0 })
    setTimeout(() => this.setState({ keychainIsLoadingLong: true }), 2000)
    this.setState({ isLoading: false })
  }

  deactivate(currency) {
    actions.keychain.deactivate(currency)
    if (currency === 'ETH') {
      actions.eth.login()
      return actions.eth.getBalance()
    }
    actions.btc.login()
    return actions.btc.getBalance()
  }

  render() {
    const { name, intl, data } = this.props
    const { keychainInstalled, downloadUrl, positiveBalanceError, isLoading, keychainIsLoadingLong } = this.state
    let { otherError } = this.state
    let keychainActivated
    if (data.currency === 'ETH') {
      keychainActivated = !!localStorage.getItem(constants.privateKeyNames.ethKeychainPublicKey)
    } else if (data.currency === 'BTC') {
      keychainActivated = !!localStorage.getItem(constants.privateKeyNames.btcKeychainPublicKey)
    } else {
      otherError = { message: `Unknown currency "${data.currency}" passed. Supported currencies are BTC or ETH` }
    }

    if (otherError) {
      return <div>{`Error: ${otherError.message}`}</div>
    }
    if (isLoading) {
      return (
        <Modal name={name} title={intl.formatMessage(title.Keychain)} >
          { keychainIsLoadingLong && (
            <div styleName="content">
              <div>
                <InlineLoader />
              </div>
              <FormattedMessage id="Keychain114" defaultMessage="KeyChain is loading. Please wait." />
              <Button styleName="button" brand fullWidth onClick={() => { actions.modals.close(name) }}>
                <FormattedMessage id="Keychain116" defaultMessage="Back" />
              </Button>
            </div>
          )
          }
        </Modal>)
    }

    return (
      <Modal name={name} title={intl.formatMessage(title.Keychain)}>
        <div styleName="content">
          <div>{`Currency: ${data.currency}`}</div>
          { !keychainInstalled && !keychainActivated &&
            <div>
              <FormattedMessage id="Keychain130" defaultMessage="You need to install KeyChain to proceed" />
              <a href={downloadUrl}>
                <Button styleName="button" brand fullWidth onClick={() => actions.modals.close(name)}>
                  <FormattedMessage id="Keychain133" defaultMessage="Download" />
                </Button>
              </a>
            </div>
          }
          { keychainInstalled && !keychainActivated &&
            <div>
              { positiveBalanceError ?
                <FormattedMessage id="Keychain141" defaultMessage="Positive balance error" />
                :
                <div>
                  <FormattedMessage id="Keychain144" defaultMessage="Would you like to protect your keys with KeyChain? Note that your address will be changed" />
                  <Button
                    styleName="button"
                    brand
                    fullWidth
                    onClick={() => {
                      if (data.currency === 'ETH') {
                        actions.eth.loginWithKeychain().then(() => { actions.modals.close(name) })
                      } else {
                        actions.btc.loginWithKeychain().then(() => { actions.modals.close(name) })
                      }
                    }
                    }>
                    <FormattedMessage id="Keychain157" defaultMessage="Confirm" />
                  </Button>
                </div>
              }
            </div>
          }
          { keychainInstalled && keychainActivated &&
            <div>
              <FormattedMessage id="Keychain1165" defaultMessage="KeyChain is activated. If you wish to deactivate KeyChain, note that your key will be replaced with a new one." />
              <Button styleName="button" brand fullWidth onClick={() => { this.deactivate(data.currency).then(() => actions.modals.close(name)) }}>
                <FormattedMessage id="Keychain167" defaultMessage="Deactivate" />
              </Button>
            </div>
          }
          { !keychainInstalled && keychainActivated &&
            <div>
              <FormattedMessage id="Keychain173" defaultMessage="KeyChain is not installed but activated" />
              <Button styleName="button" brand fullWidth onClick={() => { this.deactivate(data.currency).then(() => actions.modals.close(name)) }}>
                <FormattedMessage id="Keychain175" defaultMessage="Deactivate" />
              </Button>
              <a href={downloadUrl}>
                <Button styleName="button" brand fullWidth onClick={() => actions.modals.close(name)}>
                  <FormattedMessage id="Keychain179" defaultMessage="Download" />
                </Button>
              </a>
            </div>
          }
          <Button styleName="button" brand fullWidth onClick={() => { actions.modals.close(name) }}>
            <FormattedMessage id="Keychain185" defaultMessage="Back" />
          </Button>
        </div>
      </Modal>
    )
  }
}
