import React from 'react'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'

import { SwapApp } from 'SwapCore'

import Header from './Header/Header'
import Loader from './Loader/Loader'

import ModalsContainer from '../containers/ModalsContainer'
import User from '../instances/user'

let app = window.app

class Root extends React.Component {

    componentWillMount() {

        this.props.addWallet()
        this.props.getHistory()

        setTimeout(() => {
            this.props.updateLoader()
        }, 2000)

        app = new SwapApp({
            me: {
                reputation: 10,
                eth: {
                    address: User.ethData.address,
                    publicKey: User.ethData.publicKey,
                },
                btc: {
                    address: User.btcData.address,
                    publicKey: User.btcData.publicKey,
                },
            },
            config: {
                ipfs: {
                    Addresses: {
                        Swarm: [
                            '/dns4/discovery.libp2p.array.io/tcp/9091/wss/p2p-websocket-star/',
                        ],
                    },
                },
            },
        })

        app.on('ready', () => {
            console.log('swapApp ready')
            console.log('initial orders', app.getOrders())
        })

        app.on('user online', (peer) => {
            console.log('user online', peer)
        })

        app.on('user offline', (peer) => {
            console.log('user offline', peer)
        })

        app.on('new orders', (swaps) => {
            console.log('new orders', swaps)
        })

        app.on('new order', (swap) => {
            console.log('new order', swap)
        })

        app.on('remove order', (swap) => {
            console.log('remove order', swap)
        })

        app.on('new order request', ({ swapId, participant }) => {
            console.error(`user ${participant.peer} requesting swap`, {
                swap: app.orderCollection.getByKey(swapId),
                participant,
            })
        })
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