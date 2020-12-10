import Swap from 'swap.swap'

export const on = (emitter, _event) =>
  new Promise(resolve => emitter.on(_event, resolve))

export const onFinish = emitter =>
  new Promise(resolve => {
    if (emitter instanceof Swap) {
      emitter.on('enter step', function () {
        if (emitter.flow.state.isFinished) {
          this.unsubscribe()
          resolve(true)
        }
      })
    }
  })
