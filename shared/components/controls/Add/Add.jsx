import React, { Component } from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './add.scss'

import AddSvg from './add.svg'

@CSSModules(styles)
export default class Add extends Component {
  render() {
    return (
      <a
        href="#"
        styleName="user-cont__add-user"
        onClick={(event) => {
          event.preventDefault()
          return actions.modals.open('OFFER', true, {})
        }}>
        <img src={AddSvg} alt="" />
      </a>
    )
  }
}

// Add.propTypes = {
//   isOpen: PropTypes.func.isRequired,
// }
