import React, { Component } from 'react'
import PropTypes from 'prop-types'

import config from 'app-config'
import { links, constants } from 'helpers'
import { Link, withRouter } from 'react-router-dom'

import styles from './RowFeeds.scss'
import CSSModules from 'react-css-modules'
import ShareImg from './images/share-alt-solid.svg'

import Coins from 'components/Coins/Coins'
import Copy from 'components/ui/Copy/Copy'
import { RemoveButton } from 'components/controls'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import BigNumber from 'bignumber.js'
import TurboIcon from 'shared/components/ui/TurboIcon/TurboIcon'


@withRouter
@CSSModules(styles, { allowMultiple: true })
class RowFeeds extends Component<any, any> {

  static propTypes = {
    row: PropTypes.object,
  }

  generateOfferUrl = () => {
    const { row: { id } } = this.props

    const currentUrl = window.location.href

    const offerUrl = currentUrl.includes(`/${id}`) ?
      currentUrl // if already entered
      :
      `${currentUrl}/${id}`

    return offerUrl
  }

  renderCoinName(coin) {
    return coin.toUpperCase()
  }

  render() {
    const {
      row: { requests, buyAmount, buyCurrency, sellAmount, sellCurrency, exchangeRate, id, isTurbo },
      declineRequest, acceptRequest, removeOrder, intl: { locale },
    } = this.props

    const rate = exchangeRate ? new BigNumber(exchangeRate) : new BigNumber(buyAmount).div(sellAmount)

    const swapUri = isTurbo ?
      `${links.turboSwap}/${id}`
      :
      `${links.atomicSwap}/${id}`

    return (
      <tr key={this.props.key}>
        <td styleName="with-icon rowData">
          <Coins names={[sellCurrency, buyCurrency]} size={25} />
          {isTurbo &&
            <TurboIcon />
          }
        </td>
        <td styleName='rowData'>
          <span className='sellAmountOrders' styleName="value">{sellAmount.toFixed(5)}</span>
          {' '}
          <span styleName="currency">{this.renderCoinName(sellCurrency)}</span>
        </td>
        <td styleName='rowData'>
          <span className='buyAmountOrders' styleName="value">{buyAmount.toFixed(5)}</span>
          {' '}
          <span styleName="currency">{this.renderCoinName(buyCurrency)}</span>
        </td>
        <td styleName='rowData'>
          <span styleName="value">{rate.toFixed(5)}</span>
          {' '}
          <span styleName="currency">{`${this.renderCoinName(buyCurrency)}/${this.renderCoinName(sellCurrency)}`}</span>
        </td>
        <td styleName='rowData'>
          <div styleName="buttons">
            <div>
              <Copy text={this.generateOfferUrl()}>
                <div styleName="circle">
                  <img src={ShareImg} styleName="img" alt="share" />
                </div>
              </Copy>
            </div>
            {Boolean(requests && requests.length) ?
              <div>
                <div styleName="delete" onClick={() => declineRequest(id, requests[0].participant.peer)} >
                  <FormattedMessage id="RowHistoryCancelInvoice" defaultMessage="Decline" />
                </div>
                <Link to={swapUri}>
                  <div styleName="accept" onClick={() => acceptRequest(id, requests[0].participant.peer)} >
                    <FormattedMessage id="RowFeeds81" defaultMessage="Accept" />
                  </div>
                </Link>
              </div>
              : <RemoveButton onClick={() => removeOrder(id)} brand={true} />
            }
          </div>
        </td>
      </tr>
    )
  }
}

export default injectIntl(RowFeeds)
