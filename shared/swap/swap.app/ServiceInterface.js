import SwapApp from './SwapApp'


class ServiceInterface {

  // _constructor for aggregation
  _constructor() {
    // service name, within it will be stored in SwapApp.services
    this._serviceName     = null
    this._dependsOn       = null
    this._spyHandlers     = []
  }

  constructor() {
    this._constructor()
  }

  _waitRelationsResolve() {
    if (this._dependsOn && this._dependsOn.length) {
      const dependsOnMap = {}

      this._dependsOn.forEach((Service) => {
        dependsOnMap[Service.name] = {
          initialized: false,
        }
        SwapApp.services[Service.name]._addWaitRelationHandler(() => {
          this._dependsOn[Service.name].initialized = true

          const areAllExpectsInitialized = Object.keys(this._dependsOn).every((serviceName) => (
            this._dependsOn[serviceName].initialized
          ))

          if (areAllExpectsInitialized) {
            this.initService()
          }
        })
      })

      this._dependsOn = dependsOnMap
    }
  }

  _addWaitRelationHandler(handler) {
    this._spyHandlers.push(handler)
  }

  _tryInitService() {
    if (!this._dependsOn) {
      this.initService()
      this._spyHandlers.forEach((handler) => handler())
      this._spyHandlers = []
    }
  }

  initService() {
    // init service on SwapApp mounting
  }
}


export default ServiceInterface
