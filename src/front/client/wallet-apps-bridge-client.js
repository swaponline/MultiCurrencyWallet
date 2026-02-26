(function () {
  var BRIDGE_SOURCE_HOST = 'swap.wallet.apps.bridge.host'
  var BRIDGE_SOURCE_CLIENT = 'swap.wallet.apps.bridge.client'
  var BRIDGE_HELLO = 'WALLET_APPS_BRIDGE_HELLO'
  var BRIDGE_REQUEST = 'WALLET_APPS_BRIDGE_REQUEST'
  var BRIDGE_RESPONSE = 'WALLET_APPS_BRIDGE_RESPONSE'
  var BRIDGE_READY = 'WALLET_APPS_BRIDGE_READY'
  var BRIDGE_EVENT = 'WALLET_APPS_BRIDGE_EVENT'

  if (typeof window === 'undefined' || window.parent === window) {
    return
  }

  var listeners = {}
  var pending = {}
  var requestCounter = 0
  var bridgeOrigin = '*'
  var bridgeReady = false
  var currentAccounts = []
  var currentChainId = null

  var emit = function (eventName, payload) {
    if (!listeners[eventName]) {
      return
    }

    listeners[eventName].forEach(function (fn) {
      try {
        fn(payload)
      } catch (error) {
        console.error('[WalletAppsBridge] listener failed', error)
      }
    })
  }

  var on = function (eventName, fn) {
    if (!listeners[eventName]) {
      listeners[eventName] = []
    }

    listeners[eventName].push(fn)

    return provider
  }

  var removeListener = function (eventName, fn) {
    if (!listeners[eventName]) {
      return provider
    }

    listeners[eventName] = listeners[eventName].filter(function (listener) {
      return listener !== fn
    })

    return provider
  }

  var removeAllListeners = function (eventName) {
    if (eventName) {
      listeners[eventName] = []
    } else {
      listeners = {}
    }

    return provider
  }

  var postToHost = function (type, payload) {
    window.parent.postMessage(
      {
        source: BRIDGE_SOURCE_CLIENT,
        type: type,
        payload: payload,
      },
      bridgeOrigin
    )
  }

  var request = function (payload) {
    return new Promise(function (resolve, reject) {
      var method = payload && payload.method
      if (!method) {
        reject(new Error('WalletAppsBridge request requires method'))
        return
      }

      var requestId = 'wab-' + Date.now() + '-' + (++requestCounter)

      pending[requestId] = {
        resolve: resolve,
        reject: reject,
      }

      postToHost(BRIDGE_REQUEST, {
        requestId: requestId,
        method: method,
        params: payload.params,
      })

      setTimeout(function () {
        if (pending[requestId]) {
          delete pending[requestId]
          reject(new Error('WalletAppsBridge timeout'))
        }
      }, 30000)
    })
  }

  var provider = {
    isSwapWalletAppsBridge: true,
    isMetaMask: true,
    chainId: null,
    selectedAddress: null,
    request: request,
    enable: function () {
      return request({ method: 'eth_requestAccounts' })
    },
    isConnected: function () {
      return !!bridgeReady
    },
    on: on,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    send: function (methodOrPayload, params) {
      if (typeof methodOrPayload === 'string') {
        return request({ method: methodOrPayload, params: params })
      }

      return request(methodOrPayload)
    },
    sendAsync: function (payload, callback) {
      request(payload)
        .then(function (result) {
          if (typeof callback === 'function') {
            callback(null, {
              id: payload && payload.id ? payload.id : Date.now(),
              jsonrpc: '2.0',
              result: result,
            })
          }
        })
        .catch(function (error) {
          if (typeof callback === 'function') {
            callback(error)
          }
        })
    },
  }

  var injectProvider = function () {
    var forceBridge = window.location.search.indexOf('walletBridge=swaponline') >= 0

    if (!window.ethereum || forceBridge) {
      try {
        Object.defineProperty(window, 'ethereum', {
          configurable: true,
          enumerable: true,
          writable: true,
          value: provider,
        })
      } catch (error) {
        window.ethereum = provider
      }
    }

    window.swapWalletAppsBridgeProvider = provider

    if (!window.ethereum.providers) {
      window.ethereum.providers = [window.ethereum]
    }

    window.dispatchEvent(new Event('ethereum#initialized'))
  }

  var handleHostMessage = function (event) {
    if (event.source !== window.parent) {
      return
    }

    var data = event.data || {}

    if (data.source !== BRIDGE_SOURCE_HOST) {
      return
    }

    bridgeOrigin = event.origin || '*'

    if (data.type === BRIDGE_READY) {
      bridgeReady = true

      var payload = data.payload || {}
      currentChainId = payload.chainId || null
      currentAccounts = Array.isArray(payload.accounts) ? payload.accounts : []
      provider.chainId = currentChainId
      provider.selectedAddress = currentAccounts[0] || null
      emit('bridgeReady', payload)
      emit('connect', { chainId: currentChainId })

      if (currentChainId) {
        emit('chainChanged', currentChainId)
      }

      if (currentAccounts.length) {
        emit('accountsChanged', currentAccounts)
      }

      return
    }

    if (data.type === BRIDGE_RESPONSE) {
      var responsePayload = data.payload || {}
      var requestId = responsePayload.requestId

      if (!requestId || !pending[requestId]) {
        return
      }

      var item = pending[requestId]
      delete pending[requestId]

      if (responsePayload.error) {
        var err = new Error(responsePayload.error.message || 'WalletAppsBridge request failed')
        err.code = responsePayload.error.code
        item.reject(err)
      } else {
        item.resolve(responsePayload.result)
      }

      return
    }

    if (data.type === BRIDGE_EVENT) {
      var eventPayload = data.payload || {}
      if (eventPayload.eventName) {
        if (eventPayload.eventName === 'chainChanged') {
          currentChainId = eventPayload.data || null
          provider.chainId = currentChainId
        }

        if (eventPayload.eventName === 'accountsChanged') {
          currentAccounts = Array.isArray(eventPayload.data) ? eventPayload.data : []
          provider.selectedAddress = currentAccounts[0] || null
          if (!currentAccounts.length) {
            emit('disconnect', { code: 4900, message: 'Wallet disconnected' })
          }
        }

        emit(eventPayload.eventName, eventPayload.data)
      }
    }
  }

  window.addEventListener('message', handleHostMessage)

  var helloAttempts = 0
  var helloTimer = setInterval(function () {
    if (bridgeReady || helloAttempts > 20) {
      clearInterval(helloTimer)
      return
    }

    helloAttempts += 1
    postToHost(BRIDGE_HELLO, {
      version: '1.0.0',
      ua: navigator.userAgent,
    })
  }, 750)

  postToHost(BRIDGE_HELLO, {
    version: '1.0.0',
    ua: navigator.userAgent,
  })

  injectProvider()
})()
