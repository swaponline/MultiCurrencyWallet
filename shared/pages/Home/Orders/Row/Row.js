import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import Coins from 'components/Coins/Coins'
import RequestButton from '../RequestButton/RequestButton'
import RemoveButton from 'components/controls/RemoveButton/RemoveButton'


@connect({
  peer: 'ipfs.peer',
})
export default class Row extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  state = {
    balance: 0,
  }

  componentWillMount() {
    const { row: {  sellCurrency, isMy, buyCurrency } } = this.props
    if (isMy) {
      this.checkBalance(sellCurrency)
    } else {
      this.checkBalance(buyCurrency)
    }
  }

  checkBalance = async (currency) => {
    const balance = await actions[currency.toLowerCase()].getBalance(currency)

    this.setState({
      balance,
    })
  }

  removeOrder = (orderId) => {
    actions.core.removeOrder(orderId)
    actions.core.updateCore()
  }

  sendRequest = (orderId) => {
    actions.core.sendRequest(orderId)
    actions.core.updateCore()
  }

  render() {
    const { balance } = this.state
    const { orderId, row: { id, buyCurrency, sellCurrency, isMy, buyAmount,
      sellAmount, isRequested,
      owner :{  peer: ownerPeer } }, peer } = this.props
    const amount = isMy ? sellAmount : buyAmount

    return (
      <tr style={orderId === id ? { background: 'rgba(0, 236, 0, 0.1)' } : {}}>
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
          { buyAmount.dividedBy(sellAmount).toFixed(5) }
          {
            isMy ? (
              `${sellCurrency}/${buyCurrency}`
            ) : (
              `${buyCurrency}/${sellCurrency}`
            )
          }
        </td>
        <td>
          {
            peer === ownerPeer ? (
              <RemoveButton onClick={() => this.removeOrder(id)} />
            ) : (
              <Fragment>
                {
                  isRequested ? (
                    <Fragment>
                      <div style={{ color: 'red' }}>REQUESTING</div>
                      <Link to={`${links.swap}/${buyCurrency}-${sellCurrency}/${id}`}> Go to the swap</Link>
                    </Fragment>
                  ) : (
                    balance > Number(amount) ? (
                      <Link to={`${links.swap}/${buyCurrency}-${sellCurrency}/${id}`} >
                        <RequestButton onClick={() => this.sendRequest(id)} />
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
