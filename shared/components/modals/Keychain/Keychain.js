import React, { Component } from 'react'

import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './Keychain.scss'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import * as web3override from 'web3override'


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
      webSocketError: null,
      downloadUrl: '',
      tagName: '',
      keychainVersion: '',
      isLoading: false,
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    let keychain;
    web3override.Keychain.create()
      .then(data => { keychain = data } )
      .then(() => keychain.method({command: 'version'}))
      .then(data => { this.setState({keychainVersion: data.result }) } )
      .catch(webSocketError => this.setState({ webSocketError }))
      .then(() => fetch('https://api.github.com/repos/arrayio/array-io-keychain/tags'))
      .then(res => res.json())
      .then(result => this.setState({tagName: result[0].name}))
      .then(() => fetch(`https://api.github.com/repos/arrayio/array-io-keychain/releases/tags/${this.state.tagName}`))
      .then(res => res.json())
      .then(result => this.setState({ downloadUrl: result.assets[0].browser_download_url }))
      .catch(otherError => this.setState( { otherError } ))
      .then( () => this.setState( {isLoading: false} ))
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
    const {webSocketError, otherError, downloadUrl, keychainVersion, tagName, isLoading} = this.state

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
            {webSocketError ?
              <FormattedMessage id="Keychain19" defaultMessage="You need to install KeyChain to proceed" />
              :
              <FormattedMessage id="Keychain19" defaultMessage="Would you like to protect your keys with KeyChain? Note that your address will be changed" />
            }
          </p>
          { webSocketError ?
            <a href={downloadUrl}>
              <Button styleName="button" brand fullWidth onClick={() => actions.modals.close(name)}>
                <FormattedMessage id="Keychain23" defaultMessage="Download"/>
              </Button>
            </a> :
            <Button styleName="button" brand fullWidth onClick={() => { actions.eth.loginWithKeychain().then( () => {actions.modals.close(name)}) }}>
              <FormattedMessage id="Keychain24" defaultMessage="Confirm"/>
            </Button>
          }
          <Button styleName="button" brand fullWidth onClick={() => { actions.modals.close(name) }}>
            <FormattedMessage id="Keychain25" defaultMessage="Back"/>
          </Button>
        </div>
      </Modal>
    )
  }
}
