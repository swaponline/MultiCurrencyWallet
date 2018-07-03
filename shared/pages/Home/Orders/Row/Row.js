import React, { Component, Fragment } from 'react'
import config from  'app-config'

import actions from 'redux/actions'
import PropTypes from 'prop-types'
import { swapApp } from 'instances/newSwap'

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
  }

  componentWillMount() {
    const { row } = this.props

    if (row === undefined) {
      return null
    }
    const { buyCurrency, sellCurrency } = row

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
    swapApp.services.orders.remove(orderId)
    actions.feed.deleteItemToFeed(orderId)

    this.props.update()
  }

  sendRequest = (orderId) => {
    const order = swapApp.services.orders.getByKey(orderId)

    order.sendRequest((isAccepted) => {
      console.log(`user ${order.owner.peer} ${isAccepted ? 'accepted' : 'declined'} your request`)

    })

    this.props.update()
  }

  render() {
    const { row } = this.props
    const { exchangeRate } = this.state

    if (row === undefined) {
      return null
    }

    const { id, buyCurrency, sellCurrency, buyAmount, sellAmount, isRequested,
      owner :{  peer: ownerPeer } } = row
    const mePeer = swapApp.services.room.peer

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
                    <Link to={`${links.swap}/${buyCurrency}-${sellCurrency}/${id}`}>
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
