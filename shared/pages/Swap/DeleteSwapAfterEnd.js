import React, { Component } from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'


class DeleteSwapAfterEnd extends Component {

  static propTypes = {
    swap: PropTypes.shape({
      flow: PropTypes.shape({
        state: PropTypes.shape({
          step: PropTypes.number.isRequired,
          isFinished: PropTypes.bool.isRequired,
        }).isRequired,
      }),
    }).isRequired,
    orderId: PropTypes.string.isRequired,
  }

  constructor({ swap }) {
    super()

    swap.on('state update', this.autoDeleteOrder)
  }

  componentWillUnmount() {
    const { swap } = this.props
    swap.off('state update', this.autoDeleteOrder)

    this.autoDeleteOrder()
  }

  autoDeleteOrder = () => {
    const { swap, orderId } = this.props

    if (swap.flow.state.isFinished) {
      actions.core.removeOrder(orderId)
    }
  }

  render() {
    return null
  }
}

export default DeleteSwapAfterEnd
