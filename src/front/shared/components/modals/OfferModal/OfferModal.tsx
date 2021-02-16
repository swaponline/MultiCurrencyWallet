import React from 'react'
import cssModules from 'react-css-modules'
import styles from './OfferModal.scss'
import Modal from 'components/modal/Modal/Modal'
import ConfirmOffer from './ConfirmOffer/ConfirmOffer'
import AddOffer from './AddOffer/AddOffer'
import { FormattedMessage } from 'react-intl'

type OfferCurrency = {
  sellCurrency: string
  buyCurrency: string
}

type OfferProps = {
  name: string
  data: OfferCurrency
}

type OfferState = {
  view: string
  offer: OfferCurrency
}

@cssModules(styles)
export default class Offer extends React.Component<OfferProps, OfferState> {
  constructor(props) {
    super(props)

    const propsData = props && props.data
    const buyCurrency = propsData ? propsData.buyCurrency : 'eth'
    const sellCurrency = propsData ? propsData.sellCurrency : 'btc'

    this.state = {
      view: 'editOffer',
      offer: {
        buyCurrency,
        sellCurrency,
      },
    }
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

    const title =
      view === 'editOffer' ? (
        <FormattedMessage id="Add52" defaultMessage="Place an offer" />
      ) : (
        <FormattedMessage id="Confirm52" defaultMessage="Confirm Offer" />
      )

    return (
      <Modal name={name} title={title}>
        <div styleName="content">
          {view === 'editOffer' ? (
            <AddOffer initialData={offer} onNext={this.handleMoveToConfirmation} />
          ) : (
            <ConfirmOffer offer={offer} onBack={this.handleMoveToOfferEditing} />
          )}
        </div>
      </Modal>
    )
  }
}
