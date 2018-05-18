import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'

import Offer from '../Offer/Offer'
import BalanceCard from '../BalanceCard/Card'


const MODAL_COMPONENTS = {
  'OFFER': Offer,
  'CARD': BalanceCard,
}

@connect(state => ({
  name: state.modals.name,
  open: state.modals.open,
  data: state.modals.data,
}))
export default class ModalRoot extends Component {
  render() {
    const { name, open, data } = this.props
    const SpecialModal = MODAL_COMPONENTS[name]
    if (!name) {
      return null
    }
    return <SpecialModal  {...data} open />
  }
}

// ModalRoot.propTypes = {
//   isClose: PropTypes.func.isRequired,
//   isUpdate: PropTypes.func.isRequired,
//   name: PropTypes.string.isRequired,
//   open: PropTypes.bool.isRequired,
// }
