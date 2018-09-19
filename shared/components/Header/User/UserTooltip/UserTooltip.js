import React, { Component } from 'react'
import { connect } from 'redaction'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'

import { TimerButton } from 'components/controls'

import actions from 'redux/actions'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './UserTooltip.scss'

import ArrowRightSvg from './images/arrow-right.svg'


@withRouter
@connect({
  feeds: 'feeds.items',
  peer: 'ipfs.peer',
})
@CSSModules(styles)
export default class UserTooltip extends Component {

  static propTypes = {
    toggle: PropTypes.func,
  }

  declineRequest = (orderId, participantPeer) => {
    actions.core.declineRequest(orderId, participantPeer)
    actions.core.updateCore()
  }

  acceptRequest = (orderId, participantPeer) => {
    const { toggle } = this.props

    actions.core.acceptRequest(orderId, participantPeer)
    actions.core.updateCore()
    !!toggle && toggle()
  }

  autoAcceptRequest = (orderId, participantPeer, link) => {
    this.acceptRequest(orderId, participantPeer)
    this.props.history.push(link)
  }

  render() {
    const { feeds, peer: mePeer } = this.props

    return !!feeds.length && (
      <div styleName="column" >
        { feeds.length < 3  ? (
          feeds.map(row => {
            const { request, content: { buyAmount, buyCurrency, sellAmount, sellCurrency }, id, peer: ownerPeer } = row

            return (
              mePeer === ownerPeer &&
              request.map(({ peer, reputation }) => (
                <div styleName="userTooltip" >
                  <div key={peer}>
                    <div styleName="title">User with <b>{reputation}</b> reputation wants to swap</div>
                    <div styleName="currency">
                      <span>{buyAmount.toFixed(5)} <span styleName="coin">{buyCurrency}</span></span>
                      <span styleName="arrow"><img src={ArrowRightSvg} alt="" /></span>
                      <span>{sellAmount.toFixed(5)} <span styleName="coin">{sellCurrency}</span></span>
                    </div>
                  </div>
                  <span styleName="decline" onClick={() => this.declineRequest(id, peer)} />
                  <Link to={`${links.swap}/${sellCurrency}-${buyCurrency}/${id}`}>
                    <div styleName="checked" onClick={() => this.acceptRequest(id, peer)} />
                  </Link>
                  <TimerButton isButton={false} onClick={() => this.autoAcceptRequest(id, peer, `${links.swap}/${sellCurrency}-${buyCurrency}/${id}`)} />
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
  }
}
