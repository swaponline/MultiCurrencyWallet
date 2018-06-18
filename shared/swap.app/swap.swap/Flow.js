import SwapApp from 'swap.app'
import Room from './Room'


class Flow {

  constructor(swap) {
    this.swap     = swap
    this.steps    = []

    this.state = {
      step: 0,
      isWaitingForOwner: false,
    }
  }

  _persistState() {
    const state = SwapApp.env.storage.getItem(`flow.${this.swap.id}`)

    if (state) {
      this.state = {
        ...this.state,
        ...state,
      }
    }

    this.swap.room.subscribe('persist state', (values) => {
      this.setState(values, true)
    })
  }

  _persistSteps() {
    this.steps = [
      ...this._getInitialSteps(),
      ...this._getSteps(),
    ]

    // wait events placed
    setTimeout(() => {
      this.goStep(this.state.step)
    }, 0)
  }

  _getInitialSteps() {
    const flow = this

    return [

      // Check if order exists

      async () => {
        const { id: orderId, owner } = this.swap

        // TODO how can we don't know who is participant???
        // TODO if there is no participant in `order` then no need to create Flow...
        // if there is no order it orderCollection that means owner is offline, so `swap.owner` will be undefined
        if (!owner) {
          flow.setState({
            isWaitingForOwner: true,
          })

          SwapApp.services.room.subscribe('new orders', function ({ orders }) {
            const order = orders.find(({ id }) => id === orderId)

            if (order) {
              this.unsubscribe()

              const order = orders.getByKey(orderId)

              // TODO move this to Swap.js
              flow.swap.room = new Room({
                participantPeer: order.owner.peer,
              })
              flow.swap.update({
                ...order,
                participant: order.owner,
              })
              flow.finishStep({
                isWaitingForOwner: false,
              })
            }
          })
        }
        else {
          flow.finishStep()
        }
      },
    ]
  }

  _getSteps() {
    return []
  }

  _saveState() {
    SwapApp.env.storage.setItem(`flow.${this.swap.id}`, this.state)
  }

  finishStep(data) {
    this.goNextStep(data)
  }

  goNextStep(data) {
    const { step } = this.state
    const newStep = step + 1

    this.swap.events.dispatch('leave step', step)

    this.setState({
      step: newStep,
      ...(data || {}),
    }, true)

    this.goStep(newStep)
  }

  goStep(index) {
    this.swap.events.dispatch('enter step', index)
    this.steps[index]()
  }

  setState(values, save) {
    this.state = {
      ...this.state,
      ...values,
    }

    if (save) {
      this._saveState()
    }

    this.swap.events.dispatch('state update', this.state, values)
  }
}


export default Flow
