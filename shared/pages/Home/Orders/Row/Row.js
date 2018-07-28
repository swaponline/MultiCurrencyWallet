import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import SwapApp from 'swap.app'
import actions from 'redux/actions'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import Coins from 'components/Coins/Coins'
import RequestButton from '../RequestButton/RequestButton'
import RemoveButton from 'components/controls/RemoveButton/RemoveButton'


export default class Row extends Component {

  static propTypes = {
    row: PropTypes.object,
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

    if (row === undefined) {
      return null
    }

    const { id, buyCurrency, sellCurrency, isMy, buyAmount, sellAmount, isRequested, exchangeRate, owner :{  peer: ownerPeer } } = row
    const mePeer = SwapApp.services.room.peer

    return (
      <tr>
        <td>
          <Coins names={[buyCurrency, sellCurrency]}  />
        </td>
        <td>
          {
            isMy ? (
              `${buyAmount.toFixed(5)} ${buyCurrency} `
            ) : (
              `${sellAmount.toFixed(5)} ${sellCurrency} `
            )
          }
        </td>
        <td>
          {
            isMy ? (
              `${sellAmount.toFixed(5)} ${sellCurrency} `
            ) : (
              `${buyAmount.toFixed(5)} ${buyCurrency} `
            )
          }
        </td>
        <td>
          {(exchangeRate || (buyAmount / sellAmount)).toFixed(5)}
          {
            buyCurrency === 'BTC' ? (
              `${sellCurrency}/${buyCurrency}`
            ) : (
              sellCurrency === 'BTC' ? (
                `${buyCurrency}/${sellCurrency}`
              ) : (
                `${sellCurrency}/${buyCurrency}`
              )
            )
          }
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
                    Boolean(true) ? (
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
