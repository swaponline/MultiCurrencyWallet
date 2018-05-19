import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './User.scss'

import UserTooltip from '../UserTooltip/UserTooltip'

import Add from '../controls/Add/Add'
import Question from '../controls/Question/Question'
import Open from '../controls/Open/Open'

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
    const { isOpen, isUpdate, open, name } = this.props
    const { visible } = this.state
    return (
      <div styleName="user-cont">
        {/* <Question /> */}
        <Add isOpen={isOpen} />
        <Open
          open={this.handleChage}
          isUpdate={isUpdate}
          notification={open}
        />
        { visible ? <UserTooltip open={visible} /> : '' }
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

