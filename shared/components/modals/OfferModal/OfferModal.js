import React from 'react'
import PropTypes from 'prop-types'

import Modal from 'components/modal/Modal/Modal'

import ConfirmOffer from './ConfirmOffer/ConfirmOffer'
import AddOffer from './AddOffer/AddOffer'


export default class Offer extends React.Component {

  static propTypes = {
    name: PropTypes.string,
  }

  state = {
    view: 'editOffer', // editOffer / confirmOffer
    offer: {},
  }

  handleMoveToConfirmation = (offer) => {
    this.setState({
      view: 'confirmOffer',
      offer,
    })
  }

  handleMoveToOfferEditing = () => {
    this.setState({
      view: 'editOffer',
    })
  }

  render() {
    const { view, offer } = this.state
    const { name } = this.props

    const title = view === 'editOffer' ? 'Add offer' : 'Confirm offer'

    return (
      <Modal name={name} title={title}>
        {
          view === 'editOffer' ? (
            <AddOffer initialData={offer} onNext={this.handleMoveToConfirmation} />
          ) : (
            <ConfirmOffer offer={offer} onBack={this.handleMoveToOfferEditing} />
          )
        }
      </Modal>
    )
  }
}
