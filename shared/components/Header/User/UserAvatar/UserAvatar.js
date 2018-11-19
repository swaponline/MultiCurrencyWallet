import React, { Component } from 'react'
import PropTypes from 'prop-types'

import bell from './images/avatar.svg'
import styles from './UserAvatar.scss'
import CSSModules from 'react-css-modules'


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

  componentDidUpdate(prevProps) {
    const { feeds, soundClick, changeView } = this.props

    if (prevProps.feeds.length < feeds.length) {
      changeView()

      this.setState({
        feeds: feeds,
        animation: 'user shake new',
      });

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

