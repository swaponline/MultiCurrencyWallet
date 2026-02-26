import { metamask } from 'helpers'

type Eip1193Provider = {
  request: (payload: {
    method: string
    params?: any
  }) => Promise<any>
  on?: (eventName: string, cb: (...args: any[]) => void) => void
  removeListener?: (eventName: string, cb: (...args: any[]) => void) => void
}

type InternalWallet = {
  address: string
  currency: string
} | null

type WalletAppsBridgeOptions = {
  iframe: HTMLIFrameElement
  appUrl: string
  internalWallet?: InternalWallet
  onClientHello?: () => void
}

type WalletAppsBridge = {
  destroy: () => void
  sendReady: () => void
  isClientConnected: () => boolean
}

type JsonRpcRequestPayload = {
  id: number
  jsonrpc: '2.0'
  method: string
  params: any[] | Record<string, any>
}

const BRIDGE_SOURCE_HOST = 'swap.wallet.apps.bridge.host'
const BRIDGE_SOURCE_CLIENT = 'swap.wallet.apps.bridge.client'
const BRIDGE_HELLO = 'WALLET_APPS_BRIDGE_HELLO'
const BRIDGE_REQUEST = 'WALLET_APPS_BRIDGE_REQUEST'
const BRIDGE_RESPONSE = 'WALLET_APPS_BRIDGE_RESPONSE'
const BRIDGE_READY = 'WALLET_APPS_BRIDGE_READY'
const BRIDGE_EVENT = 'WALLET_APPS_BRIDGE_EVENT'

const ALLOWED_EIP1193_METHOD_PREFIXES = ['eth_', 'wallet_', 'personal_']
const ALLOWED_EIP1193_EXACT_METHODS = new Set([
  'net_version',
  'web3_clientVersion',
])
const BLOCKED_EIP1193_METHODS = new Set([
  'eth_subscribe',
  'eth_unsubscribe',
])

const isAllowedEip1193Method = (method: string): boolean => {
  if (!method || BLOCKED_EIP1193_METHODS.has(method)) {
    return false
  }

  if (ALLOWED_EIP1193_EXACT_METHODS.has(method)) {
    return true
  }

  return ALLOWED_EIP1193_METHOD_PREFIXES.some((prefix) => method.startsWith(prefix))
}

const normalizeChainId = (chainId: any): string | null => {
  if (chainId === undefined || chainId === null) {
    return null
  }

  if (typeof chainId === 'number') {
    return `0x${chainId.toString(16)}`
  }

  return `${chainId}`
}

const buildRequestFromLegacySend = (
  providerLike: any,
  sender: (...args: any[]) => any
) => {
  return ({ method, params }: { method: string, params?: any }): Promise<any> => {
    const payload: JsonRpcRequestPayload = {
      id: Date.now(),
      jsonrpc: '2.0',
      method,
      params: params === undefined ? [] : params,
    }

    return new Promise((resolve, reject) => {
      let settled = false

      const done = (error?: any, response?: any) => {
        if (settled) {
          return
        }
        settled = true

        if (error) {
          reject(error)
          return
        }

        if (response?.error) {
          reject(response.error)
          return
        }

        if (typeof response === 'object' && response !== null && Object.prototype.hasOwnProperty.call(response, 'result')) {
          resolve(response.result)
          return
        }

        resolve(response)
      }

      try {
        const maybePromise = sender.call(providerLike, payload, done)
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.then((response) => done(undefined, response)).catch((error) => done(error))
        }
      } catch (error) {
        done(error)
      }
    })
  }
}

const asEip1193Provider = (providerLike: any): Eip1193Provider | null => {
  if (!providerLike) {
    return null
  }

  if (typeof providerLike.request === 'function') {
    return providerLike as Eip1193Provider
  }

  if (typeof providerLike.sendAsync === 'function') {
    providerLike.request = buildRequestFromLegacySend(providerLike, providerLike.sendAsync)
    return providerLike as Eip1193Provider
  }

  if (typeof providerLike.send === 'function') {
    providerLike.request = buildRequestFromLegacySend(providerLike, providerLike.send)
    return providerLike as Eip1193Provider
  }

  return null
}

