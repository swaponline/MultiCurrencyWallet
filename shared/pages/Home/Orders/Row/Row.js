import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import { links, constants } from 'helpers'
import { Link, Redirect } from 'react-router-dom'

import Coins from 'components/Coins/Coins'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import RequestButton from '../RequestButton/RequestButton'
import RemoveButton from 'components/controls/RemoveButton/RemoveButton'
import Avatar from 'components/Avatar/Avatar'


@connect({
  peer: 'ipfs.peer',
})
export default class Row extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  state = {
    isFetching: false,
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

  handleGoTrade = async (currency) => {
    const balance = await actions.eth.getBalance()
    return (balance >= 0.005 || currency.toLowerCase() !== 'eos')
  }

  removeOrder = (orderId) => {
    actions.core.removeOrder(orderId)
    actions.core.updateCore()
  }

  sendRequest = async (orderId, currency) => {
    const check = await this.handleGoTrade(currency)

    if (check) {
      this.setState({ isFetching: true })

      actions.core.sendRequest(orderId, (isAccepted) => {
        console.log(`user has ${isAccepted ? 'accepted' : 'declined'} your request`)

        if (isAccepted) {
          this.setState({ redirect: true, isFetching: false })
        } else {
          this.setState({ isFetching: false })
        }

      })
    } else {
      actions.modals.open(constants.modals.EthChecker, {})
    }

    actions.core.updateCore()
  }

  render() {
    const { balance, isFetching } = this.state
    const { orderId, row: { id, buyCurrency, sellCurrency, isMy, buyAmount,
      sellAmount, isRequested, isProcessing,
      owner: {  peer: ownerPeer } }, peer } = this.props
    const amount = isMy ? sellAmount : buyAmount

    if (this.state.redirect) {
      return <Redirect push to={`${links.swap}/${buyCurrency}-${sellCurrency}/${id}`} />
    }

    return (
      <tr style={orderId === id ? { background: 'rgba(0, 236, 0, 0.1)' } : {}}>
        <td>
          <Avatar
            value={ownerPeer}
            size={45}
          />
        </td>
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
                    isProcessing ? (
                      <span>This order is in execution</span>
                    ) : (
                      isFetching ? (
                        <Fragment>
                          <InlineLoader />
                          <br />
                          <span>Please wait while we confirm your request</span>
                        </Fragment>
                      ) : (
                        <RequestButton disabled={balance >= Number(amount)} onClick={() => this.sendRequest(id, isMy ? sellCurrency : buyCurrency)} />
                      )
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
