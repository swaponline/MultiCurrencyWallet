type Eip1193Provider = {
  request: (payload: {
    method: string
    params?: any
  }) => Promise<any>
}

type WalletAppsBridgeOptions = {
  iframe: HTMLIFrameElement
  appUrl: string
}

type WalletAppsBridge = {
  destroy: () => void
  sendReady: () => void
}

const BRIDGE_SOURCE = 'swap.wallet.apps.bridge'
const BRIDGE_REQUEST = 'WALLET_APPS_BRIDGE_REQUEST'
const BRIDGE_RESPONSE = 'WALLET_APPS_BRIDGE_RESPONSE'
const BRIDGE_READY = 'WALLET_APPS_BRIDGE_READY'

const ALLOWED_EIP1193_METHODS = new Set([
  'eth_chainId',
  'eth_accounts',
  'eth_requestAccounts',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
  'eth_sendTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTypedData_v4',
])

const getEip1193Provider = (): Eip1193Provider | null => {
  if (window?.ethereum && typeof window.ethereum.request === 'function') {
    return window.ethereum as Eip1193Provider
  }

  return null
}

export const hasExternalEip1193Provider = (): boolean => {
  return Boolean(getEip1193Provider())
}

export const createWalletAppsBridge = ({ iframe, appUrl }: WalletAppsBridgeOptions): WalletAppsBridge => {
  let targetOrigin = ''

  try {
    targetOrigin = new URL(appUrl).origin
  } catch (error) {
    targetOrigin = ''
  }

  const sendMessage = (payload) => {
    const targetWindow = iframe.contentWindow

    if (!targetWindow || !targetOrigin) {
      return
    }

    targetWindow.postMessage(payload, targetOrigin)
  }

  const sendReady = () => {
    sendMessage({
      source: BRIDGE_SOURCE,
      type: BRIDGE_READY,
      payload: {
        hasProvider: hasExternalEip1193Provider(),
        methods: Array.from(ALLOWED_EIP1193_METHODS),
      },
    })
  }

  const handleMessage = async (event: MessageEvent) => {
    if (!targetOrigin || event.origin !== targetOrigin || event.source !== iframe.contentWindow) {
      return
    }

    const data = event.data || {}

    if (data.type !== BRIDGE_REQUEST) {
      return
    }

    const requestId = data?.payload?.requestId
    const method = data?.payload?.method
    const params = data?.payload?.params

    if (!requestId || !method) {
      return
    }

    if (!ALLOWED_EIP1193_METHODS.has(method)) {
      sendMessage({
        source: BRIDGE_SOURCE,
        type: BRIDGE_RESPONSE,
        payload: {
          requestId,
          error: {
            code: 4001,
            message: `Method ${method} is not allowed by Wallet Apps bridge policy`,
          },
        },
      })

      return
    }

    const provider = getEip1193Provider()

    if (!provider) {
      sendMessage({
        source: BRIDGE_SOURCE,
        type: BRIDGE_RESPONSE,
        payload: {
          requestId,
          error: {
            code: 4900,
            message: 'No external EIP-1193 provider available in wallet host',
          },
        },
      })

      return
    }

    try {
      const result = await provider.request({ method, params })

      sendMessage({
        source: BRIDGE_SOURCE,
        type: BRIDGE_RESPONSE,
        payload: {
          requestId,
          result,
        },
      })
    } catch (error: any) {
      sendMessage({
        source: BRIDGE_SOURCE,
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
    destroy: () => {
      window.removeEventListener('message', handleMessage)
    },
  }
}
