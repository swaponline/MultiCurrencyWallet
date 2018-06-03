import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './User.scss'

import { createSwapApp } from 'instances/swap'
// import Question from './controls/Question/Question'
import AddOfferButton from './AddOfferButton/AddOfferButton'
import UserAvatar from './UserAvatar/UserAvatar'
import UserTooltip from './UserTooltip/UserTooltip'


@CSSModules(styles)
export default class User extends React.Component {

  state = {
    view: false,
  }

  componentWillMount() {
    createSwapApp()
  }

  handleToggleTooltip = () => {
    this.setState({
      view: !this.state.view,
    })
  }

  render() {
    const { view } = this.state

    return (
      <div styleName="user-cont">
        {/* <Question /> */}
        <AddOfferButton />
        <UserAvatar isOpen={this.handleToggleTooltip} />
        <UserTooltip isClose={this.handleToggleTooltip} view={view} />
      </div>
    )
  }
}
