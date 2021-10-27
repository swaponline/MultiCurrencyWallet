import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import styles from './UserTooltip.scss'
import CSSModules from 'react-css-modules'
import ArrowRightSvg from './images/arrow-right.svg'

import { TimerButton } from 'components/controls'
import { FormattedMessage } from 'react-intl'

@CSSModules(styles)
export default class UserTooltip extends Component<any, any> {

  static propTypes = {
    feeds: PropTypes.array.isRequired,
    peer: PropTypes.string.isRequired,
    declineRequest: PropTypes.func.isRequired,
    acceptRequest: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
  }

  render() {
    const { feeds, peer: mePeer } = this.props

    const autoAcceptTimeout = 3

    return !!feeds.length && (
      <div styleName="column">
        {feeds.length < 3 ? (
          feeds.map(row => {
            const { request, content: { buyAmount, buyCurrency, sellAmount, sellCurrency }, id, isTurbo, peer: ownerPeer } = row

            const swapUri = isTurbo ?
              `${links.turboSwap}/${id}`
              :
              `${links.atomicSwap}/${id}`

            return (
              mePeer === ownerPeer &&
              request.map(({ participant: { peer }, reputation }) => (
                <div styleName="userTooltip" key={id}>
                  <div>
                    <div styleName="title">
                      <FormattedMessage
                        id="userTooltip43"
                        defaultMessage="User ({reputation}) wants to swap"
                        values={{ reputation: <b>{Number.isInteger(reputation) ? reputation : '?'}</b> }}
                      />
                    </div>
                    <div styleName="currency">
                      <span>{buyAmount.toFixed(5)} <span styleName="coin">{buyCurrency}</span></span>
                      <span styleName="arrow"><img src={ArrowRightSvg} alt="" /></span>
                      <span>{sellAmount.toFixed(5)} <span styleName="coin">{sellCurrency}</span></span>
                    </div>
                  </div>
                  <span styleName="decline" onClick={() => this.props.declineRequest(id, peer)} />
                  <div styleName="checked" onClick={() => this.props.acceptRequest(id, peer, swapUri)} />
                  <TimerButton
                    timeLeft={autoAcceptTimeout}
                    isButton={false}
                    onClick={() => this.props.acceptRequest(id, peer, swapUri)}
                  />
                </div>
              ))
            )
          })
        ) : (
            <div styleName="feed" >
              <Link to={links.feed} >
                <FormattedMessage id="userTooltip71" defaultMessage="Go to the feed page" />
              </Link>
            </div>
          )
        }
      </div>
    )
  }
}
