import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './RowFeeds.scss'

import Coins from 'components/Coins/Coins'

import ShareImg from './images/share-alt-solid.svg'


@CSSModules(styles, { allowMultiple: true })
export default class RowFeeds extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  state = {
    viewText: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState()
    }
  }

  handleCopiedLink = (event) => {
    event.preventDefault()
    this.setState({ viewText: true })

    const el = document.createElement('textarea')
    el.value = this.linkText.href
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)

    setTimeout(() => {
      this.setState({ viewText: false })
    }, 800)
  }

  render() {
    const { viewText } = this.state
    const { row: { requests, buyAmount, buyCurrency, sellAmount, sellCurrency, exchangeRate, id }, declineRequest, acceptRequest, removeOrder } = this.props

    return (
      <tr>
        <td>
          <Coins names={[buyCurrency, sellCurrency]}  />
        </td>
        <td>{`${buyAmount.toFixed(5)} ${buyCurrency}`}</td>
        <td>{`${sellAmount.toFixed(5)} ${sellCurrency}`}</td>
        <td>{`${(exchangeRate || (buyAmount/sellAmount)).toFixed(5)} ${buyCurrency}/${sellCurrency}`}</td>
        <td style={{ position: 'relative' }}>
          { viewText && <span style={{ fontSize: '12px', position: 'absolute', top: '8px', left: 'calc(20%)' }}> Copied <br /></span>  }
          <a
            ref={a => this.linkText = a}
            onClick={this.handleCopiedLink}
            href={`${links.exchange}/${sellCurrency.toLowerCase()}-${buyCurrency.toLowerCase()}/${id}`}
            styleName="share"
          >
            <img src={ShareImg} styleName="img" alt="share" /><span>Share</span>
          </a>
        </td>
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
      </tr>
    )
  }
}
