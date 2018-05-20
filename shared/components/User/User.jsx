import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './User.scss'

import UserTooltip from 'components/UserTooltip/UserTooltip'

import Add from 'components/controls/Add/Add'
import Question from 'components/controls/Question/Question'
import Open from 'components/controls/Open/Open'

@connect({
  open: 'notification.open',
  name: 'notification.name',
})
@CSSModules(styles)
export default class User extends React.Component {

  constructor() {
    super()

    this.state = {
      visible: false,
    }

    this.handleChage = this.handleChage.bind(this)
  }

  handleChage() {
    this.setState({ visible: !this.state.visible })
  }

  render() {
    const { open, name } = this.props
    const { visible } = this.state
    return (
      <div styleName="user-cont">
        {/* <Question /> */}
        <Add  />
        <Open
          isOpen={this.handleChage}
          open={open}
          name={name}
        />
        { visible ? <UserTooltip visible /> : '' }
      </div>
    )
  }
}

// User.propTypes = {
//   isOpen: PropTypes.func.isRequired,
//   isUpdate: PropTypes.func.isRequired,
//   name: PropTypes.string.isRequired,
//   open: PropTypes.bool.isRequired,
// }

