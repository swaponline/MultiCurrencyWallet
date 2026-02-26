# Code Research: apps-bridge-autoconnect

Created: 2026-02-26

## 1. Entry Points

### MCW Host Side (branch: issue-5268-apps-layout)

**`src/front/shared/pages/Apps/Apps.tsx`**
React component for the `#/apps/:appId?` route. Renders either a catalog grid or an iframe for the selected app. Creates the bridge via `createWalletAppsBridge()` when `selectedApp.walletBridge === 'eip1193'`. Calls `bridgeRef.current.sendReady()` on iframe load.

Key signatures:
- `const Apps = (props: AppsProps) => { ... }` (functional component)
- `handleAppFrameLoad()` -- calls `bridgeRef.current.sendReady()`

**`src/front/shared/pages/Apps/appsCatalog.ts`**
Defines the app catalog. The Onout DEX entry has `walletBridge: 'eip1193'` and its URL includes `?walletBridge=swaponline`. The allowlist is hardcoded: `EXTERNAL_ALLOWED_HOSTS = new Set(['dex.onout.org'])`.

Key signatures:
- `getWalletAppById(appId?: string): WalletApp | undefined`
- `resolveWalletAppUrl(app: WalletApp, currentLocation?: Location): string`
- `isAllowedWalletAppUrl(appUrl: string, currentLocation?: Location): boolean`

**`src/front/shared/pages/Apps/walletBridge.ts`**
Host-side EIP-1193 bridge. Listens for postMessage from client iframe, forwards EIP-1193 requests to the host's connected provider, relays events back. Provider resolution order: connected `web3connect` provider first, then `window.ethereum` fallback.

Key signatures:
- `createWalletAppsBridge({ iframe, appUrl, onClientHello }): WalletAppsBridge`
- `hasExternalEip1193Provider(): boolean`
- `getEip1193Provider(): Eip1193Provider | null` (internal)
- `asEip1193Provider(providerLike: any): Eip1193Provider | null` (internal, handles legacy send/sendAsync)

**`src/front/client/wallet-apps-bridge-client.js`**
Client-side shim (IIFE, plain JS). Injected into the iframe dApp. Creates a provider object on `window.ethereum` and `window.swapWalletAppsBridgeProvider`. Communicates with host via postMessage.

Key signatures:
- `provider.request(payload): Promise` -- forwards to host via postMessage
- `provider.send(methodOrPayload, params)` -- wraps request()
- `provider.sendAsync(payload, callback)` -- callback style
- `provider.enable()` -- calls eth_requestAccounts
- `provider.isConnected()` -- returns `!!bridgeReady`
- `injectProvider()` -- sets window.ethereum, dispatches `ethereum#initialized` event

**`src/front/shared/routes/index.tsx`** (branch)
Conditionally adds the route: `<Route path={links.apps + '/:appId?'} component={Apps} />` when `externalConfig.opts.ui.apps.enabled` is true. Runtime override: `window.SO_WalletAppsEnabled = true`.

### dApp Side (unifactory / noxonsu/unifactory)

**`src/index.tsx`**
Entry point. Wraps the app with `<Web3ReactProvider>` and a `<Web3ProviderNetwork>` (a second `createWeb3ReactRoot` context for fallback network provider). Uses `@web3-react/core` v6.1.9.

**`src/hooks/index.ts`**
Contains `useEagerConnect()` -- the critical auto-connect hook. Calls `injected.isAuthorized()`, and if authorized, calls `activate(injected)`. On mobile with `window.ethereum` present, always tries to activate. Also contains `useInactiveListener()` which binds `chainChanged` and `accountsChanged` on `window.ethereum`.

**`src/components/Web3ReactManager/index.tsx`**
Calls `useEagerConnect()`. Renders nothing until eager connect is attempted. After that, activates fallback network connector if no active connection.

