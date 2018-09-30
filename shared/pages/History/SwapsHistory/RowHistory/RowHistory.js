import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment/moment'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './RowHistory.scss'

import Coins from 'components/Coins/Coins'
import Timer from 'pages/Swap/Timer/Timer'
import Avatar from 'components/Avatar/Avatar'


const RowHistory = ({ row }) => {

  if (row === 'undefined') {
    return null
  }

  let { buyAmount, buyCurrency, sellAmount, btcScriptValues, usdtScriptValues, isRefunded, isMy, sellCurrency, isFinished, id, scriptValues } = row

  const values = btcScriptValues || usdtScriptValues || scriptValues

  const lockDateAndTime = moment.unix(values.lockTime).format('HH:mm:ss DD/MM/YYYY')

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
          btcScriptValues && !isRefunded && !isFinished ? (
            <Timer
              lockTime={btcScriptValues.lockTime * 1000}
              enabledButton={() => {}}
            />
          ) : (
            <span>Refund not available</span>
          )
        }
      </td>
      <td>
        { isFinished ? 'Finished' : 'Uncompleted' }
      </td>
      <td>
        { lockDateAndTime.split(' ').map((item, key) => <Fragment key={key}>{item}<br /></Fragment>) }
      </td>
      <td>
        {
          isMy ? (
            <Link to={`${links.swap}/${sellCurrency}-${buyCurrency}/${id}`}>Link to the swap</Link>
          ) : (
            <Link to={`${links.swap}/${buyCurrency}-${sellCurrency}/${id}`}>Link to the swap</Link>
          )
        }
      </td>
    </tr>
  )
}

RowHistory.propTypes = {
  row: PropTypes.object,
}

export default CSSModules(RowHistory, styles, { allowMultiple: true })
