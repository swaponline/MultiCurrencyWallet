import React, { Component } from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import SwapApp from 'swap.app'


class DeleteSwapAfterEnd extends Component<any, any> {

  static propTypes = {
    swap: PropTypes.shape({
      flow: PropTypes.shape({
        state: PropTypes.shape({
          step: PropTypes.number.isRequired,
          isFinished: PropTypes.bool.isRequired,
        }).isRequired,
      }),
      id: PropTypes.string.isRequired,
    }).isRequired,
  }

  constructor({ swap }) {
    //@ts-ignore
    super()

    swap.on('state update', this.autoDeleteOrder)
  }

  componentWillUnmount() {
    const { swap } = this.props
    swap.off('state update', this.autoDeleteOrder)

    this.autoDeleteOrder()
  }

  autoDeleteOrder = () => {
    const { swap } = this.props

    if (swap.flow.state.isFinished) {
      const deletedOrder = SwapApp.shared().services.orders.getByKey(swap.id)
      if (deletedOrder !== undefined) {
        actions.core.deletedPartialCurrency(swap.id)
      }
      actions.core.removeOrder(swap.id)
      actions.core.showMyOrders()
    }
  }

  render() {
    return null
  }
}

export default DeleteSwapAfterEnd
