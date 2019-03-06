import React, { Component } from 'react'

import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './Keychain.scss'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import * as keychainjs from 'keychain.js'
import { getState } from 'redux/core'
import web3 from 'helpers/web3'
import { constants } from 'helpers'


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
    super(props);
    this.state = {
      otherError: null,
      keychainInstalled: true,
      downloadUrl: '',
      tagName: '',
      keychainVersion: '',
      isLoading: false,
      positiveBalanceError: false
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    let keychain;
    const { user: { ethData: { address } } } = getState()

    keychainjs.Keychain.create()
      .then(data => keychain = data)
      .then(() => keychain.method({command: 'version'}))
      .then(data => this.setState({keychainVersion: data.result}))
      .catch(() => this.setState({keychainInstalled: false}))
      .then(() => fetch('https://api.github.com/repos/arrayio/array-io-keychain/tags'))
      .then(res => res.json())
      .then(result => this.setState({tagName: result[0].name}))
      .then(() => fetch(`https://api.github.com/repos/arrayio/array-io-keychain/releases/tags/${this.state.tagName}`))
      .then(res => res.json())
      .then(result => this.setState({downloadUrl: result.assets[0].browser_download_url}))
      .catch(otherError => this.setState({otherError}))
      .then(() => web3.eth.getBalance(address))
      .then(result => web3.utils.fromWei(result))
      .then(result => this.setState({positiveBalanceError: result > 0}))
      .then(() => this.setState({isLoading: false}))
  }

  // needUpdate(tagName, keychainVersion) {
  //   if (!keychainVersion) { // KeyChain websocket is not running
  //     return true;
  //   }
  //   const keychainVersionSplit = keychainVersion.split('.');
  //   const tagNameSplit = tagName.split('.');
  //   return tagNameSplit[0] !== keychainVersionSplit[0] || tagNameSplit[1] !== keychainVersionSplit[1]
  // }

  render() {

    const {name, intl: {locale}, intl} = this.props
    const {keychainInstalled, otherError, downloadUrl, keychainVersion, tagName, positiveBalanceError, isLoading} = this.state
    const keychainActivated = localStorage.getItem(constants.localStorage.keychainActivated) === 'true'

    if (otherError) {
      return <div>Error: {otherError.message}</div>
    }
    if (isLoading) {
      return <Modal name={name} title={intl.formatMessage(title.Keychain)}></Modal>
    }

    return (
      <Modal name={name} title={intl.formatMessage(title.Keychain)}>
        <div styleName="content">
          <p>
            {!keychainInstalled && !keychainActivated &&
              <div>
                <FormattedMessage id="Keychain19" defaultMessage="You need to install KeyChain to proceed" />
                <a href={downloadUrl}>
                  <Button styleName="button" brand fullWidth onClick={() => actions.modals.close(name)}>
                    <FormattedMessage id="Keychain23" defaultMessage="Download"/>
                  </Button>
                </a>
              </div>
            }
            {keychainInstalled && !keychainActivated &&
              <div>
                {positiveBalanceError ?
                  <FormattedMessage id="Keychain26" defaultMessage="Positive balance error"/>
                  :
                  <div>
                    <FormattedMessage id="Keychain19" defaultMessage="Would you like to protect your keys with KeyChain? Note that your address will be changed" />
                    <Button styleName="button" brand fullWidth onClick={() => {actions.eth.loginWithKeychain().then( () => {actions.modals.close(name)})}}>
                      <FormattedMessage id="Keychain24" defaultMessage="Confirm"/>
                    </Button>
                  </div>
                }
              </div>
            }
            {keychainInstalled && keychainActivated &&
              <div>
                <FormattedMessage id="Keychain19" defaultMessage="KeyChain is activated. If you wish to deactivate KeyChain, note that your key will be replaced with a new one." />
                <Button styleName="button" brand fullWidth onClick={() => {actions.eth.login(); actions.eth.getBalance().then(() => actions.modals.close(name))}}>
                  <FormattedMessage id="Keychain24" defaultMessage="Deactivate"/>
                </Button>
              </div>
            }
            {!keychainInstalled && keychainActivated &&
              <div>
                <FormattedMessage id="Keychain19" defaultMessage="KeyChain is not installed but activated" />
                <Button styleName="button" brand fullWidth onClick={() => {actions.eth.login(); actions.eth.getBalance().then(() => actions.modals.close(name))}}>
                  <FormattedMessage id="Keychain24" defaultMessage="Deactivate"/>
                </Button>
                <a href={downloadUrl}>
                  <Button styleName="button" brand fullWidth onClick={() => actions.modals.close(name)}>
                    <FormattedMessage id="Keychain23" defaultMessage="Download"/>
                  </Button>
                </a>
              </div>
            }
          </p>
          <Button styleName="button" brand fullWidth onClick={() => { actions.modals.close(name) }}>
            <FormattedMessage id="Keychain25" defaultMessage="Back"/>
          </Button>
        </div>
      </Modal>
    )
  }
}
