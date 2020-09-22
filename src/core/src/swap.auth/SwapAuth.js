import SwapApp, { ServiceInterface, constants } from 'swap.app'


let _privateKeys
const getPublicDataMethods = {}

class SwapAuth extends ServiceInterface {

  static get name() {
    return 'auth'
  }

  constructor(privateKeys) {
    super()

    this._serviceName         = 'auth'
    this.accounts             = {}

    _privateKeys = privateKeys
  }

  initService() {
    const app = this.app

    SwapApp.required(app)
    console.log('app', app.isSwapApp())

    Object.keys(_privateKeys).forEach((name) => {
      if (Object.keys(constants.COINS).indexOf(name) < 0) {
        let error = `SwapAuth._initService(): There is no instance with name "${name}".`
        error += `Only [${JSON.stringify(Object.keys(constants.COINS)).replace(/"/g, '\'')}] available`

        throw new Error(error)
      }

      try {
        let instance = require(`./${name}`)
        instance = instance.default || instance
        const account = instance.login(_privateKeys[name], app)

        this.accounts[name] = account
        getPublicDataMethods[name] = () => instance.getPublicData(account, app)
      }
      catch (err) {
        throw new Error(`SwapAuth._initService(): ${err}`)
      }
    })
  }

  getPublicData() {
    const data = {
      peer: this.app.services.room.peer,
    }

    Object.keys(getPublicDataMethods).forEach((name) => {
      data[name] = getPublicDataMethods[name]()
    })

    return data
  }
}


export default SwapAuth
