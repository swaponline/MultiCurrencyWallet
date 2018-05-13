import React from 'react'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'

import { SwapApp } from 'SwapCore'

import Header from './Header/Header'
import Loader from './Loader/Loader'

import ModalsContainer from '../containers/ModalsContainer'
import User from '../instances/user'

const app = window.app = new SwapApp({
    me: {
        reputation: 0,
        eth: {
            address: '0x0',
            publicKey: '0x0',
        },
        btc: {
            address: '0x0',
            publicKey: '0x0',
        },
    },
    config: {
        ipfs: {
            Addresses: {
                Swarm: [
                    '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
                ],
            },
        },
    },
})

class Root extends React.Component {

    componentWillMount() {
        User.getData()
        .then(data => this.props.addWallet(data))
            .then( data => console.log('Wallet data loaded!\n' + data) )

        User.getTransactions()
            .then(data => this.props.getHistory(data))

        this.props.updateLoader()

        // setTimeout(() => {
        //     this.props.updateLoader()
        // }, 4000)
    }
    
    render() {
        const { history, children, store, loader } = this.props
        return(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                { loader === true ? 
                    <Loader /> 
                        :
                    <main className="main" id="main">
                        <Header />
                        { children }
                        <ModalsContainer />
                    </main> 
                }
                </ConnectedRouter>
            </Provider>
        )
    }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
}

export default Root