**`src/components/WalletModal/index.tsx`**
Modal wallet chooser UI. Shows network selection first, then wallet options (MetaMask, WalletConnect, Coinbase). The MetaMask option is shown only when `window.ethereum.isMetaMask` is truthy. When `isMetaMask` is false but `window.ethereum` exists, only the "Injected" option is shown.

**`src/components/Web3Status/index.tsx`**
Renders "Connect Wallet" button that opens WalletModal. If connected, shows shortened address.

**`src/connectors/index.ts`**
Exports `injected = new InjectedConnector({ supportedChainIds: SUPPORTED_CHAIN_IDS })`. Also exports factory functions for WalletConnect and WalletLink connectors.

## 2. Data Layer

No database or persistent data models involved. State flows are:

**MCW Host:**
- Redux state `user.metamaskData` holds connected wallet info (address, chainId, networkVersion)
- `localStorage.getItem('WEB3CONNECT:PROVIDER')` caches the last provider name
- `web3connect._cachedProvider`, `._cachedAddress`, `._cachedChainId` hold session data

**Bridge Protocol (postMessage):**
- Client -> Host: `BRIDGE_HELLO` (handshake), `BRIDGE_REQUEST` (EIP-1193 method call)
- Host -> Client: `BRIDGE_READY` (with accounts, chainId, method policy), `BRIDGE_RESPONSE` (result/error), `BRIDGE_EVENT` (accountsChanged, chainChanged)
- Request payload: `{ requestId, method, params }`
- Response payload: `{ requestId, result }` or `{ requestId, error: { code, message } }`

**Bridge Client State (in-memory):**
- `bridgeReady` (boolean), `currentAccounts` (string[]), `currentChainId` (string|null)
- `provider.chainId`, `provider.selectedAddress` -- updated on BRIDGE_READY and BRIDGE_EVENT

**Unifactory dApp:**
- `@web3-react/core` stores active connector, chainId, account in React context
- Redux store for transactions, application state, user preferences

## 3. Similar Features

**Safe (Gnosis) Apps SDK pattern:**
The bridge architecture follows the same pattern as Safe Apps: iframe + postMessage + request/response envelope. The docs (`WALLET_APPS_DAPP_GUIDE.md`) explicitly note this comparison but state that Safe SDK methods are not compatible since MCW uses its own protocol.

**MCW's own MetaMask/web3connect integration:**
`/src/front/shared/helpers/metamask.ts` demonstrates the pattern MCW uses for wallet connection. The `connect()` function opens `ConnectWalletModal`, which then calls `web3connect.connectTo(SUPPORTED_PROVIDERS.INJECTED)`. The `InjectedProvider` class extends `@web3-react/injected-connector` v6.

**DeFinance bridge integration PR:**
`https://github.com/noxonsu/definance/pull/80` -- a parallel implementation for a different dApp in the same ecosystem. Can be referenced for patterns.

## 4. Integration Points

### Bridge Host -> MCW Wallet Connection

`walletBridge.ts` imports `{ metamask }` from `helpers` and uses:
- `metamask.isConnected()` -- check if wallet is connected
- `metamask.getWeb3()` -- get web3 instance with `.currentProvider`
- `metamask.web3connect.on('connected' | 'disconnect' | 'accountChange' | 'chainChanged', ...)` -- listen for wallet state changes

Provider resolution chain in `getEip1193Provider()`:
1. `getConnectedWeb3Provider()` -- tries `metamask.getWeb3().currentProvider` if `metamask.isConnected()` is true
2. Falls back to `window.ethereum` (raw injected provider)

### Bridge Client -> dApp

The bridge client injects itself as `window.ethereum` using `Object.defineProperty`. It only does this if:
- `window.ethereum` does not already exist, OR
- URL contains `?walletBridge=swaponline` (force mode)

It also always sets `window.swapWalletAppsBridgeProvider = provider` as a named reference.

After injection, it dispatches `window.dispatchEvent(new Event('ethereum#initialized'))` to notify libraries that a provider is available.

