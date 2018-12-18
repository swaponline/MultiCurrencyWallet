import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment/moment'

import { links } from 'helpers'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './RowHistory.scss'

import Coins from 'components/Coins/Coins'
import Timer from 'pages/Swap/Timer/Timer'
import Avatar from 'components/Avatar/Avatar'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'


@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class RowHistory extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  handleGetFlow = (timeLeft) => {
    let { row: { id } } = this.props

    if (timeLeft > 0) {
      return
    }

    const { flow } = actions.core.getSwapById(id)
    const { state: {
      isFinished, isRefunded,
      refundTransactionHash, refundTxHex,
    } } = flow

    if (isFinished
      && !isRefunded
      && !refundTransactionHash
      && !refundTxHex) {
      return
    }

    flow.tryRefund()
    localStorage.setItem(`flow.${id}`, flow.state)
  }

  componentDidMount() {
    const {
      btcScriptValues, ltcScriptValues,
      usdtScriptValues, scriptValues,
    } = this.props.row

    const values  = btcScriptValues
      || ltcScriptValues
      || usdtScriptValues
      || scriptValues

    const lockTime = values.lockTime * 1000

    const dateNow = new Date().getTime()
    const timeLeft = lockTime - dateNow

    this.handleGetFlow(timeLeft)
  }


  render() {

    const { row, intl: { locale } } = this.props

    if (row === 'undefined') {
      return null
    }

    let {
      buyAmount, buyCurrency, sellAmount, btcScriptValues, balance,
      ltcScriptValues, usdtScriptValues, isRefunded, isMy, sellCurrency,
      isFinished, id, scriptValues,
    } = row

    console.log('row', row)

    const values  = btcScriptValues || ltcScriptValues || usdtScriptValues || scriptValues
    const data = Date.now() / 1000

    if (!values) {
      return
    }

    const lockDateAndTime = moment.unix(values.lockTime || data).format('HH:mm:ss DD/MM/YYYY')

    buyAmount   = Number(buyAmount)
    sellAmount  = Number(sellAmount)

    return (
      <tr>
        <td>
          <Avatar
            value={id}
          />
        </td>
        <td>
          <Coins names={[buyCurrency, sellCurrency]}  />
        </td>
        <td>
          {
            isMy ? (
              `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`
            ) : (
              `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`
            )
          }
        </td>
        <td>
          {
            isMy ? (
              `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`
            ) : (
              `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`
            )
          }
        </td>
        <td>
          { (sellAmount / buyAmount).toFixed(5) }{ ` ${sellCurrency}/${buyCurrency}`}
        </td>
        <td>
          {
            values && !isRefunded && !isFinished && balance > 0 ? (
              <Timer
                lockTime={values.lockTime * 1000}
                enabledButton={this.handleGetFlow}
              />
            ) : (
              <FormattedMessage id="RowHistory76" defaultMessage="Refund not available" />
            )
          }
        </td>
        <td>
          { isFinished ?
            <FormattedMessage id="RowHistory94" defaultMessage="Finished" />
            :
            <FormattedMessage id="RowHistory96" defaultMessage="Uncompleted" />
          }
        </td>
        <td>
          { lockDateAndTime.split(' ').map((item, key) => <Fragment key={key}>{item}<br /></Fragment>) }
        </td>
        <td>
          {
            isMy ? (
              <Link to={`${localisedUrl(locale, links.swap)}/${sellCurrency}-${buyCurrency}/${id}`}>
                <FormattedMessage id="RowHistory91" defaultMessage="Link to the swap" />
              </Link>
            ) : (
              <Link to={`${localisedUrl(locale, links.swap)}/${buyCurrency}-${sellCurrency}/${id}`}>
                <FormattedMessage id="RowHistory95" defaultMessage="Link to the swap" />
              </Link>
            )
          }
        </td>
      </tr>
    )
  }
}
