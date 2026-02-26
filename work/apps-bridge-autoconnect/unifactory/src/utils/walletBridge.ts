/**
 * Wallet Bridge utilities for auto-connect when dApp is loaded
 * inside MCW's Apps iframe with the wallet bridge provider.
 *
 * Three core functions:
 * - detectBridgeMode() - check if running in bridge context
 * - loadBridgeClient() - dynamically load bridge client script
 * - waitForBridgeReady() - poll until bridge handshake completes
 */

const BRIDGE_PARAM_VALUE = 'swaponline'
const BRIDGE_CLIENT_FILENAME = 'wallet-apps-bridge-client.js'
const FALLBACK_WALLET_HOST = 'https://swaponline.github.io'
const POLL_INTERVAL_MS = 100
const BRIDGE_SCRIPT_ATTR = 'data-wallet-bridge'

/**
 * Bridge-enhanced ethereum provider type.
 * Extends the base window.ethereum with bridge-specific methods.
 */
export interface BridgeEthereumProvider {
  isConnected?: () => boolean
  isSwapWalletAppsBridge?: boolean
  isMetaMask?: boolean
  on?: (...args: any[]) => void
  removeListener?: (...args: any[]) => void
  request?: (config: any) => any
}

export interface BridgeDetectionResult {
  isBridgeMode: boolean
}

/**
 * Get window.ethereum cast to bridge provider type.
 * Provides type-safe access to bridge-specific properties
 * without conflicting with the global Window interface.
 */
function getBridgeProvider(): BridgeEthereumProvider | undefined {
  return (window as any).ethereum as BridgeEthereumProvider | undefined
}

/**
 * Detect if the dApp is running in bridge mode.
 * Both conditions must be true:
 * 1. URL contains ?walletBridge=swaponline
 * 2. Page is loaded inside an iframe (window.parent !== window)
 */
export function detectBridgeMode(): BridgeDetectionResult {
  const params = new URLSearchParams(window.location.search)
  const hasBridgeParam = params.get('walletBridge') === BRIDGE_PARAM_VALUE
  const isInIframe = window.parent !== window

  return {
    isBridgeMode: hasBridgeParam && isInIframe,
  }
}

/**
 * Extract wallet host origin from referrer URL.
 * Falls back to mainnet URL if referrer is empty or invalid.
 */
function extractWalletHost(referrer: string): string {
  if (!referrer) {
    return FALLBACK_WALLET_HOST
  }

  try {
    const url = new URL(referrer)
    return url.origin
  } catch {
    return FALLBACK_WALLET_HOST
  }
}

/**
 * Dynamically load the bridge client script from the wallet host.
 * Extracts the wallet host from the referrer URL origin.
 * Falls back to https://swaponline.github.io if referrer is empty/invalid.
 *
 * Idempotent: does not add a second script tag if one already exists.
 */
export function loadBridgeClient(referrer: string): Promise<void> {
  // Idempotent check: skip if script already loaded
  const existingScript = document.querySelector(`script[${BRIDGE_SCRIPT_ATTR}]`)
  if (existingScript) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const walletHost = extractWalletHost(referrer)
    const scriptSrc = `${walletHost}/${BRIDGE_CLIENT_FILENAME}`

    const script = document.createElement('script')
    script.src = scriptSrc
    script.setAttribute(BRIDGE_SCRIPT_ATTR, 'true')

    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load bridge client script'))

    document.head.appendChild(script)
  })
}

/**
 * Wait for the bridge to complete its handshake and become ready.
 * Polls window.ethereum.isConnected() every 100ms.
 * Resolves true when connected, rejects on timeout.
 *
 * Uses interval-count based timeout tracking (not Date.now())
 * for compatibility with Jest fake timers in tests.
 */
export function waitForBridgeReady(timeout: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const maxPolls = Math.floor(timeout / POLL_INTERVAL_MS)
    let pollCount = 0

    const checkReady = () => {
      pollCount++
      const provider = getBridgeProvider()
      const isConnected = provider?.isConnected?.()

      if (isConnected) {
        resolve(true)
        return
      }

      if (pollCount >= maxPolls) {
        reject(new Error(`Bridge ready timeout after ${timeout}ms`))
        return
      }

      setTimeout(checkReady, POLL_INTERVAL_MS)
    }

    // Start first poll after interval to allow bridge to initialize
    setTimeout(checkReady, POLL_INTERVAL_MS)
  })
}
