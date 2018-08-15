import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './RowFeeds.scss'

import Coins from 'components/Coins/Coins'
import Identicon from 'components/Identicon/Identicon'
import Moment from 'react-moment';

@CSSModules(styles, { allowMultiple: true })
export default class RowFeeds extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState()
    }
  }

  render() {
    const { row: { requests, buyAmount, buyCurrency, sellAmount, sellCurrency, exchangeRate, id, createdAt }, declineRequest, acceptRequest, removeOrder } = this.props

    return (
      <tr>
        <td>
        <a href={`${links.swap}/${sellCurrency}-${buyCurrency}/${id}`} >
          <Identicon hash={id} />
        </a>
        </td>
        <td>
          <Coins names={[buyCurrency, sellCurrency]}  />
        </td>
        <td>{`${buyAmount.toFixed(5)} ${buyCurrency}`}</td>
        <td>{`${sellAmount.toFixed(5)} ${sellCurrency}`}</td>
        <td>{`${(exchangeRate || (buyAmount/sellAmount)).toFixed(5)} ${buyCurrency}/${sellCurrency}`}</td>
        <td>
          {
            Boolean(requests && requests.length) ? (
              <div styleName="buttons">
                <div styleName="delete" onClick={() => declineRequest(id, requests[0].peer)} >Decline</div>
                <Link to={`${links.swap}/${sellCurrency}-${buyCurrency}/${id}`}>
                  <div styleName="accept" onClick={() => acceptRequest(id, requests[0].peer)} >Accept</div>
                </Link>
              </div>
            ) : (
              <div styleName="delete" onClick={() => removeOrder(id)} > Delete order</div>
            )
          }
        </td>
        <td>
           { createdAt && <Moment fromNow ago>{createdAt}</Moment> }
           { !createdAt && 'A long time'} ago
        </td>
      </tr>
    )
  }
}
