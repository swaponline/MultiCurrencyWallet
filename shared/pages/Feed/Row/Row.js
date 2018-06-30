import React from 'react'
import PropTypes from 'prop-types'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './Row.scss'
import ArrowRightSvg from './images/arrow-right.svg'

import RemoveButton from 'components/controls/RemoveButton/RemoveButton'


const Row = ({ row, mePeer, acceptRequest, declineRequest, removeOrder }) => {

  if (row === 'undefined') {
    return null
  }

  const { requests, buyAmount, buyCurrency, sellAmount, sellCurrency,  id, owner: { peer: ownerPeer } } = row

  return (
    mePeer === ownerPeer && (
      <div styleName="userTooltip" key={id}>
        <div styleName="title">User with <b>10</b> reputation wants to swap </div>
        <div styleName="currency">
          <span>{buyAmount.toString()} <span styleName="coin">{buyCurrency}</span></span>
          <span styleName="arrow"><img src={ArrowRightSvg} alt="" /></span>
          <span>{sellAmount.toString()} <span styleName="coin">{sellCurrency}</span></span>
        </div>
        {
          requests.length > 0 ? (
            <div styleName="buttons">
              <div styleName="withdrawButton" onClick={() => declineRequest(id, requests[0].peer)} >Decline</div>
              <Link to={`${links.swap}/${sellCurrency}-${buyCurrency}/${id}`}>
                <div styleName="withdrawButton" onClick={() => acceptRequest(id, requests[0].peer)} >Accept</div>
              </Link>
            </div>
          ) : (
            <RemoveButton removeOrder={() => removeOrder(id)} />
          )
        }
      </div>
    )
  )
}

Row.propTypes = {
  row: PropTypes.object,
}

export default CSSModules(Row, styles)
