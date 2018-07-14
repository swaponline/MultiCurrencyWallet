import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import PropTypes from 'prop-types'
import SwapApp from 'swap.app'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import Coins from 'components/Coins/Coins'
import RequestButton from '../RequestButton/RequestButton'
import RemoveButton from 'components/controls/RemoveButton/RemoveButton'


export default class Row extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  state = {
    exchangeRate: null,
    balance: null,
    amount: null,
  }

  componentWillMount() {
    const { row } = this.props

    if (row === undefined) {
      return null
    }
    const { buyCurrency, sellCurrency, sellAmount, buyAmount, isMy } = row
    const amount = isMy ? buyAmount : sellAmount
    const currency = isMy ? buyCurrency : sellCurrency

    if (currency.toLowerCase() === 'eth') {
      actions.ethereum.getBalance()
        .then(balance => {
          this.setState({
            balance,
          })
        })
    } else {
      actions.bitcoin.getBalance()
        .then(balance => {
          this.setState({
            balance,
          })
        })
    }

    this.setState({
      amount: amount.toNumber(),
    })

    this.getExchangeRate(buyCurrency, sellCurrency)
  }

  getExchangeRate = (buyCurrency, sellCurrency) => {

    if (sellCurrency === 'noxon') {
      sellCurrency = 'eth'
    } else if (buyCurrency === 'noxon') {
      buyCurrency = 'eth'
    }

    actions.user.setExchangeRate(buyCurrency, sellCurrency)
      .then(exchangeRate => {
        this.setState({
          exchangeRate,
        })
      })
  }

  removeOrder = (orderId) => {
    SwapApp.services.orders.remove(orderId)
    actions.feed.deleteItemToFeed(orderId)

    this.props.update()
  }

  sendRequest = (orderId) => {
    const order = SwapApp.services.orders.getByKey(orderId)

    order.sendRequest((isAccepted) => {
      console.log(`user ${order.owner.peer} ${isAccepted ? 'accepted' : 'declined'} your request`)
    })

    this.props.update()
    // actions.analytics.dataEvent('orders-click-start-swap')
  }

  render() {
    const { row } = this.props
    const { exchangeRate, amount, balance } = this.state

    if (row === undefined) {
      return null
    }

    const { id, buyCurrency, sellCurrency, isMy, buyAmount, sellAmount, isRequested, owner :{  peer: ownerPeer } } = row
    const mePeer = SwapApp.services.room.peer

    return (
      <tr>
        <td>
          <Coins names={[buyCurrency, sellCurrency]}  />
        </td>
        <td>
          {
            isMy ? (
              `${buyCurrency.toUpperCase()} ${buyAmount}`
            ) : (
              `${sellCurrency.toUpperCase()} ${sellAmount}`
            )
          }
        </td>
        <td>
          {
            isMy ? (
              `${sellCurrency.toUpperCase()} ${sellAmount}`
            ) : (
              `${buyCurrency.toUpperCase()} ${buyAmount}`
            )
          }
        </td>
        <td>
          { exchangeRate}
        </td>
        <td>
          {
            mePeer === ownerPeer ? (
              <RemoveButton removeOrder={() => this.removeOrder(id)} />
            ) : (
              <Fragment>
                {
                  isRequested ? (
                    <Fragment>
                      <div style={{ color: 'red' }}>REQUESTING</div>
                      <Link to={`${links.swap}/${buyCurrency}-${sellCurrency}/${id}`}> Go to the swap</Link>
                    </Fragment>
                  ) : (
                    balance > amount ? (
                      <Link to={`${links.swap}/${buyCurrency}-${sellCurrency}/${id}`} >
                        <RequestButton sendRequest={() => this.sendRequest(id)} />
                      </Link>
                    ) : (
                      <span>Insufficient funds</span>
                    )
                  )
                }
              </Fragment>
            )
          }
        </td>
      </tr>
    )
  }
}