### dApp eager connect flow (`useEagerConnect` in unifactory)

1. `injected.isAuthorized()` calls `window.ethereum.send('eth_accounts')` then checks `parseSendReturn(result).length > 0`
2. If authorized, calls `activate(injected)` which calls `InjectedConnector.activate()`
3. `activate()` binds event listeners on `window.ethereum` (chainChanged, accountsChanged, close, networkChanged)
4. Calls `window.ethereum.send('eth_requestAccounts')` then `window.ethereum.enable()` as fallback
5. Returns `{ provider: window.ethereum, account }` which sets the web3-react context as active

### Shared Dependencies

- `@web3-react/injected-connector` v6.0.7 (used by both MCW InjectedProvider and unifactory)
- `@web3-react/abstract-connector` (base class)
- `@web3-react/core` v6 (unifactory only)

## 5. Existing Tests

**MCW (branch issue-5268-apps-layout):**

`tests/unit/appsCatalog.test.ts` -- Jest unit tests for catalog functions:
```
describe('Wallet Apps Catalog', () => {
  it('uses onout-dex as default app for first approximation', ...)
  it('resolves internal app route into host hash url', ...)
  it('allows only configured external hosts in allowlist', ...)
})
```

`tests/e2e/walletAppsBridge.smoke.js` -- Puppeteer e2e test. Opens the preview URL at `#/apps`, clicks Onout DEX, waits for iframe, checks that `window.swapWalletAppsBridgeProvider` exists in the iframe and that `window.ethereum.isSwapWalletAppsBridge` is true. Checks `isConnected()` state. Takes screenshots.

Framework: Jest (unit), Puppeteer (e2e)
Runner: `npm run test:unit` (Jest), manual for e2e

**Unifactory:**
Uses standard Jest + React Testing Library setup. Various utility tests exist (`chunkArray.test.ts`, `index.test.ts`, `prices.test.ts`, etc.) but no specific tests for wallet connection flow or bridge compatibility.

## 6. Shared Utilities

**`/src/common/web3connect/index.ts` (Web3Connect class)**
EventEmitter-based wallet connection manager. Manages provider lifecycle, caches connection in localStorage. Key methods: `connectTo(provider)`, `isConnected()`, `getWeb3()`, `getAddress()`, `getChainId()`, `Disconnect()`.

**`/src/common/web3connect/providers/InjectedProvider.ts`**
Extends `@web3-react/injected-connector` InjectedConnector. Adds `Connect()`, `Disconnect()`, `isConnected()`, `isLocked()` wrappers.

**`/src/common/web3connect/providers/index.ts`**
Factory function `getProviderByName(web3connect, providerName, newInstance?)`. Returns cached InjectedProvider or WalletConnectProviderV2 instances. Also exports `isInjectedEnabled()` which checks `window.ethereum` existence.

**`/src/front/shared/helpers/metamask.ts`**
Singleton API for MetaMask/external wallet interactions. Initializes Web3Connect, handles connect/disconnect events, manages redux state. Exposes: `connect()`, `isConnected()`, `getAddress()`, `getWeb3()`, `switchNetwork()`, `handleConnectMetamask()`.

**`/src/common/web3connect/providers/InjectedType.ts`**
Enum-like object for detected injected wallet types: NONE, UNKNOWN, OPERA, METAMASK, TRUST, LIQUALITY. Used by `Web3Connect.getInjectedType()` which checks `window.ethereum.isMetaMask`, `window.ethereum.isTrust`, etc.

## 7. Potential Problems

### P1: Bridge client `isMetaMask` is false -- dApp hides MetaMask option

**Current bridge client:** `provider.isMetaMask = false`

**Unifactory WalletModal logic:**
```javascript
const isMetamask = window.ethereum?.isMetaMask
// ...
if (option.name === WALLET_NAMES.METAMASK && !isMetamask) return null
```

