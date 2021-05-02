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

  constructor(props) {
    super(props)

    const { swap } = props

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
      //@ts-ignore: strictNullChecks
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
