import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import PropTypes from 'prop-types'
import { swapApp } from 'instances/swap'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import Coins from 'components/Coins/Coins'
import RequestButton from '../RequestButton/RequestButton'
import RemoveButton from '../RemoveButton/RemoveButton'


export default class Row extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  removeOrder = (orderId) => {
    swapApp.removeOrder(orderId)
    actions.feed.deleteItemToFeed(orderId)

    this.props.update()
  }

  sendRequest = (orderId) => {
    const order = swapApp.orderCollection.getByKey(orderId)

    order.sendRequest((isAccepted) => {
      console.log(`user ${order.owner.peer} ${isAccepted ? 'accepted' : 'declined'} your request`)
    })

    this.props.update()
  }

  render() {
    const { row } = this.props

    if (row === undefined) {
      return null
    }

    const { id, buyCurrency, sellCurrency, buyAmount, sellAmount, isRequested,
      owner :{  peer: ownerPeer, reputation } } = row
    const mePeer = swapApp.storage.me.peer

    return (
      <tr>
        <td>
          <Coins names={[buyCurrency, sellCurrency]}  />
        </td>
        <td>
          {`${buyCurrency.toUpperCase()} ${buyAmount}`}
        </td>
        <td>
          {`${sellCurrency.toUpperCase()} ${sellAmount}`}
        </td>
        <td>
          { reputation }
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
                      <Link to={`${links.swap}/${id}`}> Go to the swap</Link>
                    </Fragment>
                  ) : (
                    <Link to={`${links.swap}/${id}`}>
                      <RequestButton sendRequest={() => this.sendRequest(id)} />
                    </Link>
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

