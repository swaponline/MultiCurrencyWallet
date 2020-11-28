import SwapApp from 'swap.app'

class SwapInterface {

  _swapName: any
  accounts: any

  constructor() {
    // service name, within it will be stored in this.app.swaps
    this._swapName = null
  }

  _initSwap(app) {
    // init service on SwapApp mounting
    SwapApp.required(app)

    this.accounts = app.services.auth.accounts
  }
}


export default SwapInterface
