import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'

import helpers, { constants, links } from 'helpers'
import { Link } from 'react-router-dom'
import actions from 'redux/actions'

import styles from './UserTooltip.scss'
import CSSModules from 'react-css-modules'
import ArrowRightSvg from './images/arrow-right.svg'
import { BigNumber } from 'bignumber.js'

import { TimerButton } from 'components/controls'
import { FormattedMessage } from 'react-intl'

import config from 'app-config'


@connect(({
  user: { ethData, btcData, ghostData, nextData, tokensData },
}) => ({
  currenciesData: [ethData, btcData, ghostData, nextData],
  tokensData: [...Object.keys(tokensData).map(k => (tokensData[k]))],
}))
@CSSModules(styles)
export default class UserTooltip extends Component {

  static propTypes = {
    feeds: PropTypes.array.isRequired,
    peer: PropTypes.string.isRequired,
    declineRequest: PropTypes.func.isRequired,
    acceptRequest: PropTypes.func.isRequired,
  }

  constructor({ tokensData, currenciesData }) {

    super()

    const allCurrencyies = currenciesData.concat(tokensData)
    const estimatedFeeValues = {}

    this.state = {
      allCurrencyies,
      estimatedFeeValues,
    }
  }

  componentDidMount() {
    this.setEstimatedFeeValues(this.state.estimatedFeeValues)
  }

  setEstimatedFeeValues = async (estimatedFeeValues) => {
    const fee = await helpers.estimateFeeValue.setEstimatedFeeValues({ estimatedFeeValues })

    return this.setState({
      estimatedFeeValues: fee,
    })
  }

  removeOrder = (id, peer) => {
    this.props.declineRequest(id, peer)
    actions.core.deletedPartialCurrency(id)
    actions.core.removeOrder(id)
    actions.core.updateCore()
  }


  render() {
    const { feeds, peer: mePeer } = this.props

    const autoAcceptTimeout = (config && config.isWidgetBuild) ? 30 : 15
    return !!feeds.length && (
      <div styleName="column" >
        {feeds.length < 3 ? (
          feeds.map(row => {
            const { request, content: { buyAmount, buyCurrency, sellAmount, sellCurrency }, id, peer: ownerPeer } = row
            const currencyBalance = this.state.allCurrencyies.find(item => item.currency === sellCurrency).balance
            const sellAmountPlusFee = BigNumber(this.state.estimatedFeeValues[sellCurrency.toLowerCase()]).plus(sellAmount)

            // if (BigNumber(sellAmountPlusFee).isGreaterThan(currencyBalance)) {
            //   this.removeOrder(id, request[0].participant.peer)
            //   return console.warn(`Not enought money for the swap, order № ${id} was deleted`)
            // }

            return (
              mePeer === ownerPeer &&
              request.map(({ participant: { peer }, reputation }) => (
                <div styleName="userTooltip" >
                  <div key={peer}>
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
                  <div styleName="checked" onClick={() => this.props.acceptRequest(id, peer, `${links.swap}/${sellCurrency}-${buyCurrency}/${id}`)} />
                  <TimerButton
                    timeLeft={autoAcceptTimeout}
                    isButton={false}
                    onClick={() => this.props.acceptRequest(id, peer, `${links.swap}/${sellCurrency}-${buyCurrency}/${id}`)}
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
