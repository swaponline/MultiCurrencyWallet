import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import PropTypes from 'prop-types'
import { swapApp } from 'instances/swap'

import { Link } from 'react-router-dom'
import { links } from 'helpers'

import Coins from 'components/Coins/Coins'
import RequestButton from '../RequestButton/RequestButton'
import RemoveButton from '../RemoveButton/RemoveButton'


export default class Row extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  componentWillMount() {
    swapApp.on('new order request', this.updateOrders)
  }

  componentWillUnmount() {
    swapApp.off('new order request', this.updateOrders)
  }

  updateOrders = () => {
    actions.swap.update()
  }

  removeOrder = (id) => {
    actions.swap.remove(id)
  }

  sendRequest = (id) => {
    actions.swap.sendRequest(id)
  }

  render() {
    const { row } = this.props

    if (row === undefined) {
      return null
    }

    const { id, buyCurrency, requests, sellCurrency, buyAmount, sellAmount, isRequested,
      owner :{  peer: ownerPeer, reputation } } = { ...row }
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
              <Fragment>
                {
                  Boolean(requests && requests.length) ? (
                    <Link to={links.feed} >Go to the swap</Link>
                  ) : (
                    <RemoveButton removeOrder={() => this.removeOrder(id)} />
                  )
                }
              </Fragment>
            ) : (
              <Fragment>
                {
                  isRequested ? (
                    <div style={{ color: 'red' }}>REQUESTING</div>
                  ) : (
                    <RequestButton sendRequest={() => this.sendRequest(id)} />
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

