import React from 'react'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './User.scss'

import UserTooltip from 'components/UserTooltip/UserTooltip'

import AddOfferButton from 'components/controls/AddOfferButton/AddOfferButton'
import Question from 'components/controls/Question/Question'
import Open from 'components/controls/Open/Open'


@connect({
  open: 'notification.open',
  name: 'notification.name',
})
@CSSModules(styles)
export default class User extends React.Component {

  state = {
    isVisible: false,
  }

  handleChange = () => {
    const { isVisible } = this.state

    this.setState({
      isVisible: !isVisible,
    })
  }

  render() {
    const { open, name } = this.props
    const { isVisible } = this.state
    return (
      <div styleName="user-cont">
        {/* <Question /> */}
        <AddOfferButton />
        <Open
          isOpen={this.handleChange}
          open={open}
          name={name}
        />
        {
          isVisible && (
            <UserTooltip isVisible />
          )
        }
      </div>
    )
  }
}
