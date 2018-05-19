import React from 'react'
import PropTypes from 'prop-types'
import actions from '../../../redux/actions'

import CSSModules from 'react-css-modules'
import styles from './add.scss'

import AddSvg from './add.svg'

function Add({ isOpen }) {
  return (
    <a
      href="#"
      styleName="user-cont__add-user"
      onClick={(event) => {
        event.preventDefault()
        return actions.modals.openModal('OFFER')
      }}>
      <img src={AddSvg} alt="" />
    </a>
  )
}

// Add.propTypes = {
//   isOpen: PropTypes.func.isRequired,
// }

export default CSSModules(Add, styles)

