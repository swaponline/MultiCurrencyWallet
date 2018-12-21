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
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'


@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class RowFeeds extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  state = {
    isLinkCopied: false,
    copyText: '',
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState()
    }
  }

  componentDidMount() {
    this.checkCopyText(this.state.copyText)
  }

  handleCopyLink = () => {
    this.checkCopyText(this.state.copyText)

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

checkCopyText = () => {
  const { row: { buyCurrency, sellCurrency, id } } = this.props
  const { copyText } = this.state
  if (buyCurrency.toLowerCase() === 'btc') {
    this.setState({ copyText: `${config.base}'btc'-${sellCurrency.toLowerCase()}/${id}` })
  } else {
    if (buyCurrency.toLowerCase() === 'usdt' && sellCurrency.toLowerCase() === 'btc'
      || buyCurrency.toLowerCase() === 'btc' && sellCurrency.toLowerCase() === 'usdt') {
      this.setState({ copyText:  `${config.base}'btc'-'usdt'/${id}` })
    } else {
      this.setState({ copyText: `${config.base}${buyCurrency.toLowerCase()}-${sellCurrency.toLowerCase()}/${id}` })
    }
  }
}

  render() {
    const { isLinkCopied, copyText} = this.state
    const { row: { requests, buyAmount, buyCurrency, sellAmount, sellCurrency, exchangeRate, id }, declineRequest, acceptRequest, removeOrder, intl: { locale } } = this.props
console.log('copyText', copyText)
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
          text={copyText}
        >
          <td style={{ position: 'relative', cursor: 'pointer' }}>
            { isLinkCopied &&
            <span style={{ fontSize: '12px', position: 'absolute', top: '8px', left: 'calc(20%)' }}>
              <FormattedMessage id="RowFeeds64" defaultMessage="Copied" />
              <br />
            </span>
            }
            <img src={ShareImg} styleName="img" alt="share" />
            <span>
              <FormattedMessage id="RowFeeds68" defaultMessage="Share" />
            </span>
          </td>
        </CopyToClipboard>
        <td>
          {
            Boolean(requests && requests.length) ? (
              <div styleName="buttons">
                <div styleName="delete" onClick={() => declineRequest(id, requests[0].participant.peer)} >
                  <FormattedMessage id="RowFeeds77" defaultMessage="Decline" />
                </div>
                <Link to={`${localisedUrl(locale, links.swap)}/${sellCurrency.toLowerCase()}-${buyCurrency.toLowerCase()}/${id}`}>
                  <div styleName="accept" onClick={() => acceptRequest(id, requests[0].participant.peer)} >
                    <FormattedMessage id="RowFeeds81" defaultMessage="Accept" />
                  </div>
                </Link>
              </div>
            ) : (
              <div styleName="delete" onClick={() => removeOrder(id)} >
                <FormattedMessage id="RowFeeds87" defaultMessage="Delete order" />
              </div>
            )
          }
        </td>
      </tr>
    )
  }
}
