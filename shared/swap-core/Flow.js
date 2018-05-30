import SwapRoom from './SwapRoom'
import Events from './Events'
import room from './room'
import { localStorage } from './util'


class Flow {

  constructor({ swap }) {
    this.events   = new Events()
    this.swap     = swap
    this.steps    = []

    this.state = {
      step: 0,
      isWaitingForOwner: false,
    }
  }

  _persistState() {
    const state = localStorage.getItem(`flow.${this.swap.id}`)

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
      console.log('GO INITIAL STEP', this.state.step)

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

          room.subscribe('new orders', function ({ orders }) {
            const order = orders.find(({ id }) => id === orderId)

            if (order) {
              this.unsubscribe()

              const order = orders.getByKey(orderId)

              // TODO move this to Swap.js
              flow.swap.room = new SwapRoom({
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
    localStorage.setItem(`flow.${this.swap.id}`, this.state)
    console.error('state saved', this.state)
  }

  finishStep(data) {
    console.log('FINISH STEP', data)

    this.goNextStep(data)
  }

  goNextStep(data) {
    console.log('GO NEXT STEP', data)

    const { step } = this.state
    const newStep = step + 1

    this.events.dispatch('leave step', step)

    this.setState({
      step: newStep,
      ...(data || {}),
    }, true)

    this.goStep(newStep)
  }

  goStep(index) {
    this.events.dispatch('enter step', index)
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

    this.events.dispatch('state update', this.state, values)
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }

  off(eventName, handler) {
    this.events.unsubscribe(eventName, handler)
  }
}


export default Flow
