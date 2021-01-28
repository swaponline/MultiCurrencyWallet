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
@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class RowFeeds extends Component<any, any> {

  static propTypes = {
    row: PropTypes.object,
  }

  generateLink = () => {
    const { intl: { locale }, row: { buyCurrency, sellCurrency, id } } = this.props

    const market = `${buyCurrency}-to-${sellCurrency}`.toLowerCase()
    const url = `${config.base}#${links.exchange}/${market}/${id}`
    return url
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
        <td styleName="with-icon">
          <Coins names={[sellCurrency, buyCurrency]} size={25} />
          {isTurbo &&
            <TurboIcon />
          }
        </td>
        <td>
          <span styleName="value">{sellAmount.toFixed(5)}</span>
          {' '}
          <span styleName="currency">{sellCurrency}</span>
        </td>
        <td>
          <span styleName="value">{buyAmount.toFixed(5)}</span>
          {' '}
          <span styleName="currency">{buyCurrency}</span>
        </td>
        <td>
          <span styleName="value">{rate.toFixed(5)}</span>
          {' '}
          <span styleName="currency">{`${buyCurrency}/${sellCurrency}`}</span>
        </td>
        <td>
          <div styleName="buttons">
            <div>
              <Copy text={this.generateLink()}>
                <div styleName="circle">
                  <img src={ShareImg} styleName="img" alt="share" />
                </div>
              </Copy>
            </div>
            {Boolean(requests && requests.length) ?
              <div>
                <div styleName="delete" onClick={() => declineRequest(id, requests[0].participant.peer)} >
                  <FormattedMessage id="RowFeeds77" defaultMessage="Decline" />
                </div>
                <Link to={swapUri}>
                  <div styleName="accept" onClick={() => acceptRequest(id, requests[0].participant.peer)} >
                    <FormattedMessage id="RowFeeds81" defaultMessage="Accept" />
                  </div>
                </Link>
              </div>
              :
              <RemoveButton className="removeButton" onClick={() => removeOrder(id)} />
            }
          </div>
        </td>
      </tr>
    )
  }
}
