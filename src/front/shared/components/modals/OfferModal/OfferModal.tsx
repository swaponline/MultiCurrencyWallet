import React from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './OfferModal.scss'

import Modal from 'components/modal/Modal/Modal'

import ConfirmOffer from './ConfirmOffer/ConfirmOffer'
import AddOffer from './AddOffer/AddOffer'
import { FormattedMessage } from 'react-intl'


@cssModules(styles)
export default class Offer extends React.Component<any, any> {

  props: any

  static propTypes = {
    name: PropTypes.string,
  }

  state = {
    view: 'editOffer',
    offer: {
      buyCurrency: this.props && this.props.data && this.props.data.buyCurrency,
      sellCurrency: this.props && this.props.data && this.props.data.sellCurrency,
    },
  }

  componentWillUnmount() {
    window.scrollTo({ top: 0 })
  }

  handleMoveToConfirmation = (offer) => {
    this.setState({
      view: 'Confirm offer',
      offer,
    })
  }

  handleMoveToOfferEditing = () => {
    // actions.analytics.dataEvent('orderbook-addoffer-click-confirm-button')
    this.setState({
      view: 'editOffer',
    })
  }

  render() {
    const { view, offer } = this.state
    const { name } = this.props

    const title = view === 'editOffer'
      ? <FormattedMessage id="Add52" defaultMessage="Place an offer" />
      : <FormattedMessage id="Confirm52" defaultMessage="Confirm Offer" />

    return (
      <Modal name={name} title={title}>
        <div styleName="content">
          {
            view === 'editOffer' ? (
              <AddOffer initialData={offer} onNext={this.handleMoveToConfirmation} />
            ) : (
              <ConfirmOffer offer={offer} onBack={this.handleMoveToOfferEditing} />
            )
          }
        </div>
      </Modal>
    )
  }
}
