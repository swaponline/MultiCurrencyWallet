import React, { Component } from 'react'

import SwapApp from 'swap.app'

import CSSModules from 'react-css-modules'
import styles from './Footer.scss'

import Info from './Info/Info'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


@CSSModules(styles)
export default class Footer extends Component {

  state = {
    userOnline: 0,
  }

  componentWillMount() {
    setTimeout(() => {
      SwapApp.services.room.connection
        .on('peer joined', this.handleUserJoin)
    }, 8000)
  }

  componentWillUnmount() {
    SwapApp.services.room.connection
      .off('peer joined', this.handleUserLeft)
  }

  handleUserJoin = () => {
    let { userOnline } = this.state
    userOnline++
    this.setState({
      userOnline,
    })
  }

  handleUserLeft = () => {
    let { userOnline } = this.state
    userOnline--
    this.setState({
      userOnline,
    })
  }

  render() {
    const { userOnline } = this.state
    const server = SwapApp.services.room._config.config.Addresses.Swarm[0].split('/')[2]

    return (
      <div styleName="footer">
        <WidthContainer styleName="container">
          <Info
            serverAddress={server}
            userOnline={userOnline}
          />
        </WidthContainer>
      </div>
    )
  }
}