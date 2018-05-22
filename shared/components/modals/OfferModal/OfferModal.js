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
    view: 'addOffer', // addOffer / confirmOffer
  }

  handleChangeView = (name) => {
    this.setState({
      view: name,
    })
  }

  render() {
    const { view } = this.state
    const { name } = this.props

    const title = view === 'addOffer' ? 'Add offer' : 'Confirm offer'

    return (
      <Modal name={name} title={title}>
        {
          view === 'addOffer' ? (
            <AddOffer next={() => this.handleChangeView('confirmOffer')} />
          ) : (
            <ConfirmOffer back={() => this.handleChangeView('addOffer')} />
          )
        }
      </Modal>
    )
  }
}
