import React, { Component } from 'react'
import PropTypes from 'prop-types'

import config from 'app-config'
import { links } from 'helpers'
import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'

import styles from './RowFeeds.scss'
import CSSModules from 'react-css-modules'
import ShareImg from './images/share-alt-solid.svg'

import Coins from 'components/Coins/Coins'


@CSSModules(styles, { allowMultiple: true })
export default class RowFeeds extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  state = {
    isLinkCopied: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState()
    }
  }

  handleCopyLink = () => {
    this.setState({
      isLinkCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isLinkCopied: false,
        })
      }, 500)
    })
  }

  render() {
    const { isLinkCopied } = this.state
    const { row: { requests, buyAmount, buyCurrency, sellAmount, sellCurrency, exchangeRate, id }, declineRequest, acceptRequest, removeOrder } = this.props

    return (
      <tr>
        <td>
          <Coins names={[buyCurrency, sellCurrency]}  />
        </td>
        <td>{`${buyAmount.toFixed(5)} ${buyCurrency}`}</td>
        <td>{`${sellAmount.toFixed(5)} ${sellCurrency}`}</td>
        <td>{`${(exchangeRate || (buyAmount / sellAmount)).toFixed(5)} ${buyCurrency}/${sellCurrency}`}</td>
        <CopyToClipboard
          onCopy={this.handleCopyLink}
          text={`${config.base}${buyCurrency.toLowerCase()}-${sellCurrency.toLowerCase()}/${id}`}
        >
          <td style={{ position: 'relative', cursor: 'pointer' }}>
            { isLinkCopied && <span style={{ fontSize: '12px', position: 'absolute', top: '8px', left: 'calc(20%)' }}> Copied <br /></span>  }
            <img src={ShareImg} styleName="img" alt="share" /><span>Share</span>
          </td>
        </CopyToClipboard>
        <td>
          {
            Boolean(requests && requests.length) ? (
              <div styleName="buttons">
                <div styleName="delete" onClick={() => declineRequest(id, requests[0].peer)} >Decline</div>
                <Link to={`${links.swap}/${sellCurrency.toLowerCase()}-${buyCurrency.toLowerCase()}/${id}`}>
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
