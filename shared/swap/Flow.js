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
  }

  finishStep(data) {
    this.goNextStep(data)
  }

  goNextStep(data) {
    const nextIndex = this.state.step + 1

    this.events.dispatch('leave step', this.state.step)
    this.setState({
      step: nextIndex,
      ...(data || {}),
    })
    this.goStep(nextIndex, data)
  }

  goStep(index) {
    this.state.step = index

    this._saveState()
    this.events.dispatch('enter step', this.state.step)
    this.steps[this.state.step]()
  }

  setState(values) {
    this.state = {
      ...this.state,
      ...values,
    }

    this.events.dispatch('state update', values)
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }

  off(eventName, handler) {
    this.events.unsubscribe(eventName, handler)
  }
}


export default Flow
