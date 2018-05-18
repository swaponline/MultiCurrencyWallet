import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Offer.scss'

import HeaderOffer from './HeaderOffer/HeaderOffer'
import ConfirmOffer from './ConfirmOffer/ConfirmOffer'
import AddOffer from './AddOffer/AddOffer'

@CSSModules(styles)
export default class Offer extends React.Component {
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
      <div styleName="offer-popup">
        <HeaderOffer close={isClose} />
        <div styleName="offer-popup__center">
          { visible
            ? <AddOffer next={this.handleChange} />
            : <ConfirmOffer back={this.handleChange} /> }
        </div>
      </div> : null
    )
  }
}

Offer.propTypes = {
  open: PropTypes.bool.isRequired,
  isClose: PropTypes.func.isRequired,
}
