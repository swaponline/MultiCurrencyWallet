import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'

import bell from './images/avatar.jpg'
import styles from './UserAvatar.scss'
import CSSModules from 'react-css-modules'


@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class UserAvatar extends Component {

  static propTypes = {
    feeds: PropTypes.array.isRequired,
    soundClick: PropTypes.func.isRequired,
    changeView: PropTypes.func.isRequired,
  }

  static defaultProps = {
    feeds: [],
  }

  state = {
    feeds: null,
    animation: 'user',
  }

  handleClick = () => {
    const { isToggle } = this.props

    isToggle()
    this.setState({
      animation: 'user',
    })
  }

  componentWillReceiveProps(nextProps) {
    let { feeds, soundClick, changeView, history, getInfoBySwapId } = this.props
    const path = history.location.pathname.split('/')[1]

    if (path === 'swaps') {
      const swapId = history.location.pathname.split('/')[3]
      const swapInfo = getInfoBySwapId(swapId)

      if (!swapInfo.isFinished) {
        soundClick = () => {}
        feeds.forEach(offer => {
          const { id, peer } = offer

          if (id === swapId) {
            this.props.declineRequest(id, peer)
            changeView()
            return
          }

          offer.request.forEach(request => {
            this.props.declineRequest(id, request.participant.peer)
          })
        })
      }
    }

    if (nextProps.feeds.length > feeds.length) {
      changeView()

      this.setState({
        feeds: nextProps.feeds,
        animation: 'user shake new',
      })

      setTimeout(() => {
        this.setState({
          animation: 'user new',
        })
      }, 820)

      soundClick()
    }
  }


  render() {
    const { animation } = this.state

    return (
      <div styleName={animation} onClick={this.handleClick} >
        <img styleName="bell" src={bell} alt="Bell" />
      </div>
    )
  }
}
