import React from 'react'
import PropTypes from 'prop-types'
import config from 'app-config'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './RowHistory.scss'

import Coins from 'components/Coins/Coins'


const RowHistory = ({ row }) => {

  if (row === 'undefined') {
    return null
  }
  console.log(row)

  const { buyAmount, buyCurrency, sellAmount, isProcessing, sellCurrency, isMy,  id } = row

  return (
    <tr>
      <td>
        <Coins names={[buyCurrency, sellCurrency]}  />
      </td>
      <td>
        {`${buyCurrency.toUpperCase()} ${buyAmount.toNumber().toFixed(3)}`}
      </td>
      <td>
        {`${sellCurrency.toUpperCase()} ${sellAmount.toNumber().toFixed(3)}`}
      </td>
      <td>
        { config.exchangeRates[`${buyCurrency.toLowerCase()}${sellCurrency.toLowerCase()}`] }
      </td>
      <td>
        { isProcessing ? 'Completed' : 'Uncompleted' }
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
