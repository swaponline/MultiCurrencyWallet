import React from 'react'

import PropTypes from 'prop-types'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './UserTooltip.scss'

import ArrowRightSvg from './images/arrow-right.svg'


const UserTooltip = ({ feeds, mePeer, acceptRequest }) => (
  <div styleName="column" >
    { feeds.length < 3  ? (
      feeds.map(row => {
        const { request, content: { buyAmount, buyCurrency, sellAmount, sellCurrency },  id, peer: ownerPeer } = row

        return (
          mePeer === ownerPeer &&
          request.map(({ peer, reputation }) => (
            <div styleName="userTooltip" >
              <div key={peer}>
                <div styleName="title">User with <b>{reputation}</b> reputation wants to swap</div>
                <div styleName="currency">
                  <span>{buyAmount} <span styleName="coin">{buyCurrency}</span></span>
                  <span styleName="arrow"><img src={ArrowRightSvg} alt="" /></span>
                  <span>{sellAmount} <span styleName="coin">{sellCurrency}</span></span>
                </div>
              </div>
              <Link to={`${links.swap}/${id}`}>
                <div styleName="checked" onClick={() => acceptRequest(id, peer)} />
              </Link>
            </div>
          ))
        )
      })
    ) : (
      <div styleName="feed" >
        <Link to={links.feed} > Go to the feed page</Link>
      </div>
    )}
  </div>
)


UserTooltip.propTypes = {
  feeds: PropTypes.array,
  mePeer: PropTypes.string,
  acceptRequest: PropTypes.func,
}

export default CSSModules(UserTooltip, styles, { allowMultiple: true })
