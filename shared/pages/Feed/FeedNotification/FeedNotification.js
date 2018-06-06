import React from 'react'

import PropTypes from 'prop-types'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './FeedNotificaton.scss'

import ArrowRightSvg from './images/arrow-right.svg'


const FeedNotificaton = ({ feeds, mePeer, acceptRequest }) => (
  feeds.map(row => {
    const { request, content: { buyAmount, buyCurrency, sellAmount, sellCurrency },  id, peer: ownerPeer } = row

    return (
      mePeer === ownerPeer &&
      request.map(({ peer, reputation }) => (
        <div styleName="userTooltip" key={id}>
          <div styleName="title">User with <b>{reputation}</b> reputation wants to swap </div>
          <div styleName="currency">
            <span>{buyAmount} <span styleName="coin">{buyCurrency}</span></span>
            <span styleName="arrow"><img src={ArrowRightSvg} alt="" /></span>
            <span>{sellAmount} <span styleName="coin">{sellCurrency}</span></span>
          </div>
          <Link to={`${links.swap}/${id}`}>
            <div styleName="withdrawButton" onClick={() => acceptRequest(id, peer)} >Accept</div>
          </Link>
        </div>
      ))
    )
  })
)


FeedNotificaton.propTypes = {
  orders: PropTypes.array,
  mePeer: PropTypes.string,
  acceptRequest: PropTypes.func,
}

export default CSSModules(FeedNotificaton, styles, { allowMultiple: true })