When `isMetaMask` is false, the MetaMask wallet option is hidden. The "Injected" option IS shown (since `window.ethereum` exists), but users won't see the familiar MetaMask branding.

**MCW Web3Connect.getInjectedType():**
```javascript
if (window.ethereum.isMetaMask) return INJECTED_TYPE.METAMASK
```
Returns `UNKNOWN` when bridge provider lacks `isMetaMask`.

**Fix needed:** Set `isMetaMask: true` on bridge client provider to ensure both MCW host detection and dApp MetaMask UI recognition work.

### P2: Timing race -- bridge not ready when dApp calls eth_accounts

The bridge client IIFE runs immediately but the actual bridge connection (HELLO -> READY handshake) takes time:
- Client sends HELLO immediately AND every 750ms up to 20 times
- Host responds with READY containing accounts and chainId

Meanwhile, dApp's `useEagerConnect()` runs on mount:
1. Calls `injected.isAuthorized()` -> `window.ethereum.send('eth_accounts')`
2. Bridge client forwards this as BRIDGE_REQUEST to host
3. Host receives it, calls actual provider's `eth_accounts`, responds

There's a potential race if:
- The bridge HELLO has not been received by host yet
- The host has not sent READY yet
- But the dApp already sends eth_accounts request

The bridge client will still forward the request (it posts to `window.parent` regardless of `bridgeReady` state). The host message handler will process it if `targetOrigin` matches. So the request should work even before READY, BUT the host needs to have already set up its message listener.

The host bridge is created in the Apps.tsx `useEffect` when `needsBridge && isAllowedAppUrl` and `iframeRef.current` exists. The bridge sends READY as part of `createWalletAppsBridge` (`sendReady()` is called immediately) AND again on iframe load (`handleAppFrameLoad`). This ordering should be fine since the host bridge is created before the iframe content loads.

### P3: Bridge client `send()` return format vs InjectedConnector expectations

`InjectedConnector.activate()` calls `window.ethereum.send('eth_requestAccounts')` and expects the result to be compatible with `parseSendReturn()`:
```javascript
function parseSendReturn(sendReturn) {
  return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn;
}
```

Bridge client's `send()` returns a Promise that resolves to the raw result (e.g., `['0x123...']`). The `parseSendReturn` receives the array directly (since `.then()` unwraps the Promise) and returns it as-is since arrays don't have a `result` property. Then `[0]` gets the first account. This should work correctly.

However, `InjectedConnector.getChainId()` tries multiple approaches:
1. `window.ethereum.send('eth_chainId').then(parseSendReturn)` -- works, bridge returns hex chainId string
2. Falls back to `window.ethereum.chainId` -- bridge client sets this from BRIDGE_READY payload, BUT only after READY is received

If chainId fetch happens before READY, `window.ethereum.chainId` is `null`, which could cause issues with `InjectedConnector.getChainId()` if the send-based approach also fails.

### P4: `connect` event not emitted in standard EIP-1193 pattern

The bridge client emits `'connect'` with `{ chainId }` when BRIDGE_READY is received. This is correct per EIP-1193. However, `@web3-react/injected-connector` v6 does NOT listen for the `connect` event -- it only uses `chainChanged`, `accountsChanged`, `close`, and `networkChanged`. So the `connect` event is not critical for web3-react but may matter for other libraries.

### P5: `ethereum#initialized` event fires before READY handshake

Bridge client dispatches `ethereum#initialized` immediately in `injectProvider()`, before the bridge is ready. Some wallets wait for this event to start using the provider. Libraries that respond to this event may call `eth_accounts` immediately, hitting the timing issue from P2.

### P6: No `connect` event from dApp perspective without explicit auto-connect logic

Even if `useEagerConnect` works (eth_accounts returns accounts via bridge), the dApp still needs to call `activate(injected)` to set up the web3-react context. `useEagerConnect` handles this, but ONLY if `isAuthorized()` returns true. If the bridge timing causes `eth_accounts` to return empty accounts on the first call, `useEagerConnect` sets `tried = true` and never retries.

