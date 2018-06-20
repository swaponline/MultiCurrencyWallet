import React, { Component } from 'react'

import CSSModules from 'react-css-modules'
import styles from './UserAvatar.scss'
import bell from './images/avatar.svg'


@CSSModules(styles, { allowMultiple: true })
export default class UserAvatar extends Component {

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
    const { feeds, soundClick, changeView } = this.props

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

