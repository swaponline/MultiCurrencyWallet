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
    defaultMessage: 'Keychain activation',
  },
})

@injectIntl
@CSSModules(styles)
export default class Keychain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      downloadUrl: '',
      tagName: '',
      keychainVersion: ''
    };
  }

  componentDidMount() {
    let keychain;
    web3override.Keychain.create()
      .then(data => {  keychain = data } )
      .then(() => keychain.method({command: 'version'}))
      .then(data => { this.setState({keychainVersion: data.result }) } )
      .then(() => fetch('https://api.github.com/repos/arrayio/array-io-keychain/tags'))
      .then(res => res.json())
      .then(result => this.setState({tagName: result[0].name})) // todo handle error
      .then(() => fetch(`https://api.github.com/repos/arrayio/array-io-keychain/releases/tags/${this.state.tagName}`))
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            downloadUrl: result.assets[0].browser_download_url
          })
        },
        (error) => {
          this.setState({
            error
          })
        }
      )
  }

  needUpdate(tagName, keychainVersion) {
    const keychainVersionSplit = keychainVersion.split('.');
    const tagNameSplit = tagName.split('.');
    return tagNameSplit[0] !== keychainVersionSplit[0] || tagNameSplit[1] !== keychainVersionSplit[1]
  }

  render() {

    const {name, intl: {locale}, intl} = this.props
    const {error, downloadUrl, keychainVersion, tagName} = this.state
    let message = `KeyChain is activated. Version: ${keychainVersion}.`;

    if (error) {
      return <div>Error: {error.message}</div>
    } else {
      if (this.needUpdate(tagName, keychainVersion)) {
        message += " Update keychain";
        return (
          <Modal name={name} title={intl.formatMessage(title.Keychain)}>
            <div styleName="content">
              <p>
                <FormattedMessage id="Keychain19" defaultMessage={message} />
              </p>
              <a href={downloadUrl}>
                <Button styleName="button" brand fullWidth onClick={() => actions.modals.close(name)}>
                  <FormattedMessage id="Keychain23" defaultMessage="Update KeyChain"/>
                </Button>
              </a>
              <Button styleName="button" brand fullWidth onClick={() => { actions.eth.loginWithKeychain().then( () => {actions.modals.close(name)}) }}>
                <FormattedMessage id="Keychain24" defaultMessage="OK"/>
              </Button>
            </div>
          </Modal>
        )
      } else {
        return (
          <Modal name={name} title={intl.formatMessage(title.Keychain)}>
            <div styleName="content">
              <p>
                <FormattedMessage id="Keychain19" defaultMessage={message} />
              </p>
              <Button styleName="button" brand fullWidth onClick={() => { actions.eth.loginWithKeychain().then( () => {actions.modals.close(name)}) } }>
                <FormattedMessage id="Keychain24" defaultMessage="OK"/>
              </Button>
            </div>
          </Modal>
        )
      }

    }
  }
}