### P7: The bridge client is NOT loaded in the dApp currently

The production deployment at `dex.onout.org` does NOT include the bridge client script. The `public/index.html` of unifactory has no `<script>` tag for `wallet-apps-bridge-client.js`. The bridge client needs to be explicitly added to the dApp's HTML or loaded dynamically.

The MCW host side copies the bridge client JS to its build output (via CopyWebpackPlugin in `webpack/externalConfig.js`), making it available at `https://<wallet-host>/wallet-apps-bridge-client.js`. But the dApp iframe needs to include it.

## 8. Constraints & Infrastructure

**MCW Build:**
- Webpack 5 custom config
- `wallet-apps-bridge-client.js` copied to build output by CopyWebpackPlugin in `webpack/externalConfig.js`
- Bridge client is plain ES5 IIFE (no transpilation needed)
- Feature gated: `config.opts.ui.apps.enabled` or `window.SO_WalletAppsEnabled = true`

**Unifactory Build:**
- Create React App (CRA) based
- `@web3-react/core` v6.1.9, `@web3-react/injected-connector` v6.0.7
- Package manager: npm
- Deployed to `dex.onout.org`

**Cross-Origin Constraints:**
- iframe sandbox: `allow-forms allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox`
- postMessage origin validation on both sides
- Bridge client uses `bridgeOrigin = '*'` initially, then locks to host origin on first BRIDGE_READY message
- Host validates `event.origin` against `targetOrigin` derived from `appUrl`

**Method Policy (host side):**
- Allowed prefixes: `eth_*`, `wallet_*`, `personal_*`
- Allowed exact: `net_version`, `web3_clientVersion`
- Blocked: `eth_subscribe`, `eth_unsubscribe`
- Error code 4200 for disallowed methods

**Dependencies version constraints:**
- `@web3-react` v6 (both projects) -- NOT v8, so no wagmi/viem patterns
- web3.js v1.10 (MCW), web3.js and ethers.js v5 (unifactory)

## 9. External Libraries

### @web3-react/injected-connector v6.0.7

Key behavior for bridge compatibility:

**`isAuthorized()`** -- calls `window.ethereum.send('eth_accounts')`, uses `parseSendReturn()` to unwrap, returns true if accounts.length > 0. This is the gate for auto-connect.

**`activate()`** -- subscribes to `chainChanged`, `accountsChanged`, `close`, `networkChanged` on `window.ethereum`. Calls `window.ethereum.send('eth_requestAccounts')` for account access. Falls back to `window.ethereum.enable()`. Returns `{ provider: window.ethereum, account? }`.

**`getChainId()`** -- tries `send('eth_chainId')`, then `send('net_version')`, then sync `send({ method: 'net_version' })`, then falls back to `window.ethereum.chainId || .netVersion || .networkVersion || ._chainId`.

**`getProvider()`** -- returns `window.ethereum` directly.

**`deactivate()`** -- removes all event listeners from `window.ethereum`.

### @web3-react/core v6.1.9

`useWeb3React()` returns `{ connector, library, chainId, account, activate, deactivate, active, error }`. The `library` is created from the provider by the `getLibrary` function passed to `Web3ReactProvider`.

`activate(connector)` calls `connector.activate()` then stores the result. Sets `active = true` which triggers UI updates throughout the app.

### Key API surface the bridge provider must implement

For full compatibility with `@web3-react/injected-connector` v6:

