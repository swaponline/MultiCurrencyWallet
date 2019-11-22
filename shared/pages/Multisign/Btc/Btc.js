import React, { Fragment, PureComponent } from 'react'
import PropTypes from 'prop-types'

import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'
import { constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { FormattedMessage, injectIntl } from 'react-intl'
import { withRouter } from 'react-router'
import actions from 'redux/actions'
import { links }    from 'helpers'
import Button from 'components/controls/Button/Button'

import moment from 'moment'

import CSSModules from 'react-css-modules'
import styles from './Btc.scss'
import SwapApp from 'swap.app'
import config from 'app-config'


@connect(({
  user: {
    btcMultisigUserData,
  },
}) => {
  return {
    data: btcMultisigUserData,
  }
})
@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class Btc extends PureComponent {

  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    intl: PropTypes.object.isRequired,
  };

  

  constructor() {
    console.log('Btc mulsign connected')
    super()
    
    this.timerWaitOnlineJoin = false
    this.state = {
      action: 'none',
      wallet: {},
      walletBalance: 0,
      publicKey: '',
      addWalletEnabled: false,
    }
  }

  async componentWillMount() {
    let { match : { params : { action, data, peer } }, history, location: { pathname } } = this.props
    if ((action !== 'join') && (action !== 'connect') && (action !== 'confirm')) {
      this.props.history.push(localisedUrl(links.notFound))
      return
    }
    if (action === 'join' || action === 'connect') {
      if (data && data.length==66) {
        const privateKey = this.props.data.privateKey
        const publicKey = data
        const walletData = actions.btcmultisig.login_USER(privateKey, publicKey, true)
        const balance = await actions.btcmultisig.fetchBalance( walletData.address )
        const myPublicKey = this.props.data.publicKey.toString('hex')

        this.setState( {
          action,
          wallet: walletData,
          walletBalance: balance,
          peer,
          privateKey,
          publicKey,
          myPublicKey,
          joinLink: `${location.origin}${links.multisign}/btc/connect/${myPublicKey}`,
        })
        actions.ipfs.onReady( () => {
          this.setState({
            addWalletEnabled: true,
          })
        })
      } else {
        this.props.history.push(localisedUrl(links.notFound))
      }
    }
    if (action === 'confirm') {
      if (data && data.length) {
        try {
          this.setState({
            action,
            txData: await actions.btcmultisig.parseRawTX(data),
            txRaw: data,
          })
        } catch (e) {
          console.log('Bad tx raw data')
        }
      }
    }
    console.log('Btc mulsign processor')
    console.log('action',action)
    console.log('data',data)
    console.log('peer',peer)
  }

  async componentWillUnmount() {
    SwapApp.shared().services.room.unsubscribe('btc multisig join ready', this.handleOnlineWalletConnect)
    clearTimeout(this.timerWaitOnlineJoin)
  }

  connectWallet = (action) => {
    const { privateKey, publicKey } = this.state
    localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, publicKey)
    actions.btcmultisig.login_USER(privateKey, publicKey)

    this.setState({
      action: (action === 'join') ? 'linkready' : 'ready'
    })
  }

  handleOnlineWalletConnect = async (_data) => {
    console.log('btc multisig join ready', _data)
    const { fromPeer, data } = _data
    const { peer } = this.state
    if ( fromPeer === peer ) {
      SwapApp.shared().services.room.unsubscribe('btc multisig join ready', this.handleOnlineWalletConnect)
      clearTimeout(this.timerWaitOnlineJoin)
      this.connectWallet('ready')
    }
  }

  handleAddWallet = async() => {
    const { action, myPublicKey, publicKey, peer } = this.state

    //If peer is online - try connect via ipfs

    this.setState({
      waitCreateWallet: true
    })

    actions.ipfs.waitPeer(
      peer,
      () => {
        this.setState({
          action: 'onlinejoin',
        })
        SwapApp.shared().services.room.subscribe('btc multisig join ready', this.handleOnlineWalletConnect)
        SwapApp.shared().services.room.sendMessagePeer( peer, {
          event: 'btc multisig join',
          data: {
            publicKey: myPublicKey,
            checkKey: publicKey,
          }
        })
        this.timerWaitOnlineJoin = setTimeout( () => {
          SwapApp.shared().services.room.unsubscribe('btc multisig join ready', this.handleOnlineWalletConnect)
          console.log('online join failed - timeout')
          this.connectWallet(action)
        }, 10000)
      },
      () => {
        this.connectWallet(action)
      },
      10000
    )
  }

  handleGoToWallet = async() => {
    this.props.history.push(localisedUrl(links.currencyWallet))
  }

  handleConfirm = async() => {
    const { txRaw } = this.state
    this.setState( { isConfirming : true } )
    const signedTX = await actions.btcmultisig.signMultiSign( txRaw )
    const txID = await actions.btcmultisig.broadcastTx( signedTX )
    this.setState( {
      txID,
      action: 'confirmready',
    } )
  }

  render() {
    const { action } = this.state

    const { wallet, walletBalance, joinLink, addWalletEnabled, waitCreateWallet } = this.state
    
    const { debugShowTXB, debugShowInput, debugShowOutput } = this.state

    return (
      <section>
        { (action === 'onlinejoin') &&
        <Fragment>
          <h1>Create BTC-multisignature wallet</h1>
          <h3>Wait other side...</h3>
        </Fragment>
        }
        { (action === 'join' || action === 'connect') && 
        <Fragment>
          <h1>Create BTC-multisignature wallet</h1>
          
          <div>
            <label>Wallet address:</label>
            <strong>{wallet.address}</strong>
          </div>
          <div>
            <label>Wallet balance:</label>
            <strong>{walletBalance} BTC</strong>
          </div>
          { addWalletEnabled ?
              waitCreateWallet ?
              <Button brand>Please wait...</Button>
              :
              <Button brand onClick={this.handleAddWallet}>Add wallet</Button>
            :
            <Button brand>Loading... Please wait</Button>
          }
        </Fragment>
        }
        { (action=='confirm') && 
        <Fragment>
          <h1>Confirm BTC-multisignature transaction</h1>
          <h3><button onClick={ () => { this.setState({debugShowTXB: !debugShowTXB}) } }>Toggle TXB</button></h3>
          {debugShowTXB &&
          <pre>
            <code>
              {
                JSON.stringify(this.state.txData.txb, false, 4)
              }
            </code>
          </pre>
          }
          <h3><button onClick={ () => { this.setState({debugShowInput: !debugShowInput}) } }>Toggle Inputs</button></h3>
          {debugShowInput &&
          <pre>
            <code>
              {
                JSON.stringify(this.state.txData.input, false, 4)
              }
            </code>
          </pre>
          }
          <h3><button onClick={ () => { this.setState({debugShowOutput: !debugShowOutput}) } }>Toggle Outputs</button></h3>
          {debugShowOutput &&
          <pre>
            <code>
              {
                JSON.stringify(this.state.txData.output, false, 4)
              }
            </code>
          </pre>
          }
          <div>
            <Button brand onClick={this.handleConfirm}>Confirm transaction</Button>
          </div>
        </Fragment>
        }
        { (action === 'confirmready') && 
        <Fragment>
          <h1>Confirm BTC-multisignature transaction</h1>
          <h2>Ready</h2>
          <div>
            <Button brand onClick={this.handleGoToWallet}>Ready. Go to wallet</Button>
          </div>
          <pre>
            <code>
              {
                JSON.stringify(this.state.txID, false, 4)
              }
            </code>
          </pre>
          
        </Fragment>
        }
        { (action === 'linkready' || action === 'ready') && 
        <Fragment>
          <h1>Create BTC-multisignature wallet</h1>
          { action === 'linkready' && <h2>Wallet created. Send this link to other owner for confirm</h2> }
          { action === 'ready' && <h2>Wallet created.</h2> }
          { action === 'linkready' && <span>{joinLink}</span> }
          <div>
            <Button brand onClick={this.handleGoToWallet}>Ready. Go to wallet</Button>
          </div>
        </Fragment>
        }
      </section>
    )
  }
}