const getConnectedWeb3Provider = (): Eip1193Provider | null => {
  try {
    if (!metamask?.isConnected?.()) {
      return null
    }

    const connectedWeb3 = metamask.getWeb3?.()
    return asEip1193Provider(connectedWeb3?.currentProvider)
  } catch (error) {
    return null
  }
}

const getEip1193Provider = (): Eip1193Provider | null => {
  return getConnectedWeb3Provider() || asEip1193Provider(window?.ethereum)
}

export const hasExternalEip1193Provider = (): boolean => {
  return Boolean(getEip1193Provider())
}

export const createWalletAppsBridge = ({
  iframe,
  appUrl,
  internalWallet,
  onClientHello,
}: WalletAppsBridgeOptions): WalletAppsBridge => {
  let targetOrigin = ''
  let clientConnected = false

  try {
    targetOrigin = new URL(appUrl).origin
  } catch (error) {
    targetOrigin = ''
  }

  // Create virtual EIP-1193 provider for internal MCW wallet
  const createInternalProvider = (): Eip1193Provider | null => {
    if (!internalWallet?.address) {
      return null
    }

    return {
      request: async ({ method, params }) => {
        if (method === 'eth_accounts') {
          return [internalWallet.address]
        }
        if (method === 'eth_chainId') {
          // Return current network chain ID (default to mainnet for now)
          return '0x1'
        }
        if (method === 'eth_requestAccounts') {
          return [internalWallet.address]
        }
        // For other methods, throw unsupported error
        throw {
          code: 4200,
          message: `Method ${method} not supported by internal wallet provider`
        }
      },
    }
  }

  const sendMessage = (payload) => {
    const targetWindow = iframe.contentWindow

    if (!targetWindow || !targetOrigin) {
      return
    }

    targetWindow.postMessage(payload, targetOrigin)
  }

  const sendProviderEvent = (eventName: string, data: any) => {
    sendMessage({
      source: BRIDGE_SOURCE_HOST,
      type: BRIDGE_EVENT,
      payload: {
        eventName,
        data,
      },
    })
  }

  const fetchProviderMeta = async () => {
    // Prefer internal wallet provider if available
    const internalProvider = createInternalProvider()
    const provider = internalProvider || getEip1193Provider()

    if (!provider) {
      return {
        hasProvider: false,
        chainId: null,
        accounts: [],
      }
    }

    try {
      const [chainId, accounts] = await Promise.all([
        provider.request({ method: 'eth_chainId' }),
        provider.request({ method: 'eth_accounts' }),
      ])

      return {
        hasProvider: true,
        chainId: normalizeChainId(chainId),
        accounts: Array.isArray(accounts) ? accounts : [],
      }
    } catch (error) {
      return {
        hasProvider: true,
        chainId: null,
        accounts: [],
      }
    }
  }

  const sendReady = () => {
    fetchProviderMeta().then((meta) => {
      sendMessage({
        source: BRIDGE_SOURCE_HOST,
        type: BRIDGE_READY,
        payload: {
          providerAvailable: meta.hasProvider,
          chainId: meta.chainId,
          accounts: meta.accounts,
          methods: Array.from(ALLOWED_EIP1193_EXACT_METHODS),
          methodPrefixes: ALLOWED_EIP1193_METHOD_PREFIXES,
        },
      })
    })
  }

  const handleAccountsChanged = (accounts) => {
    sendProviderEvent('accountsChanged', accounts)
  }

  const handleChainChanged = (chainId) => {
    sendProviderEvent('chainChanged', normalizeChainId(chainId))
  }

  const handleWeb3ProviderUpdated = () => {
    fetchProviderMeta().then((meta) => {
      sendProviderEvent('accountsChanged', meta.accounts)
      sendProviderEvent('chainChanged', meta.chainId)
      sendReady()
    })
  }

  const providerForEvents = getEip1193Provider()
  if (providerForEvents?.on) {
    providerForEvents.on('accountsChanged', handleAccountsChanged)
    providerForEvents.on('chainChanged', handleChainChanged)
  }

  if (metamask?.web3connect?.on) {
    metamask.web3connect.on('connected', handleWeb3ProviderUpdated)
    metamask.web3connect.on('disconnect', handleWeb3ProviderUpdated)
    metamask.web3connect.on('accountChange', handleWeb3ProviderUpdated)
    metamask.web3connect.on('chainChanged', handleWeb3ProviderUpdated)
  }

  const handleMessage = async (event: MessageEvent) => {
    if (!targetOrigin || event.origin !== targetOrigin || event.source !== iframe.contentWindow) {
      return
    }

    const data = event.data || {}

    if (data.source !== BRIDGE_SOURCE_CLIENT) {
      return
    }

    if (data.type === BRIDGE_HELLO) {
      clientConnected = true
      if (onClientHello) {
        onClientHello()
      }
      sendReady()
      return
    }

    if (data.type !== BRIDGE_REQUEST) {
      return
    }

    const requestId = data?.payload?.requestId
    const method = data?.payload?.method
    const params = data?.payload?.params

    if (!requestId || !method) {
      return
    }

    if (!isAllowedEip1193Method(method)) {
      sendMessage({
        source: BRIDGE_SOURCE_HOST,
        type: BRIDGE_RESPONSE,
        payload: {
          requestId,
          error: {
            code: 4200,
            message: `Method ${method} is not allowed by Wallet Apps bridge policy`,
          },
        },
      })

      return
    }

    // Prefer internal wallet provider if available
    const internalProvider = createInternalProvider()
    const provider = internalProvider || getEip1193Provider()

    if (!provider) {
      sendMessage({
        source: BRIDGE_SOURCE_HOST,
        type: BRIDGE_RESPONSE,
        payload: {
          requestId,
          error: {
            code: 4900,
            message: 'No EIP-1193 provider available in wallet host',
          },
        },
      })

      return
    }

    try {
      const result = await provider.request({ method, params })

      sendMessage({
        source: BRIDGE_SOURCE_HOST,
        type: BRIDGE_RESPONSE,
        payload: {
          requestId,
          result,
        },
      })
    } catch (error: any) {
      sendMessage({
        source: BRIDGE_SOURCE_HOST,
        type: BRIDGE_RESPONSE,
        payload: {
          requestId,
          error: {
            code: error?.code || 4001,
            message: error?.message || 'Wallet Apps bridge request failed',
          },
        },
      })
    }
  }

  window.addEventListener('message', handleMessage)

  return {
    sendReady,
    isClientConnected: () => clientConnected,
    destroy: () => {
      window.removeEventListener('message', handleMessage)
      if (providerForEvents?.removeListener) {
        providerForEvents.removeListener('accountsChanged', handleAccountsChanged)
        providerForEvents.removeListener('chainChanged', handleChainChanged)
      }
      if (metamask?.web3connect?.removeListener) {
        metamask.web3connect.removeListener('connected', handleWeb3ProviderUpdated)
        metamask.web3connect.removeListener('disconnect', handleWeb3ProviderUpdated)
        metamask.web3connect.removeListener('accountChange', handleWeb3ProviderUpdated)
        metamask.web3connect.removeListener('chainChanged', handleWeb3ProviderUpdated)
      } else if (metamask?.web3connect?.off) {
        metamask.web3connect.off('connected', handleWeb3ProviderUpdated)
        metamask.web3connect.off('disconnect', handleWeb3ProviderUpdated)
        metamask.web3connect.off('accountChange', handleWeb3ProviderUpdated)
        metamask.web3connect.off('chainChanged', handleWeb3ProviderUpdated)
      }
    },
  }
}
