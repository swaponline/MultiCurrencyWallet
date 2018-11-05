import React, { Component } from 'react'
import PropTypes from 'prop-types'

import config from 'app-config'
import { links } from 'helpers'
import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'

import styles from './RowFeedsMobile.scss'
import CSSModules from 'react-css-modules'
import ShareImg from './images/share-alt-solid.svg'

import Coins from 'components/Coins/Coins'


@CSSModules(styles, { allowMultiple: true })
export default class RowFeedsMoble extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  state = {
    isLinkCopied: false,
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
          <div styleName="bigContainer">
            <div styleName="tdContainer-1">
              <span styleName="firstType">You get</span>
              <span>{`${buyAmount.toFixed(5)} ${buyCurrency}`}</span>
            </div>
            <div><i class="fas fa-exchange-alt"></i></div>
            <div styleName="tdContainer-2">
              <span styleName="secondType">You have</span>
              <span>{`${sellAmount.toFixed(5)} ${sellCurrency}`}</span>
            </div>
          </div>
        </td>
        <CopyToClipboard
          onCopy={this.handleCopyLink}
          text={`${config.base}${buyCurrency.toLowerCase()}-${sellCurrency.toLowerCase()}/${id}`}
        >
          <td style={{ cursor: 'pointer' }}>
            { isLinkCopied && <span style={{ fontSize: '12px', position: 'absolute', top: '8px', left: 'calc(20%)' }}> Copied <br /></span>  }
            <img src={ShareImg} styleName="img" alt="share" />
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
              <div styleName="delete" onClick={() => removeOrder(id)} > <i class="fas fa-times-circle"></i> </div>
            )
          }
        </td>
      </tr>
    )
  }
}