| Property/Method | Required | Notes |
|---|---|---|
| `request({ method, params })` | Yes | EIP-1193 standard |
| `send(methodOrPayload, callbackOrParams?)` | Yes | Used by InjectedConnector.activate() and isAuthorized() |
| `sendAsync(payload, callback)` | Nice to have | Legacy web3 1.0 |
| `enable()` | Yes | Fallback in activate() |
| `on(event, handler)` | Yes | For chainChanged, accountsChanged, close, networkChanged |
| `removeListener(event, handler)` | Yes | For cleanup in deactivate() |
| `isConnected()` | Yes | Standard EIP-1193 |
| `isMetaMask` | Recommended | Controls UI in WalletModal (MetaMask vs Injected label) |
| `chainId` | Recommended | Sync fallback in getChainId() |
| `selectedAddress` | Nice to have | Some libraries check this |
| `autoRefreshOnNetworkChange` | Nice to have | Set to false by InjectedConnector if isMetaMask is true |

### Bridge client current implementation status

| Property/Method | Implemented | Issue |
|---|---|---|
| `request()` | Yes | Works correctly via postMessage |
| `send()` | Yes | Returns Promise (compatible with InjectedConnector) |
| `sendAsync()` | Yes | Callback style, wraps request() |
| `enable()` | Yes | Calls eth_requestAccounts |
| `on()` | Yes | Local event emitter |
| `removeListener()` | Yes | Filters listener array |
| `removeAllListeners()` | Yes | Extra, not required |
| `isConnected()` | Yes | Returns bridgeReady state |
| `isMetaMask` | **false** | PROBLEM: Should be true for auto-detect |
| `isSwapWalletAppsBridge` | Yes | Custom flag for identification |
| `chainId` | Yes | Set on BRIDGE_READY |
| `selectedAddress` | Yes | Set on BRIDGE_READY |

## 10. Root Cause Analysis: Why dApp Shows Wallet Chooser

The auto-connect failure is caused by a combination of issues:

### Issue A: Bridge client not loaded in dApp (BLOCKER)

`dex.onout.org` does not include `<script src="wallet-apps-bridge-client.js">` in its HTML. Without this script, the bridge provider is never injected as `window.ethereum` in the iframe, so the dApp falls back to its normal "no provider" state and shows the wallet chooser.

### Issue B: `isMetaMask = false` hides MetaMask option (UX issue)

Even if the bridge client were loaded, `isMetaMask: false` means the WalletModal in unifactory will not show the MetaMask option (the most recognizable wallet). The "Injected" option would appear instead, which is less familiar to users.

### Issue C: No auto-connect bypass for bridge context

The unifactory dApp always shows the WalletModal when not connected. There is no logic to detect "I'm running inside a wallet bridge iframe, skip the modal and auto-connect." The `useEagerConnect` hook would auto-connect IF `isAuthorized()` returns true (i.e., `eth_accounts` returns non-empty accounts), but this requires the bridge to be ready and the host wallet to be connected.

### Required Changes

**MCW Bridge Client (`wallet-apps-bridge-client.js`):**
1. Set `isMetaMask: true` on the provider object
2. Ensure `eth_accounts` returns accounts even before explicit READY handshake (or ensure READY comes fast enough)

**Unifactory dApp (`noxonsu/unifactory`):**
1. Add `<script src="wallet-apps-bridge-client.js">` to `public/index.html` (or load dynamically)
2. In `useEagerConnect`, detect bridge context (`window.ethereum?.isSwapWalletAppsBridge`) and auto-activate without waiting for `isAuthorized()`
3. Alternatively, listen for `bridgeReady` event on `window.ethereum` and retry eager connect
4. Suppress WalletModal when bridge is active and connected

### File-Level Change Map

| File | Side | Change |
|---|---|---|
| `src/front/client/wallet-apps-bridge-client.js` | MCW | Set `isMetaMask: true` |
| `public/index.html` | unifactory | Add bridge client script tag |
| `src/hooks/index.ts` | unifactory | Add bridge-aware eager connect logic |
| `src/components/WalletModal/index.tsx` | unifactory | Skip modal in bridge mode |
| `src/components/Web3ReactManager/index.tsx` | unifactory | Handle bridge ready event for late connection |
