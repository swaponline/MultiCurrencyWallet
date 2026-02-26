## Wallet Apps dApp Guide

This guide is for dApp teams who want their app to run inside MultiCurrencyWallet `#/apps` and use the same connected wallet context.

### 1. Architecture (and how it compares to Safe Apps)

Our model is the same high-level pattern as Safe Apps:

- dApp runs inside cross-origin iframe
- wallet host and dApp communicate via `postMessage`
- dApp gets EIP-1193-compatible provider object

Host-side files in this project:

- `src/front/shared/pages/Apps/walletBridge.ts`
- `src/front/shared/pages/Apps/Apps.tsx`

Client shim served by host:

- `/wallet-apps-bridge-client.js`

### 2. Can we reuse Safe (Gnosis) Apps SDK/provider directly?

Short answer: not as a drop-in.

What can be reused:

- the architectural pattern (iframe + postMessage + request/response envelope)
- security practices (origin checks, explicit method policy)
- EIP-1193 facade approach in dApp

What is different:

- Safe SDK/provider is built around Safe-specific APIs and transaction model
- our host protocol/events/method policy are specific to MultiCurrencyWallet bridge

So the recommended path is:

- keep your dApp EIP-1193-compatible
- include our bridge client shim
- do not depend on Safe-only SDK methods unless you also run inside Safe host

### 3. Minimal dApp integration

1. Include the bridge client before your app bundle:

```html
<script src="https://<wallet-host>/wallet-apps-bridge-client.js"></script>
```

2. Keep standard injected-wallet flow in your app:

- `window.ethereum.request({ method: 'eth_requestAccounts' })`
- `window.ethereum.request({ method: 'eth_chainId' })`
- `window.ethereum.on('accountsChanged', ...)`
- `window.ethereum.on('chainChanged', ...)`

3. Open dApp URL with:

```text
?walletBridge=swaponline
```

This forces bridge provider in iframe context when needed.

### 4. Supported RPC policy (host side)

Allowed:

- methods with prefixes: `eth_*`, `wallet_*`, `personal_*`
- exact methods: `net_version`, `web3_clientVersion`

Blocked:

- `eth_subscribe`
- `eth_unsubscribe`

### 5. Provider source in host

Bridge forwards requests to:

1. active connected `web3connect` provider (including external wallets via wallet connect flow), then
2. fallback injected `window.ethereum` provider.

This allows embedded dApp to follow the same connected wallet session as host.

### 6. Uniswap integration note

If you control dApp code (fork/self-host):

- integration works by adding shim and keeping injected-wallet flow.

If you do not control dApp code (pure third-party deployment):

- you usually cannot inject custom bridge script into their production bundle,
- so “same-wallet-in-iframe” is not guaranteed.

For reliable integration with third-party apps, prefer:

- partner-level integration
- your own wrapped/forked deployment with bridge shim enabled

### 7. Security checklist for host integrators

- keep strict iframe host allowlist (`appsCatalog.ts`)
- validate `event.origin` and `event.source` on every message
- keep method policy minimal and explicit
- do not expose unrestricted RPC passthrough

### 8. Feature flag on wallet host

Wallet Apps UI is disabled by default.

Enable it with one of:

- host config: `config.opts.ui.apps.enabled = true`
- runtime flag: `window.SO_WalletAppsEnabled = true`

Additional UI settings:

- `window.SO_AppsHeaderPinned = ['onout-dex']`
- `window.SO_ReplaceExchangeWithAppId = 'onout-dex'`
