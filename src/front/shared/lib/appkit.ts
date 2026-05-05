/**
 * Reown AppKit + Wagmi v2 initialization
 *
 * Replaces the custom Web3Connect / @web3-react stack.
 * All EVM networks from externalConfig are registered as wagmi chains.
 *
 * Usage:
 *   import { modal, wagmiConfig } from 'lib/appkit'
 *   modal.open()                    // open connect modal
 *   getAccount(wagmiConfig)         // current account
 *   watchAccount(wagmiConfig, {...}) // subscribe to changes
 */

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { reconnect } from '@wagmi/core'
import config from 'helpers/externalConfig'

// ---------------------------------------------------------------------------
// Build wagmi chain objects from externalConfig.evmNetworks
// ---------------------------------------------------------------------------

function buildChains(): AppKitNetwork[] {
  return Object.values(config.evmNetworks).map(
    (n: EvmNetworkConfig): AppKitNetwork => ({
      id: n.networkVersion,
      name: n.chainName,
      caipNetworkId: `eip155:${n.networkVersion}`,
      chainNamespace: 'eip155',
      nativeCurrency: {
        name: n.currency,
        symbol: n.currency,
        decimals: 18,
      },
      rpcUrls: {
        default: { http: n.rpcUrls },
      },
      blockExplorers: n.blockExplorerUrls?.length
        ? { default: { name: n.chainName, url: n.blockExplorerUrls[0] } }
        : undefined,
    })
  )
}

const chains = buildChains()

// Fallback to ETH mainnet if config has no networks at initialisation time
const networksForAdapter =
  chains.length > 0
    ? (chains as [AppKitNetwork, ...AppKitNetwork[]])
    : ([
        {
          id: 1,
          name: 'Ethereum',
          caipNetworkId: 'eip155:1',
          chainNamespace: 'eip155',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: { default: { http: ['https://cloudflare-eth.com'] } },
        },
      ] as [AppKitNetwork, ...AppKitNetwork[]])

const projectId: string = config.api?.WalletConnectProjectId || 'a23677c4af3139b4eccb52981f76ad94'

// ---------------------------------------------------------------------------
// WagmiAdapter — wraps wagmi config + connectors
// ---------------------------------------------------------------------------

export const wagmiAdapter = new WagmiAdapter({
  networks: networksForAdapter,
  projectId,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

// ---------------------------------------------------------------------------
// MCW theme helpers — sync AppKit with MCW's CSS variables and data-scheme
// ---------------------------------------------------------------------------

function getMcwThemeMode(): 'light' | 'dark' {
  return document.body?.dataset?.scheme === 'dark' ? 'dark' : 'light'
}

function getMcwThemeVariables(): Record<string, string> {
  const style = getComputedStyle(document.documentElement)
  const accent = style.getPropertyValue('--color-brand').trim() || '#6144e5'
  const borderRadius = style.getPropertyValue('--button-border-radius').trim() || '2px'
  return {
    '--w3m-accent': accent,
    '--w3m-border-radius-master': borderRadius,
  }
}

// ---------------------------------------------------------------------------
// AppKit modal — WalletConnect + Browser Wallets (MetaMask etc.) + Coinbase
// ---------------------------------------------------------------------------

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: networksForAdapter,
  projectId,
  metadata: {
    name: 'SwapOnline',
    description: 'P2P Atomic Swap Exchange',
    url:
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://swaponline.github.io',
    icons: ['https://swaponline.github.io/favicon.png'],
  },
  themeMode: getMcwThemeMode(),
  themeVariables: getMcwThemeVariables(),
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  allowUnsupportedChain: true,
})

// Sync AppKit theme when MCW user switches light/dark
if (typeof MutationObserver !== 'undefined') {
  new MutationObserver(() => {
    modal.setThemeMode(getMcwThemeMode())
    modal.setThemeVariables(getMcwThemeVariables())
  }).observe(document.body, { attributes: true, attributeFilter: ['data-scheme'] })
}

// Restore previous wallet session from localStorage
reconnect(wagmiConfig)

export default modal
