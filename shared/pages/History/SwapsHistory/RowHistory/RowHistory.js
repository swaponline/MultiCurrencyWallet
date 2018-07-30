import React from 'react'
import PropTypes from 'prop-types'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './RowHistory.scss'

import Coins from 'components/Coins/Coins'


const RowHistory = ({ row }) => {

  if (row === 'undefined') {
    return null
  }

  const { buyAmount, buyCurrency, sellAmount, isMy, sellCurrency, isFinished,  id } = row

  return (
    <tr>
      <td>
        <Coins names={[buyCurrency, sellCurrency]}  />
      </td>
      <td>
        {
          isMy ? (
            `${sellAmount} ${sellCurrency.toUpperCase()}`
          ) : (
            `${buyAmount} ${buyCurrency.toUpperCase()}`
          )
        }
      </td>
      <td>
        {
          isMy ? (
            `${buyAmount} ${buyCurrency.toUpperCase()}`
          ) : (
            `${sellAmount} ${sellCurrency.toUpperCase()}`
          )
        }
      </td>
      <td>
        { (sellAmount / buyAmount).toFixed(5) }{ ` ${sellCurrency}/${buyCurrency}`}
      </td>
      <td>
        { isFinished ? 'Finished' : 'Uncompleted' }
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
