import React from 'react'
import PropTypes from 'prop-types'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './RowFeeds.scss'

import Coins from 'components/Coins/Coins'


const RowFeeds = ({ row, mePeer, acceptRequest, declineRequest, removeOrder }) => {

  if (row === 'undefined') {
    return null
  }

  const { requests, buyAmount, buyCurrency, sellAmount, sellCurrency, exchangeRate, id } = row

  return (
    <tr>
      <td>
        <Coins names={[buyCurrency, sellCurrency]}  />
      </td>
      <td>{`${buyAmount.toFixed(5)} ${buyCurrency}`}</td>
      <td>{`${sellAmount.toFixed(5)} ${sellCurrency}`}</td>
      <td>
        <a href={`${links.swap}/${sellCurrency}-${buyCurrency}/${id}`} >Link on swap</a>
      </td>
      <td>{`${(exchangeRate || (buyAmount/sellAmount)).toFixed(5)} ${buyCurrency}/${sellCurrency}`}</td>
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

RowFeeds.propTypes = {
  row: PropTypes.object,
}

export default CSSModules(RowFeeds, styles, { allowMultiple: true })

// mePeer === ownerPeer && (
//   <div styleName="userTooltip" key={id}>
//     <div styleName="currency">
//       <span><span styleName="coin">{buyCurrency}</span> {buyAmount.toNumber().toFixed(5)}</span>
//       <span styleName="arrow"><img src={ArrowRightSvg} alt="" /></span>
//       <span> <span styleName="coin">{sellCurrency}</span> {sellAmount.toNumber().toFixed(5)} </span>
//     </div>
//     {
//       Boolean(requests && requests.length) ? (
//         <div styleName="buttons">
//           <div styleName="delete" onClick={() => declineRequest(id, requests[0].peer)} >Decline</div>
//           <Link to={`${links.swap}/${sellCurrency}-${buyCurrency}/${id}`}>
//             <div styleName="accept" onClick={() => acceptRequest(id, requests[0].peer)} >Accept</div>
//           </Link>
//         </div>
//       ) : (
//         <div styleName="delete" onClick={() => removeOrder(id)} > Delete order</div>
//       )
//     }
//   </div>
// )
