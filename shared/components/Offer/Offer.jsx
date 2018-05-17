import React from 'react'

import './Offer.scss'

import HeaderOffer from './HeaderOffer/HeaderOffer'
import ConfirmOffer from './ConfirmOffer/ConfirmOffer'
import AddOffer from './AddOffer/AddOffer'

class Offer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      visible: true,
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange() {
    this.setState({ visible: !this.state.visible })
  }

  render() {
    const { open, isClose } = this.props
    const { visible } = this.state
    return (open === true ?
      <div className="offer-popup">
        <HeaderOffer close={isClose} />
        <div className="offer-popup__center">
          { visible ?
            <AddOffer next={this.handleChange} />
            :
            <ConfirmOffer back={this.handleChange} /> }
        </div>
      </div> : ''
    )

  }
}

export default Offer
